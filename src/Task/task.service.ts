import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { WalletData } from './types';

@Injectable()
export class TaskService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private supabase: SupabaseClient;

  constructor() {
    this.provider = new ethers.JsonRpcProvider('https://rpc.berachain.com');
    const tokenAddress = process.env.TOKEN_CONTRACT_ADDRESS!;

    const abi = [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function totalSupply() view returns (uint256)',
      'function balanceOf(address) view returns (uint256)',
    ];

    this.supabase = createClient(
      `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`,
      process.env.SUPABASE_ANON_KEY!,
    );

    this.contract = new ethers.Contract(tokenAddress, abi, this.provider);

    this.snapshotTreasureTokens();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async snapshotTreasure() {
    try {
      const [totalBalance, totalSupply, tokenPrice] = await Promise.all([
        fetch(
          `https://pro-openapi.debank.com/v1/user/total_balance?id=${process.env.TREASURE_WALLET_ADDRESS}`,
          {
            headers: {
              AccessKey: process.env.DEBANK_API_KEY!,
              'content-type': 'application/json',
            },
          },
        ).then((res) => res.json()),
        this.contract.totalSupply(),
        fetchPrice(await this.contract.getAddress()),
      ]);

      const decimals = await this.contract.decimals();
      const totalSupplyNumber = ethers.formatUnits(totalSupply, decimals);

      const { data, error } = await this.supabase
        .from('treasure_history')
        .insert({
          total_usd_value: Math.floor(totalBalance.total_usd_value),
          total_supply: Math.floor(+totalSupplyNumber),
          token_price: tokenPrice,
          backing: Number(totalBalance.total_usd_value / +totalSupplyNumber),
        })
        .select();

      console.log(data, error);
    } catch (error) {
      console.error(error);
    }
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  async snapshotTreasureTokens() {
    try {
      const data: WalletData[] = await fetch(
        `https://pro-openapi.debank.com/v1/user/all_token_list?id=${process.env.TREASURE_WALLET_ADDRESS}&chain_ids=eth,bera`,
        {
          headers: {
            AccessKey: process.env.DEBANK_API_KEY!,
            'content-type': 'application/json',
          },
        },
      ).then((res) => res.json());

      const hydratedData = data.map((token) => {
        return {
          symbol: token.symbol,
          price: token.price,
          amount: token.amount,
          chain: token.chain,
          name: token.name,
          display_symbol: token.display_symbol,
          optimized_symbol: token.optimized_symbol,
          decimals: token.decimals,
          logo_url: token.logo_url,
          protocol_id: token.protocol_id,
        };
      });

      await this.supabase.from('tokens').upsert({
        id: 1,
        updated_at: Date.now(),
        tokens: JSON.stringify(hydratedData),
      });
    } catch (error) {
      console.error(error);
    }
  }
}

function fetchPrice(address: string) {
  return fetch('https://api.berachain.com/', {
    headers: {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
      'content-type': 'application/json',
      priority: 'u=1, i',
      'sec-ch-ua':
        '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      Referer: 'https://www.beraflow.com/',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    body: `{"operationName":"GetTokenCurrentPrices","variables":{"chains":["BERACHAIN"],"addressIn": ["${address}"]},"query":"query GetTokenCurrentPrices($chains: [GqlChain!]!, $addressIn: [String!]!) {\\n  tokenGetCurrentPrices(chains: $chains, addressIn: $addressIn) {\\n    address\\n    chain\\n    price\\n    updatedAt\\n    updatedBy\\n    __typename\\n  }\\n}"}`,
    method: 'POST',
  })
    .then((res) => res.json())
    .then((data) => data.data.tokenGetCurrentPrices[0].price);
}
