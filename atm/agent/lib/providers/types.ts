export type ProviderId = "trading212" | "revolut";

export interface NormalizedBalance {
  externalAccountId: string;
  accountName: string;
  balance: number;
  currency: string;
  fetchedAt: string;
  metadata?: Record<string, unknown>;
}

export interface ProviderAdapter {
  id: ProviderId;
  fetchBalances(): Promise<NormalizedBalance[]>;
}

export interface ProviderLink {
  sheetAccount: string;
  sheetSection: "assets" | "liabilities";
  provider: ProviderId;
  externalAccountId: string;
  balanceField: string;
}
