import {
  assertSourceProviders,
  type SourceModel,
  type SourceProvider,
  type SourceProviders,
  TokenlensError,
  type Usage,
} from "@tokenlens/core";
import type { CatalogInput } from "@tokenlens/fetch";
import {
  catalogInputCacheKey,
  fetchCatalogSource,
  isCatalogSource,
  normalizeCatalogId,
} from "@tokenlens/fetch";
import type { TokenCosts } from "@tokenlens/helpers";
import {
  computeTokenCostsForModel,
  getContextHealth,
} from "@tokenlens/helpers";
import { jitter, MemoryCache } from "./cache.js";
import { applyCatalogOverrides } from "./overrides.js";
import {
  createModelResolver,
  type ModelResolver,
  type ResolveModelResult,
} from "./resolve.js";
import {
  countTokensWithOptionalTokenizer,
  type TokenizerModelId,
} from "./tokenizer.js";
import {
  type CacheAdapter,
  type Catalog,
  type CatalogOverrides,
  DEFAULT_CATALOG_ID,
  type TokenCounter,
  type TokenlensOptions,
  type TokenlensSourceOptions,
} from "./types.js";

export type ModelDetails = SourceModel;
type ResolvedModel = Omit<ResolveModelResult, "model"> & {
  model: SourceModel;
};

export class Tokenlens {
  private readonly catalog: Catalog;
  private readonly overrides: CatalogOverrides | undefined;
  private readonly ttlMs: number;
  private readonly cache: CacheAdapter | undefined;
  private readonly cacheKey: string;
  private readonly fetchImpl: typeof globalThis.fetch;
  private readonly signal: AbortSignal | undefined;
  private readonly timeoutMs: number | undefined;
  private readonly staleIfError: boolean;
  private readonly sourceOptions: TokenlensSourceOptions | undefined;
  private readonly tokenizer: TokenCounter | false | undefined;
  private inFlightCatalog: Promise<SourceProviders> | undefined;
  private catalogRequestVersion = 0;
  private mergedCatalogCache:
    | {
        source: SourceProviders;
        merged: SourceProviders;
      }
    | undefined;
  private resolverCache:
    | {
        catalog: SourceProviders;
        resolver: ModelResolver;
      }
    | undefined;

  constructor(options?: TokenlensOptions) {
    this.catalog = options?.catalog ?? DEFAULT_CATALOG_ID;
    this.overrides = options?.overrides;
    this.ttlMs = options?.ttlMs ?? 24 * 60 * 60 * 1000;
    this.cache =
      options?.cache === false || this.ttlMs <= 0
        ? undefined
        : (options?.cache ?? new MemoryCache());
    this.fetchImpl = options?.fetch ?? globalThis.fetch;
    this.signal = options?.signal;
    this.timeoutMs = options?.timeoutMs;
    this.staleIfError = options?.staleIfError ?? true;
    this.sourceOptions = options?.sourceOptions;
    this.tokenizer = options?.tokenizer;

    // only cache when we load the catalog from a hosted or async source
    if (typeof this.catalog === "string" || isCatalogSource(this.catalog)) {
      this.cacheKey =
        options?.cacheKey ??
        `tokenlens:v2:${catalogInputCacheKey(this.catalog)}`;
    } else {
      this.cacheKey = options?.cacheKey ?? "";
    }
  }

  private async fetchCatalog(source: CatalogInput): Promise<SourceProviders> {
    const vercelOptions =
      typeof source === "string" && normalizeCatalogId(source) === "vercel"
        ? this.sourceOptions?.vercel
        : undefined;
    return fetchCatalogSource(source, {
      fetch: this.fetchImpl,
      ...(this.signal ? { signal: this.signal } : {}),
      ...(this.timeoutMs !== undefined ? { timeoutMs: this.timeoutMs } : {}),
      ...(vercelOptions ?? {}),
    });
  }

  private applyOverrides(catalog: SourceProviders): SourceProviders {
    if (!this.overrides) return catalog;
    if (this.mergedCatalogCache?.source === catalog) {
      return this.mergedCatalogCache.merged;
    }

    const merged = applyCatalogOverrides(catalog, this.overrides);
    this.mergedCatalogCache = { source: catalog, merged };
    return merged;
  }

  private resolverFor(catalog: SourceProviders): ModelResolver {
    if (this.resolverCache?.catalog === catalog) {
      return this.resolverCache.resolver;
    }

    const resolver = createModelResolver(catalog);
    this.resolverCache = { catalog, resolver };
    return resolver;
  }

  private async loadCatalog(options?: {
    force?: boolean;
  }): Promise<SourceProviders> {
    if (typeof this.catalog === "object" && !isCatalogSource(this.catalog)) {
      assertSourceProviders(this.catalog);
      return Promise.resolve(this.applyOverrides(this.catalog));
    }

    const now = Date.now();
    const cached = await this.cache?.get(this.cacheKey);
    if (!options?.force && cached && cached.expiresAt > now) {
      return this.applyOverrides(cached.value);
    }

    let inFlight: Promise<SourceProviders> | undefined;
    try {
      if (options?.force || !this.inFlightCatalog) {
        const requestVersion = ++this.catalogRequestVersion;
        const catalogSource = this.catalog as CatalogInput;
        this.inFlightCatalog = (async () => {
          const catalog = await this.fetchCatalog(catalogSource);
          if (this.cache && this.catalogRequestVersion === requestVersion) {
            const entry = {
              value: catalog,
              expiresAt: Date.now() + jitter(this.ttlMs),
            };
            await this.cache.set(this.cacheKey, entry);
          }
          return catalog;
        })();
      }

      inFlight = this.inFlightCatalog;
      const catalog = await inFlight;
      return this.applyOverrides(catalog);
    } catch (error) {
      if (this.cache && this.staleIfError && !options?.force && cached) {
        return this.applyOverrides(cached.value);
      }
      throw error;
    } finally {
      if (inFlight && this.inFlightCatalog === inFlight) {
        this.inFlightCatalog = undefined;
      }
    }
  }

  async refresh(force?: boolean): Promise<SourceProviders> {
    return this.loadCatalog(force === undefined ? undefined : { force });
  }

  async listProviders(): Promise<SourceProvider[]> {
    const catalog = await this.loadCatalog();
    return Object.values(catalog);
  }

  async listModels(args?: {
    provider?: string;
    search?: string;
  }): Promise<ModelDetails[]> {
    const catalog = await this.loadCatalog();
    const providerFilter = args?.provider?.trim().toLowerCase();
    const searchFilter = args?.search?.trim().toLowerCase();
    const models: ModelDetails[] = [];

    for (const [providerKey, provider] of Object.entries(catalog)) {
      if (
        providerFilter &&
        !providerMatches(providerKey, provider, providerFilter)
      ) {
        continue;
      }

      for (const [modelKey, model] of Object.entries(provider.models)) {
        if (searchFilter && !modelMatches(modelKey, model, searchFilter)) {
          continue;
        }
        models.push(model);
      }
    }

    return models;
  }

  async tryGetModelData(args: {
    modelId: string;
    provider?: string;
  }): Promise<ModelDetails | undefined> {
    try {
      return await this.getModelData(args);
    } catch (error) {
      if (
        error instanceof TokenlensError &&
        (error.code === TokenlensError.ModelNotFound.code ||
          error.code === TokenlensError.AmbiguousModelId.code)
      ) {
        return undefined;
      }
      throw error;
    }
  }

  async invalidate(): Promise<void> {
    await this.cache?.delete?.(this.cacheKey);
    this.catalogRequestVersion += 1;
    this.inFlightCatalog = undefined;
    this.mergedCatalogCache = undefined;
    this.resolverCache = undefined;
  }

  private modelNotFoundError(
    args: { modelId: string; provider?: string },
    resolved: ResolveModelResult,
  ): TokenlensError {
    const catalogId =
      typeof this.catalog === "string" ? this.catalog : undefined;
    if (resolved.candidates?.length) {
      return new TokenlensError.AmbiguousModelId(args.modelId, {
        candidates: resolved.candidates,
        ...(catalogId ? { catalogId } : {}),
      });
    }

    const providerId =
      args.provider ?? (resolved.providerId ? resolved.providerId : undefined);
    const meta =
      resolved.modelId && resolved.modelId !== args.modelId
        ? { resolvedModelId: resolved.modelId }
        : undefined;

    return new TokenlensError.ModelNotFound(args.modelId, {
      ...(providerId ? { providerId } : {}),
      ...(catalogId ? { catalogId } : {}),
      ...(meta ? { meta } : {}),
    });
  }

  private async resolveModelOrThrow(args: {
    modelId: string;
    provider?: string;
  }): Promise<ResolvedModel> {
    const catalog = await this.loadCatalog();
    const resolved = this.resolverFor(catalog).resolveModel({
      ...(args.provider !== undefined ? { providerId: args.provider } : {}),
      modelId: args.modelId,
    });

    if (!resolved.model) {
      throw this.modelNotFoundError(args, resolved);
    }

    return {
      providerId: resolved.providerId,
      modelId: resolved.modelId,
      model: resolved.model,
    };
  }

  /**
   * Count tokens in a text string for a given model.
   *
   * @param args - Configuration for token counting
   * @returns Token count
   *
   * @example
   * ```typescript
   * const tokenlens = new Tokenlens();
   * const tokens = await tokenlens.countTokens({
   *   modelId: "gpt-4o",
   *   data: "Write a story about a robot",
   * });
   *
   * console.log(`Input tokens: ${tokens}`);
   * ```
   */
  async countTokens(args: {
    modelId: TokenizerModelId;
    data: string;
  }): Promise<number | undefined> {
    const { modelId, data } = args;
    if (this.tokenizer === false) {
      throw new TokenlensError.MissingDependency("@tokenlens/tokenizer");
    }
    if (this.tokenizer) {
      return await this.tokenizer({ modelId, data });
    }
    return await countTokensWithOptionalTokenizer(modelId, data);
  }

  /**
   * Calculate a model's token usage cost in USD.
   *
   * @param args - Configuration for cost computation
   * @returns Token costs breakdown including input, output, and total costs in USD
   *
   * @example
   * ```typescript
   * const tokenlens = new Tokenlens();
   * const costs = await tokenlens.computeCostUSD({
   *   modelId: "openai/gpt-4o-mini",
   *   usage: { input_tokens: 1000, output_tokens: 500 }
   * });
   * console.log(`Total: $${costs.totalTokenCostUSD}`);
   * ```
   */
  async computeCostUSD(args: {
    modelId: string;
    provider?: string;
    usage: Usage;
  }): Promise<TokenCosts> {
    const resolved = await this.resolveModelOrThrow(args);
    return computeTokenCostsForModel({
      model: resolved.model,
      usage: args.usage,
    });
  }

  /**
   * Estimate token costs in USD by counting tokens in text and looking up pricing.
   * This is useful for estimating costs BEFORE making an API call.
   *
   * @param args - Configuration for cost estimation
   * @returns Token costs breakdown including total cost in USD and token counts
   *
   * @example
   * ```typescript
   * const estimate = await tokenlens.estimateCostUSD({
   *   modelId: "gpt-4o",
   *   data: "Write a story about a robot",
   * });
   * ```
   */
  async estimateCostUSD(args: {
    /** The model ID to look up pricing for */
    modelId: string;
    /** Provider for model lookup (e.g., "openai", "anthropic") */
    provider?: string;
    /** Text content to estimate costs for */
    data: string;
  }): Promise<TokenCosts & { inputTokens: number }> {
    const { modelId, provider, data } = args;

    // Count tokens in input text
    const inputTokens = (await this.countTokens({ modelId, data })) ?? 0;

    // Compute costs using the existing method
    const costs = await this.computeCostUSD({
      modelId: modelId,
      ...(provider !== undefined ? { provider: provider } : {}),
      usage: {
        input_tokens: inputTokens,
        output_tokens: 0,
        reasoning_tokens: 0,
        cacheReads: 0,
        cacheWrites: 0,
      },
    });

    return {
      inputTokens,
      ...costs,
    };
  }

  /**
   * Get a model's metadata exactly as stored in the active sources.
   *
   * Model ID formats supported:
   * - "openai/gpt-4o-mini" - Full provider/model format
   * - "gpt-4o-mini" with provider: "openai" - Separate model and provider
   * - "gpt-4o-mini" - Search across all providers (may be ambiguous)
   *
   * @param args - Configuration for model data lookup
   * @returns Model metadata including pricing, limits, and other details
   *
   * @example
   * ```typescript
   * const tokenlens = new Tokenlens();
   * // Using provider prefix
   * const details = await tokenlens.getModelData({ modelId: "openai/gpt-4o-mini" });
   *
   * // Using separate provider parameter (useful with AI SDK variables)
   * const model = "gpt-4o-mini";
   * const provider = "openai";
   * const details = await tokenlens.getModelData({ modelId: model, provider });
   * ```
   */
  async getModelData(args: {
    modelId: string;
    provider?: string;
  }): Promise<ModelDetails> {
    const resolved = await this.resolveModelOrThrow(args);
    return resolved.model;
  }

  /**
   * Read the context, input, and output token limits for a model.
   *
   * @param args - Configuration for context limits lookup
   * @returns Object containing context, input, and output token limits
   *
   * @example
   * ```typescript
   * const tokenlens = new Tokenlens();
   * const limits = await tokenlens.getContextLimits({ modelId: "openai/gpt-4o-mini" });
   * console.log(`Context: ${limits?.context} tokens`);
   * ```
   */
  async getContextLimits(args: {
    modelId: string;
    provider?: string;
  }): Promise<
    { context?: number; input?: number; output?: number } | undefined
  > {
    const modelData = await this.getModelData({
      modelId: args.modelId,
      ...(args.provider !== undefined ? { provider: args.provider } : {}),
    });
    return modelData.limit;
  }

  /**
   * Calculate context window health metrics for a model and usage.
   *
   * Returns detailed information about context usage including:
   * - Total, used, and remaining tokens
   * - Usage percentages
   * - Health status (healthy: <70%, warning: 70-90%, critical: >90%)
   *
   * @param args - Configuration for context health calculation
   * @returns Context health metrics including usage percentages and health status
   *
   * @example
   * ```typescript
   * const tokenlens = new Tokenlens();
   * const health = await tokenlens.getContextHealth({
   *   modelId: "openai/gpt-4o-mini",
   *   usage: { input_tokens: 50000, output_tokens: 10000 }
   * });
   *
   * if (health) {
   *   console.log(`Used: ${health.usedPercentage.toFixed(1)}%`);
   *   console.log(`Status: ${health.status}`);
   * }
   * ```
   */
  async getContextHealth(args: {
    modelId: string;
    provider?: string;
    usage: Usage;
  }) {
    const resolved = await this.resolveModelOrThrow(args);
    return getContextHealth({ model: resolved.model, usage: args.usage });
  }
}

function providerMatches(
  providerKey: string,
  provider: SourceProvider,
  lookup: string,
): boolean {
  return [providerKey, provider.id, ...(provider.aliases ?? [])]
    .map((value) => value.toLowerCase())
    .includes(lookup);
}

function modelMatches(
  modelKey: string,
  model: SourceModel,
  lookup: string,
): boolean {
  return [modelKey, model.id, model.canonical_id, model.name].some((value) =>
    value.toLowerCase().includes(lookup),
  );
}
