import type { ProviderId, ProviderLink } from "./providers/types.js";

/** Phase 3: populate from config or env. Empty in v1. */
export const PROVIDER_LINKS: ProviderLink[] = [];

export function getLinksForProvider(provider: ProviderId): ProviderLink[] {
  return PROVIDER_LINKS.filter((link) => link.provider === provider);
}

export function getLinkForSheetAccount(
  sheetAccount: string,
  section: "assets" | "liabilities",
): ProviderLink | undefined {
  return PROVIDER_LINKS.find(
    (link) =>
      link.sheetAccount.toLowerCase() === sheetAccount.toLowerCase() &&
      link.sheetSection === section,
  );
}

export type { ProviderId, ProviderLink } from "./providers/types.js";
