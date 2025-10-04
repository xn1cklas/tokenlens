import type { SourceProviders, SourceModel, Usage } from "@tokenlens/core";
import type { TokenCosts } from "@tokenlens/helpers";
import {
  computeTokenCostsForModel,
  getContextHealth,
} from "@tokenlens/helpers";
import { countTokens, type TokenizerModelId } from "@tokenlens/tokenizer";
import { MemoryCache, jitter } from "./cache.js";
import {
  type TokenlensOptions,
  GATEWAY_IDS,
  type GatewayId,
  type CacheAdapter,
} from "./types.js";
import { resolveModel } from "./resolve.js";
import { TokenLensError } from "./error/index.js";
import { BASE_ERROR_CODES } from "./error/codes.js";
import { fetchModelsDev, fetchOpenrouter } from "@tokenlens/fetch";

export type ModelDetails = SourceModel | undefined;

export class Tokenlens {
  private readonly catalog: GatewayId | SourceProviders;
  private readonly ttlMs: number;
  private readonly cache: CacheAdapter;
  private readonly cacheKey: string;

  constructor(options?: TokenlensOptions) {
    // use automode as default
    this.catalog = options?.catalog ?? GATEWAY_IDS[1];
    this.ttlMs = options?.ttlMs ?? 24 * 60 * 60 * 1000;
    this.cache = options?.cache ?? new MemoryCache();

    // only cache when we load the catalog form a gateway
    if (typeof this.catalog === "string") {
      this.cacheKey = options?.cacheKey ?? `tokenlens:v2:${this.catalog}`;
    } else {
      this.cacheKey = options?.cacheKey ?? "";
    }
  }

  private async loadCatalog(): Promise<SourceProviders> {
    if (typeof this.catalog === "object") {
      return Promise.resolve(this.catalog);
    }

    const now = Date.now();
    const cached = await this.cache.get(this.cacheKey);
    if (cached && cached.expiresAt > now) return cached.value;

    let catalog: SourceProviders;
    switch (this.catalog) {
      case "auto":
        catalog = await fetchModelsDev();
        break;
      case "openrouter":
        catalog = await fetchOpenrouter();
        break;
      case "models.dev":
        catalog = await fetchModelsDev();
        break;
      // TODO implement vercel AI Gateway
      // case "vercel":
      //   catalog = [];
      //   break;
      // TODO implement netlify AI Gateway
      // case "netlify":
      //   catalog = [];
      //   break;
      default:
        throw new Error(`Unknown catalog ID: ${this.catalog}`);
    }

    const entry = { value: catalog, expiresAt: now + jitter(this.ttlMs) };
    await this.cache.set(this.cacheKey, entry);
    return catalog;
  }

  async refresh(force?: boolean): Promise<SourceProviders> {
    if (typeof this.catalog === "object") {
      return Promise.resolve(this.catalog);
    }

    const now = Date.now();
    if (!force) {
      const cached = await this.cache.get(this.cacheKey);
      if (cached && cached.expiresAt > now) return cached.value;
    }

    let catalog: SourceProviders;
    switch (this.catalog) {
      case "auto":
        catalog = await fetchModelsDev();
        break;
      case "openrouter":
        catalog = await fetchOpenrouter();
        break;
      case "models.dev":
        catalog = await fetchModelsDev();
        break;
      default:
        throw new Error(`Unknown catalog ID: ${this.catalog}`);
    }

    const entry = { value: catalog, expiresAt: now + jitter(this.ttlMs) };
    await this.cache.set(this.cacheKey, entry);
    return catalog;
  }

  async invalidate(): Promise<void> {
    await this.cache.delete?.(this.cacheKey);
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
    return await countTokens(modelId, data);
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
    const catalog = await this.loadCatalog();
    const resolved = resolveModel({
      catalog,
      ...(args.provider !== undefined ? { providerId: args.provider } : {}),
      modelId: args.modelId,
    });
    // If we can't resolve the model within the given catalog throw an error
    if (!resolved.model) {
      throw new TokenLensError(BASE_ERROR_CODES.MODEL_NOT_FOUND);
    }
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
    const inputTokens = (await countTokens(modelId, data)) ?? 0;

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
    const catalog = await this.loadCatalog();
    const resolved = resolveModel({
      catalog,
      ...(args.provider !== undefined ? { providerId: args.provider } : {}),
      modelId: args.modelId,
    });
    // If we can't resolve the model within the given catalog throw an error
    if (!resolved.model) {
      throw new TokenLensError(BASE_ERROR_CODES.MODEL_NOT_FOUND);
    }
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
    // If we can't resolve the model within the given catalog throw an error
    if (!modelData) {
      throw new TokenLensError(BASE_ERROR_CODES.MODEL_NOT_FOUND);
    }
    return modelData?.limit;
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
    const resolved = resolveModel({
      catalog: await this.loadCatalog(),
      ...(args.provider !== undefined ? { providerId: args.provider } : {}),
      modelId: args.modelId,
    });

    if (!resolved.model) {
      throw new TokenLensError(BASE_ERROR_CODES.MODEL_NOT_FOUND);
    }
    return getContextHealth({ model: resolved.model, usage: args.usage });
  }
}
