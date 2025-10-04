import type { SourceProviders, SourceModel, Usage } from "@tokenlens/core";
import type { TokenCosts } from "@tokenlens/helpers";
import { computeTokenCostsForModel } from "@tokenlens/helpers";
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

  /** Calculate a model's token usage cost in USD. */
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

  /** Retuns a model's metadata as stored in the source catalog. */
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

  /** Fetch context, input, and output token limits for a model. */
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
}
