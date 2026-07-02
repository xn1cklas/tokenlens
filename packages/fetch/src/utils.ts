import {
  type SourceId,
  type SourceModel,
  type SourceProvider,
  type SourceProviders,
  TokenlensError,
} from "@tokenlens/core";

type PerTokenPricing = Record<string, unknown> & {
  prompt?: unknown;
  input?: unknown;
  completion?: unknown;
  output?: unknown;
  reasoning?: unknown;
  internal_reasoning?: unknown;
  cache_read?: unknown;
  input_cache_read?: unknown;
  cache_write?: unknown;
  input_cache_write?: unknown;
};

const SOURCE_COST_FIELDS = [
  "input",
  "output",
  "reasoning",
  "cache_read",
  "cache_write",
] as const;
const MAX_PER_TOKEN_PRICE_USD = 1;

type CatalogProviderOptions = {
  providerKey: string;
  providerId?: string;
  name?: string;
  api?: string;
  doc?: string;
  env?: readonly string[];
  source: SourceId;
  schemaVersion?: number;
};

export function withProviderPrefix(
  providerId: string,
  modelId: string,
): string {
  const trimmed = modelId.trim();
  if (!trimmed) return providerId;
  return trimmed.includes("/") ? trimmed : `${providerId}/${trimmed}`;
}

export function filterCatalog(
  catalog: SourceProviders,
  provider?: string,
  model?: string,
): SourceProviders {
  const out: SourceProviders = {};
  for (const [provKey, prov] of Object.entries(catalog)) {
    if (provider && provKey !== provider) continue;
    const models = prov.models || {};
    const filteredModels = model
      ? Object.fromEntries(
          Object.entries(models).filter(([id]) => id.includes(model)),
        )
      : models;
    if (Object.keys(filteredModels).length > 0 || !model) {
      out[provKey] = { ...prov, models: filteredModels };
    }
  }
  return out;
}

function providerAliases(providerId: string, providerKey?: string): string[] {
  const aliases = new Set<string>();
  const normalized = providerId.toLowerCase();
  const key = providerKey?.toLowerCase();

  if (key && key !== normalized) aliases.add(key);
  if (normalized === "openai") aliases.add("openai.responses");
  if (normalized === "anthropic") aliases.add("anthropic.messages");
  if (normalized === "x-ai") {
    aliases.add("xai");
    aliases.add("xai.chat");
  }
  if (normalized === "xai") {
    aliases.add("x-ai");
    aliases.add("xai.chat");
  }

  return [...aliases];
}

export function providerAliasFields(
  providerId: string,
  providerKey?: string,
): { aliases?: readonly string[] } {
  const aliases = providerAliases(providerId, providerKey);
  return aliases.length ? { aliases } : {};
}

export function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function toPriceNumber(value: unknown): number | undefined {
  const n = toNumber(value);
  return n !== undefined && n >= 0 ? n : undefined;
}

function toPerTokenPriceNumber(value: unknown): number | undefined {
  const n = toPriceNumber(value);
  return n !== undefined && n < MAX_PER_TOKEN_PRICE_USD ? n : undefined;
}

function toRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

export function hasTieredPricing(value: unknown): boolean {
  const pricing = toRecord(value);
  if (!pricing) return false;
  if (Array.isArray(pricing["tiers"]) && pricing["tiers"].length > 0) {
    return true;
  }
  return Object.entries(pricing).some(
    ([key, entry]) =>
      key.includes("_over_") &&
      entry !== null &&
      typeof entry === "object" &&
      !Array.isArray(entry),
  );
}

export function costFromSourcePricing(
  pricingRaw: unknown,
): SourceModel["cost"] | undefined {
  const pricing = toRecord(pricingRaw);
  if (!pricing || hasTieredPricing(pricing)) return undefined;

  const cost: SourceModel["cost"] = {};
  for (const field of SOURCE_COST_FIELDS) {
    const value = toPriceNumber(pricing[field]);
    if (value !== undefined) {
      cost[field] = value;
    }
  }

  return Object.keys(cost).length ? cost : undefined;
}

export function costFromPerTokenPricing(
  pricingRaw?: PerTokenPricing,
): SourceModel["cost"] | undefined {
  const promptPerToken =
    toPerTokenPriceNumber(pricingRaw?.prompt) ??
    toPerTokenPriceNumber(pricingRaw?.input);
  const completionPerToken =
    toPerTokenPriceNumber(pricingRaw?.completion) ??
    toPerTokenPriceNumber(pricingRaw?.output);
  const reasoningPerToken =
    toPerTokenPriceNumber(pricingRaw?.reasoning) ??
    toPerTokenPriceNumber(pricingRaw?.internal_reasoning);
  const cacheReadPerToken =
    toPerTokenPriceNumber(pricingRaw?.cache_read) ??
    toPerTokenPriceNumber(pricingRaw?.input_cache_read);
  const cacheWritePerToken =
    toPerTokenPriceNumber(pricingRaw?.cache_write) ??
    toPerTokenPriceNumber(pricingRaw?.input_cache_write);

  if (
    promptPerToken === undefined &&
    completionPerToken === undefined &&
    reasoningPerToken === undefined &&
    cacheReadPerToken === undefined &&
    cacheWritePerToken === undefined
  ) {
    return undefined;
  }

  return {
    ...(promptPerToken !== undefined
      ? { input: promptPerToken * 1_000_000 }
      : {}),
    ...(completionPerToken !== undefined
      ? { output: completionPerToken * 1_000_000 }
      : {}),
    ...(reasoningPerToken !== undefined
      ? { reasoning: reasoningPerToken * 1_000_000 }
      : {}),
    ...(cacheReadPerToken !== undefined
      ? { cache_read: cacheReadPerToken * 1_000_000 }
      : {}),
    ...(cacheWritePerToken !== undefined
      ? { cache_write: cacheWritePerToken * 1_000_000 }
      : {}),
  };
}

export function ensureJsonObject(
  value: unknown,
  target: string,
): Record<string, unknown> {
  const record = toRecord(value);
  if (!record) {
    throw new TokenlensError.FetchFailed({
      target,
      meta: { reason: "INVALID_JSON_SHAPE" },
    });
  }
  return record;
}

export function requireArrayField<T>(
  value: Record<string, unknown>,
  field: string,
  target: string,
): T[] {
  const raw = value[field];
  if (!Array.isArray(raw)) {
    throw new TokenlensError.FetchFailed({
      target,
      meta: { reason: "INVALID_JSON_SHAPE", field },
    });
  }
  return raw as T[];
}

export function upsertCatalogProvider(
  catalog: SourceProviders,
  options: CatalogProviderOptions,
): SourceProvider {
  const providerId = options.providerId ?? options.providerKey;
  const existing = catalog[options.providerKey];
  if (existing) return existing;

  const provider: SourceProvider = {
    id: providerId,
    ...providerAliasFields(providerId, options.providerKey),
    name: options.name ?? providerId,
    ...(options.api !== undefined ? { api: options.api } : {}),
    ...(options.doc !== undefined ? { doc: options.doc } : {}),
    ...(options.env !== undefined ? { env: options.env } : {}),
    source: options.source,
    schemaVersion: options.schemaVersion ?? 1,
    models: {},
  };
  catalog[options.providerKey] = provider;
  return provider;
}

export async function mapWithConcurrency<T>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T) => Promise<void>,
): Promise<void> {
  const limit = Math.max(1, Math.floor(concurrency));
  let nextIndex = 0;

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex;
        nextIndex += 1;
        await mapper(items[index] as T);
      }
    }),
  );
}
