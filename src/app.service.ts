import { Injectable } from '@nestjs/common';
import { ApiVaultsResponse } from './types';

@Injectable()
export class AppService {
  constructor() {}

  getHello(): string {
    return 'ok';
  }

  getVaults(): Promise<ApiVaultsResponse> {
    return fetch(`${process.env.BALANCER_API}`, {
      "headers": {
        "content-type": "application/json",
      },
      "body": "{\"operationName\":\"GetVaults\",\"variables\":{\"orderBy\":\"apr\",\"orderDirection\":\"desc\",\"pageSize\":300,\"where\":{\"includeNonWhitelisted\":false}},\"query\":\"query GetVaults($where: GqlRewardVaultFilter, $pageSize: Int, $skip: Int, $orderBy: GqlRewardVaultOrderBy = bgtCapturePercentage, $orderDirection: GqlRewardVaultOrderDirection = desc, $search: String) {\\n  polGetRewardVaults(\\n    where: $where\\n    first: $pageSize\\n    skip: $skip\\n    orderBy: $orderBy\\n    orderDirection: $orderDirection\\n    search: $search\\n  ) {\\n    pagination {\\n      currentPage\\n      totalCount\\n      __typename\\n    }\\n    vaults {\\n      ...ApiVault\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment ApiVault on GqlRewardVault {\\n  id: vaultAddress\\n  vaultAddress\\n  address: vaultAddress\\n  isVaultWhitelisted\\n  dynamicData {\\n    allTimeReceivedBGTAmount\\n    apr\\n    bgtCapturePercentage\\n    activeIncentivesValueUsd\\n    activeIncentivesRateUsd\\n    __typename\\n  }\\n  stakingToken {\\n    address\\n    name\\n    symbol\\n    decimals\\n    __typename\\n  }\\n  metadata {\\n    name\\n    logoURI\\n    url\\n    protocolName\\n    description\\n    __typename\\n  }\\n  activeIncentives {\\n    ...ApiVaultIncentive\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment ApiVaultIncentive on GqlRewardVaultIncentive {\\n  active\\n  remainingAmount\\n  remainingAmountUsd\\n  incentiveRate\\n  tokenAddress\\n  token {\\n    address\\n    name\\n    symbol\\n    decimals\\n    __typename\\n  }\\n  __typename\\n}\"}",
      "method": "POST",
    }).then((res) => res.json());
  }
}
