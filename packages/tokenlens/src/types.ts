import type { SourceProviders } from "@tokenlens/core";
import type {
  CatalogSource,
  CatalogId as FetchCatalogId,
  FetchLike,
} from "@tokenlens/fetch";

export const DEFAULT_CATALOG_ID = "openrouter" satisfies FetchCatalogId;
export type CatalogId = FetchCatalogId;
export type Catalog = CatalogId | CatalogSource | SourceProviders;
export type TokenCounter = (args: {
  modelId: string;
  data: string;
}) => Promise<number | undefined> | number | undefined;

export type CacheEntry = { value: SourceProviders; expiresAt: number };

export interface CacheAdapter {
  get(key: string): Promise<CacheEntry | undefined> | CacheEntry | undefined;
  set(key: string, entry: CacheEntry): Promise<void> | void;
  delete?(key: string): Promise<void> | void;
}

export type TokenlensOptions = {
  catalog?: Catalog;
  overrides?: SourceProviders;
  ttlMs?: number;
  fetch?: FetchLike;
  signal?: AbortSignal;
  timeoutMs?: number;
  cache?: CacheAdapter;
  cacheKey?: string;
  staleIfError?: boolean;
  tokenizer?: TokenCounter | false;
};
