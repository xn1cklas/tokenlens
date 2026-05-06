import type { SourceProviders } from "@tokenlens/core";

export const GATEWAY_IDS = [
  "auto",
  "openrouter",
  "models.dev",
  "vercel",
  "package",
] as const;
export type GatewayId = (typeof GATEWAY_IDS)[number];

export type CacheEntry = { value: SourceProviders; expiresAt: number };

export interface CacheAdapter {
  get(key: string): Promise<CacheEntry | undefined> | CacheEntry | undefined;
  set(key: string, entry: CacheEntry): Promise<void> | void;
  delete?(key: string): Promise<void> | void;
}

export type TokenlensOptions = {
  catalog?: GatewayId | SourceProviders;
  ttlMs?: number;
  fetch?: typeof globalThis.fetch;
  cache?: CacheAdapter;
  cacheKey?: string;
};
