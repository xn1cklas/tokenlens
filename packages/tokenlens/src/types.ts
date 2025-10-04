import type { SourceProviders } from "@tokenlens/core";

export type FetchLike = (
  input: string,
  init?: { signal?: unknown } & Record<string, unknown>,
) => Promise<{
  ok: boolean;
  status: number;
  statusText: string;
  json(): Promise<unknown>;
  text(): Promise<string>;
}>;

export const GATEWAY_IDS = [
  "auto",
  "openrouter",
  "models.dev",
  "package",
] as const;
export type GatewayId = (typeof GATEWAY_IDS)[number];

export type CacheEntry = { value: SourceProviders; expiresAt: number };

export type SourceLoader = (fetchImpl: FetchLike) => Promise<SourceProviders>;

export interface CacheAdapter {
  get(key: string): Promise<CacheEntry | undefined> | CacheEntry | undefined;
  set(key: string, entry: CacheEntry): Promise<void> | void;
  delete?(key: string): Promise<void> | void;
}

export type TokenlensOptions = {
  catalog?: GatewayId | SourceProviders;
  ttlMs?: number;
  fetch?: FetchLike;
  cache?: CacheAdapter;
  cacheKey?: string;
};
