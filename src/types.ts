// Define interfaces for the reward vault data structure

export interface GqlPagination {
  currentPage: number;
  totalCount: number;
  __typename: string;
}

export interface GqlToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  __typename: string;
}

export interface GqlRewardVaultDynamicData {
  allTimeReceivedBGTAmount: string;
  apr: string;
  bgtCapturePercentage: string;
  activeIncentivesValueUsd: string;
  activeIncentivesRateUsd: string;
  __typename: string;
}

export interface GqlRewardVaultIncentive {
  active: boolean;
  remainingAmount: string;
  remainingAmountUsd: string;
  incentiveRate: string;
  tokenAddress: string;
  token: GqlToken;
  __typename: string;
}

export interface GqlRewardVault {
  id: string;
  vaultAddress: string;
  address: string;
  isVaultWhitelisted: boolean;
  dynamicData: GqlRewardVaultDynamicData;
  stakingToken: GqlToken;
  metadata: any;
  activeIncentives: GqlRewardVaultIncentive[];
  __typename: string;
}

export interface PolGetRewardVaultsResponse {
  pagination: GqlPagination;
  vaults: GqlRewardVault[];
}

export interface ApiVaultsResponse {
  data: {
    polGetRewardVaults: PolGetRewardVaultsResponse;
  };
}