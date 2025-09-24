import type { Providers } from "@tokenlens/core/dto";

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

export type SourceId = "openrouter" | "models.dev" | "package";

export type CacheEntry = { value: Providers; expiresAt: number };

export type SourceLoader = (fetchImpl: FetchLike) => Promise<Providers>;

export interface CacheAdapter {
  get(key: string): Promise<CacheEntry | undefined> | CacheEntry | undefined;
  set(key: string, entry: CacheEntry): Promise<void> | void;
  delete?(key: string): Promise<void> | void;
}

export type TokenlensOptions = {
  sources?: ReadonlyArray<SourceId>;
  ttlMs?: number;
  fetch?: FetchLike;
  cache?: CacheAdapter;
  loaders?: Partial<Record<SourceId, SourceLoader>>;
  cacheKey?: string;
};
