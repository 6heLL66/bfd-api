import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';
import { CronExpression } from '@nestjs/schedule';
import { Cron } from '@nestjs/schedule';
import { ethers } from 'ethers';

@Injectable()
export class FBGTService {
  private supabase: SupabaseClient;
  private provider: ethers.JsonRpcProvider;
  private autoMintManager: ethers.Wallet;
  private autoMintAndStakeManager: ethers.Wallet;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.RPC_URL as string,
    );

    this.autoMintManager = new ethers.Wallet(
      process.env.AUTOMINT_MANAGER_PRIVATE_KEY as string,
      this.provider,
    );

    this.autoMintAndStakeManager = new ethers.Wallet(
      process.env.AUTIMINTANDSTAKE_MANAGER_PRIVATE_KEY as string,
      this.provider,
    );

    this.supabase = createClient(
        `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`,
        process.env.SUPABASE_ANON_KEY!,
      );

      this.subscribeToManagerSetEvent();
  }
  async executeAutoMint() {
    const subscriptions = await this.supabase.from('subscribtions').select<'*', {account: string, rewardVault: string, manager: string}>('*');

    if (!subscriptions.data) {
        return;
    }

    console.log('Subscriptions:', subscriptions.data);

    let autoMintApplicants: {rewardVault: string, account: string}[] = [];
    let autoMintAndStakeApplicants: {rewardVault: string, account: string}[] = [];

    for (const subscription of subscriptions.data) {
        const account = subscription.account;
        const rewardVault = subscription.rewardVault;
        const manager = subscription.manager;

      if (manager === this.autoMintManager.address) {
        autoMintApplicants.push({rewardVault, account});
        autoMintAndStakeApplicants = autoMintAndStakeApplicants.filter(applicant => applicant.rewardVault === rewardVault && applicant.account === account);
      }

      if (manager === this.autoMintAndStakeManager.address) {
        autoMintAndStakeApplicants.push({rewardVault, account});
        autoMintApplicants = autoMintApplicants.filter(applicant => applicant.rewardVault === rewardVault && applicant.account === account);
      }
    }

    await Promise.all([
      this.mintMulti(autoMintApplicants, this.autoMintManager),
      this.mintMulti(autoMintAndStakeApplicants, this.autoMintAndStakeManager),
    ]);

    // TODO: stake fbgt
  }

  async mintMulti(applicants: {rewardVault: string, account: string}[], manager: ethers.Wallet) {
    if (applicants.length === 0) {
        return;
    }
    const eventABI = [
        'function mintMulti(address[] calldata users, address[] calldata rewardVaults, address[] calldata recipients)',
    ];
    const contractInterface = new ethers.Interface(eventABI);
    const contract = new ethers.Contract(
      process.env.BERAFLOW_FORGE_CA as string,
      contractInterface,
      manager,
    );

    const tx = await contract.mintMulti(
        applicants.map(applicant => applicant.account),
        applicants.map(applicant => applicant.rewardVault),
        applicants.map(applicant => applicant.account),
    );

    return tx;
  }

  async getSubscriptions() {
    const {data, error} = await this.supabase.from('subscribtions').select('*');
    if (error) {
        console.error('Error getting subscriptions:', error);
    }
    return data;
  }

  async getManagers() {
    return {
        autoMintManager: this.autoMintManager.address,
        autoMintAndStakeManager: this.autoMintAndStakeManager.address,
    }
  }

  subscribeToManagerSetEvent() {
    try {
      const eventABI = [
        'event ManagerSet(address indexed account, address indexed rewardVault, address indexed manager)',
      ];
      const contractInterface = new ethers.Interface(eventABI);
      const contract = new ethers.Contract(
        process.env.BERAFLOW_FORGE_CA as string,
        contractInterface,
        this.provider,
      );
      const filter = contract.filters.ManagerSet();

      contract.on(filter, async (paylaod) => {
        const {data, error} = await this.supabase.from('subscribtions').upsert({
            account: paylaod.args[0],
            rewardVault: paylaod.args[1],
            manager: paylaod.args[2],
        })
        if (error) {
            console.error('Error subscribing to ManagerSet event:', error);
            return false;
        }
        console.log('Subscribed to AutoMint event', paylaod.args[0], paylaod.args[1], paylaod.args[2]);
      });
    } catch (error) {
      console.error('Error subscribing to ManagerSet event:', error);
      return false;
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async autoMint() {
    await this.executeAutoMint();
  }
}
