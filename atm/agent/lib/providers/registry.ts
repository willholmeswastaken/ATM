import type { ProviderAdapter, ProviderId } from "./types.js";

const adapters = new Map<ProviderId, ProviderAdapter>();

export function registerProvider(adapter: ProviderAdapter): void {
  adapters.set(adapter.id, adapter);
}

export function getProvider(id: ProviderId): ProviderAdapter | undefined {
  return adapters.get(id);
}

export function listProviders(): ProviderId[] {
  return [...adapters.keys()];
}

/** Phase 3: Trading212 and Revolut adapters register here. */
