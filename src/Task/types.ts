export interface WalletData {
  id: string;
  chain: string;
  name: string;
  symbol: string;
  display_symbol: string | null;
  optimized_symbol: string;
  decimals: number;
  logo_url: string;
  protocol_id: string;
  price: number;
  price_24h_change: number;
  is_verified: boolean;
  is_core: boolean;
  is_wallet: boolean;
  time_at: string | null;
  amount: number;
  raw_amount: number;
  raw_amount_hex_str: string;
}

export interface TotalAccountBalance {
  total_usd_value: number;
}
