import {
  fetchCatalogSource,
  type SourceModel,
  type SourceProviders,
} from "@tokenlens/fetch";
import type { CatalogSource } from "./catalog-sources";

export { type CatalogSource, isCatalogSource } from "./catalog-sources";

export const DEFAULT_CATALOG_LIMIT = 60;
const MAX_CATALOG_LIMIT = 120;
const RAW_CATALOG_TTL_MS = 24 * 60 * 60 * 1000;

export interface Model {
  id: string;
  name: string;
  provider: string;
  contextWindow: string;
  tier: "unknown" | "free" | "low" | "mid" | "high";
  features: string[];
  pricing?: {
    prompt: number;
    completion: number;
    currency: string;
  };
}

export type CatalogStatus = "ready" | "fallback" | "error";

export type CatalogQuery = {
  search?: string;
  provider?: string;
  offset?: number;
  limit?: number;
};

export interface CatalogViewState {
  source: CatalogSource;
  models: Model[];
  totalModels: number;
  sourceTotalModels: number;
  providers: string[];
  modelsCountByProvider: Record<string, number>;
  status: CatalogStatus;
  fallbackSource?: CatalogSource;
  error?: string;
  lastUpdated: number;
  query: Required<Pick<CatalogQuery, "offset" | "limit">> &
    Pick<CatalogQuery, "search" | "provider">;
}

type RawCatalogCacheEntry = {
  catalogPromise: Promise<SourceProviders>;
  expiresAt: number;
  loadedAt: number;
};

const rawCatalogCache = new Map<CatalogSource, RawCatalogCacheEntry>();

async function fetchCatalog(source: CatalogSource): Promise<SourceProviders> {
  return fetchCatalogSource(source);
}

async function getRawCatalog(source: CatalogSource): Promise<{
  catalog: SourceProviders;
  lastUpdated: number;
}> {
  const now = Date.now();
  const cached = rawCatalogCache.get(source);
  if (cached && cached.expiresAt > now) {
    return {
      catalog: await cached.catalogPromise,
      lastUpdated: cached.loadedAt,
    };
  }

  const nextEntry: RawCatalogCacheEntry = {
    catalogPromise: fetchCatalog(source),
    expiresAt: now + RAW_CATALOG_TTL_MS,
    loadedAt: now,
  };
  rawCatalogCache.set(source, nextEntry);

  try {
    return {
      catalog: await nextEntry.catalogPromise,
      lastUpdated: nextEntry.loadedAt,
    };
  } catch (error) {
    if (rawCatalogCache.get(source) === nextEntry) {
      rawCatalogCache.delete(source);
    }
    if (cached) {
      return {
        catalog: await cached.catalogPromise,
        lastUpdated: cached.loadedAt,
      };
    }
    throw error;
  }
}

function finiteNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0
    ? numberValue
    : undefined;
}

function buildModelsFromCatalog(catalog?: SourceProviders): Model[] {
  const models: Model[] = [];
  for (const [providerId, provider] of Object.entries(catalog ?? {})) {
    const modelEntries = provider?.models ?? {};
    for (const [canonicalId, m] of Object.entries(modelEntries) as Array<
      [string, SourceModel]
    >) {
      const id = String(canonicalId ?? m.id ?? "");
      const name = m.name ?? id;
      const context = m.limit?.context ?? 0;
      const prompt = finiteNumber(m.cost?.input);
      const completion = finiteNumber(m.cost?.output);
      const hasPricing = prompt !== undefined || completion !== undefined;
      const promptPrice = prompt ?? 0;
      const completionPrice = completion ?? 0;
      const tierPrice = Math.max(promptPrice, completionPrice);
      models.push({
        id,
        name,
        provider: providerId,
        contextWindow: context ? `${context}` : "-",
        tier: !hasPricing
          ? "unknown"
          : tierPrice === 0
            ? "free"
            : tierPrice < 0.5
              ? "low"
              : tierPrice < 3
                ? "mid"
                : "high",
        features: [],
        ...(hasPricing
          ? {
              pricing: {
                prompt: promptPrice,
                completion: completionPrice,
                currency: "USD",
              },
            }
          : {}),
      });
    }
  }
  return models;
}

function getProviders(models: Model[]): string[] {
  return Array.from(new Set(models.map((m) => m.provider))).sort();
}

function countModelsByProvider(models: Model[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const model of models) {
    counts[model.provider] = (counts[model.provider] ?? 0) + 1;
  }
  return counts;
}

function normalizeCatalogQuery(
  query?: CatalogQuery,
): CatalogViewState["query"] {
  const search = query?.search?.trim();
  const provider = query?.provider?.trim();
  const offset = Math.max(0, Math.floor(query?.offset ?? 0));
  const requestedLimit = Math.floor(query?.limit ?? DEFAULT_CATALOG_LIMIT);
  const limit = Math.min(
    MAX_CATALOG_LIMIT,
    Math.max(1, Number.isFinite(requestedLimit) ? requestedLimit : 1),
  );

  return {
    offset,
    limit,
    ...(search ? { search } : {}),
    ...(provider ? { provider } : {}),
  };
}

function filterModels(models: Model[], query: CatalogViewState["query"]) {
  const search = query.search?.toLowerCase();
  return models.filter((model) => {
    const matchesSearch =
      !search ||
      model.name.toLowerCase().includes(search) ||
      model.id.toLowerCase().includes(search) ||
      model.provider.toLowerCase().includes(search) ||
      model.features.some((f) => f.toLowerCase().includes(search));
    const matchesProvider =
      !query.provider || model.provider === query.provider;
    return matchesSearch && matchesProvider;
  });
}

function toCatalogViewState(args: {
  source: CatalogSource;
  catalog?: SourceProviders;
  status: CatalogStatus;
  fallbackSource?: CatalogSource;
  error?: string;
  lastUpdated: number;
  query?: CatalogQuery;
}): CatalogViewState {
  const query = normalizeCatalogQuery(args.query);
  const sourceModels = buildModelsFromCatalog(args.catalog);
  const filteredModels = filterModels(sourceModels, query);

  return {
    source: args.source,
    models: filteredModels.slice(query.offset, query.offset + query.limit),
    totalModels: filteredModels.length,
    sourceTotalModels: sourceModels.length,
    providers: getProviders(sourceModels),
    modelsCountByProvider: countModelsByProvider(sourceModels),
    status: args.status,
    ...(args.fallbackSource ? { fallbackSource: args.fallbackSource } : {}),
    ...(args.error ? { error: args.error } : {}),
    lastUpdated: args.lastUpdated,
    query,
  };
}

export async function loadCatalogView(
  source: CatalogSource,
  query?: CatalogQuery,
  options?: { throwOnError?: boolean },
): Promise<CatalogViewState> {
  try {
    const { catalog, lastUpdated } = await getRawCatalog(source);
    return toCatalogViewState({
      source,
      catalog,
      status: "ready",
      lastUpdated,
      query,
    });
  } catch (error) {
    if (options?.throwOnError) {
      throw error;
    }
    if (source !== "openrouter") {
      try {
        const { catalog: fallbackCatalog, lastUpdated } =
          await getRawCatalog("openrouter");
        return toCatalogViewState({
          source,
          catalog: fallbackCatalog,
          status: "fallback",
          fallbackSource: "openrouter",
          error: "Selected catalog is unavailable.",
          lastUpdated,
          query,
        });
      } catch {
        // Fall through to a visible empty state when both catalogs fail.
      }
    }

    return toCatalogViewState({
      source,
      status: "error",
      error: "Catalog is unavailable.",
      lastUpdated: Date.now(),
      query,
    });
  }
}
