import type {
  SourceModel,
  SourceProvider,
  SourceProviders,
} from "@tokenlens/core";
import type {
  CatalogSource,
  CatalogId as FetchCatalogId,
  FetchLike,
  VercelOptions,
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

export type CatalogModelOverride = Partial<
  Omit<SourceModel, "cost" | "limit">
> & {
  cost?: Partial<NonNullable<SourceModel["cost"]>>;
  limit?: Partial<NonNullable<SourceModel["limit"]>>;
};

export type CatalogProviderOverride = Partial<
  Omit<SourceProvider, "models">
> & {
  models?: Record<string, CatalogModelOverride>;
};

export type CatalogOverrides = Record<string, CatalogProviderOverride>;

export type VercelSourceOptions = Pick<
  VercelOptions,
  "endpointConcurrency" | "includeEndpointDetails"
>;

export type TokenlensSourceOptions = {
  vercel?: VercelSourceOptions;
};

export type TokenlensOptions = {
  catalog?: Catalog;
  overrides?: CatalogOverrides;
  ttlMs?: number;
  fetch?: FetchLike;
  signal?: AbortSignal;
  timeoutMs?: number;
  cache?: CacheAdapter | false;
  cacheKey?: string;
  staleIfError?: boolean;
  sourceOptions?: TokenlensSourceOptions;
  tokenizer?: TokenCounter | false;
};
