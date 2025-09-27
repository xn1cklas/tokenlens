import type { SourceProviders, SourceModel, Usage } from "@tokenlens/core";
import type { TokenCosts } from "@tokenlens/helpers";
import { computeTokenCostsForModel } from "@tokenlens/helpers";
import type {
  CountTokensContent,
  CountTokensOptions,
  CountTokensParams,
  TokenizerResult,
} from "@tokenlens/tokenizer";
import { mergeProviders } from "./merge.js";
import { loadSources } from "./sources.js";
import { MemoryCache, jitter } from "./cache.js";
import type {
  FetchLike,
  SourceId,
  TokenlensOptions,
  CacheAdapter,
  SourceLoader,
} from "./types.js";
import { resolveModel } from "./resolve.js";
import { DEFAULT_SOURCE, buildLoaderMap } from "./default-loaders.js";

export type ModelDetails = SourceModel | undefined;

function getDefaultFetch(): FetchLike {
  const f = (globalThis as unknown as { fetch?: FetchLike }).fetch;
  if (!f) throw new Error("No fetch implementation available");
  return f;
}

export class Tokenlens {
  private readonly sources: ReadonlyArray<SourceId>;
  private readonly ttlMs: number;
  private readonly fetchImpl: FetchLike;
  private readonly cache: CacheAdapter;
  private readonly cacheKey: string;
  private readonly loaders: Record<SourceId, SourceLoader>;

  constructor(options?: TokenlensOptions) {
    const sources =
      options?.sources && options.sources.length > 0
        ? options.sources
        : [DEFAULT_SOURCE];

    this.sources = sources;
    this.ttlMs = options?.ttlMs ?? 24 * 60 * 60 * 1000;
    this.fetchImpl = options?.fetch ?? getDefaultFetch();
    this.cache = options?.cache ?? new MemoryCache();
    this.cacheKey =
      options?.cacheKey ?? `tokenlens:v2:${this.sources.join(",")}`;

    const loaderMap = buildLoaderMap(this.sources, options?.loaders);
    for (const source of this.sources) {
      if (!loaderMap[source]) {
        throw new Error(`No loader available for source "${source}"`);
      }
    }
    this.loaders = loaderMap;
  }

  async getProviders(): Promise<SourceProviders> {
    const now = Date.now();
    const cached = await this.cache.get(this.cacheKey);
    if (cached && cached.expiresAt > now) return cached.value;

    try {
      const providerSets = await loadSources(
        this.sources,
        this.fetchImpl,
        this.loaders,
      );
      const merged = mergeProviders(providerSets);
      const entry = { value: merged, expiresAt: now + jitter(this.ttlMs) };
      await this.cache.set(this.cacheKey, entry);
      return merged;
    } catch (err) {
      if (cached) return cached.value;
      throw err;
    }
  }

  async refresh(force?: boolean): Promise<SourceProviders> {
    const now = Date.now();
    if (!force) {
      const cached = await this.cache.get(this.cacheKey);
      if (cached && cached.expiresAt > now) return cached.value;
    }
    const providerSets = await loadSources(
      this.sources,
      this.fetchImpl,
      this.loaders,
    );
    const merged = mergeProviders(providerSets);
    const entry = { value: merged, expiresAt: now + jitter(this.ttlMs) };
    await this.cache.set(this.cacheKey, entry);
    return merged;
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
    const providers = await this.getProviders();
    const resolved = resolveModel({
      providers,
      ...(args.provider !== undefined ? { providerId: args.provider } : {}),
      modelId: args.modelId,
    });
    return computeTokenCostsForModel({
      ...(resolved.model !== undefined ? { model: resolved.model } : {}),
      usage: args.usage,
    });
  }

  /** Describe a model's metadata as stored in the source catalog. */
  async describeModel(args: {
    modelId: string;
    provider?: string;
  }): Promise<ModelDetails> {
    const providers = await this.getProviders();
    const resolved = resolveModel({
      providers,
      ...(args.provider !== undefined ? { providerId: args.provider } : {}),
      modelId: args.modelId,
    });
    return resolved.model;
  }

  /** Fetch context, input, and output token limits for a model. */
  async getContextLimits(args: {
    modelId: string;
    provider?: string;
  }): Promise<
    { context?: number; input?: number; output?: number } | undefined
  > {
    const details = await this.describeModel({
      modelId: args.modelId,
      ...(args.provider !== undefined ? { provider: args.provider } : {}),
    });
    return details?.limit;
  }

  /** Experimental: count tokens with a model's tokenizer. */
  async experimental_countTokens(args: {
    modelId: string;
    provider?: string;
    content: CountTokensContent;
    options?: CountTokensOptions;
  }): Promise<TokenizerResult> {
    const { modelId, provider, content, options } = args;
    const normalizedOptions = options ?? {};
    const providers = await this.getProviders();
    const resolved = resolveModel({
      providers,
      ...(provider !== undefined ? { providerId: provider } : {}),
      modelId,
    });

    const { model, tokenizerId } = await this.#resolveTokenizerInfo({
      providerId: resolved.providerId,
      modelId: resolved.modelId,
      ...((normalizedOptions.tokenizerId ?? normalizedOptions.encodingOverride)
        ? {
            tokenizerId:
              normalizedOptions.tokenizerId ??
              normalizedOptions.encodingOverride,
          }
        : {}),
    });

    const tokenizer = await import("@tokenlens/tokenizer");

    const params: CountTokensParams = {
      providerId: resolved.providerId,
      modelId: resolved.modelId,
      content,
      options: {
        ...normalizedOptions,
        ...((normalizedOptions.model ?? model)
          ? { model: normalizedOptions.model ?? model }
          : {}),
        ...((tokenizerId ?? normalizedOptions.tokenizerId)
          ? { tokenizerId: tokenizerId ?? normalizedOptions.tokenizerId }
          : {}),
        ...(normalizedOptions.encodingOverride !== undefined
          ? { encodingOverride: normalizedOptions.encodingOverride }
          : {}),
        ...(normalizedOptions.usage !== undefined
          ? { usage: normalizedOptions.usage }
          : {}),
      },
    };

    return tokenizer.countTokens(params);
  }

  async #resolveTokenizerInfo(args: {
    providerId: string;
    modelId: string;
    tokenizerId?: string;
  }): Promise<{ model?: SourceModel; tokenizerId?: string }> {
    if (args.tokenizerId) {
      return { tokenizerId: args.tokenizerId };
    }

    const providers = await this.getProviders();
    const resolved = resolveModel({
      providers,
      providerId: args.providerId,
      modelId: args.modelId,
    });

    const extras = resolved.model?.extras;
    const inferred =
      extras && typeof extras === "object"
        ? (extras as { architecture?: { tokenizer?: string } }).architecture
            ?.tokenizer
        : undefined;

    return {
      ...(resolved.model !== undefined ? { model: resolved.model } : {}),
      ...(inferred !== undefined ? { tokenizerId: inferred } : {}),
    };
  }
}
