import type { SourceProviders } from "@tokenlens/core";
import type { CatalogGatewayId } from "@tokenlens/fetch";

export const DEFAULT_GATEWAY_ID = "openrouter" satisfies CatalogGatewayId;
export type GatewayId = CatalogGatewayId;

export type CacheEntry = { value: SourceProviders; expiresAt: number };

export interface CacheAdapter {
  get(key: string): Promise<CacheEntry | undefined> | CacheEntry | undefined;
  set(key: string, entry: CacheEntry): Promise<void> | void;
  delete?(key: string): Promise<void> | void;
}

export type TokenlensOptions = {
  catalog?: GatewayId | SourceProviders;
  overrides?: SourceProviders;
  ttlMs?: number;
  fetch?: typeof globalThis.fetch;
  cache?: CacheAdapter;
  cacheKey?: string;
};
