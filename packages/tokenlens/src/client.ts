import type { SourceProviders, SourceModel } from "@tokenlens/core/dto";
import type { Usage } from "@tokenlens/core/types";
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

export type ModelHints = {
  modalities?: SourceModel["modalities"];
  supportsReasoning: boolean;
  supportsToolCall: boolean;
  supportsAttachments: boolean;
  knowledge?: string;
  openWeights: boolean;
};

export type ModelDetails = {
  providerId: string;
  modelId: string;
  model: SourceModel | undefined;
  limit?: { context?: number; input?: number; output?: number };
  costs: TokenCosts | undefined;
  hints: ModelHints | undefined;
};

function buildResultHints(model?: SourceModel): ModelHints | undefined {
  if (!model) return undefined;
  return {
    modalities: model.modalities,
    supportsReasoning: Boolean(model.reasoning),
    supportsToolCall: Boolean(model.tool_call),
    supportsAttachments: Boolean(model.attachment),
    knowledge: model.knowledge,
    openWeights: Boolean(model.open_weights),
  };
}

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

  /** @public Estimate a model's token usage cost in USD. */
  async estimateCostUSD(args: {
    modelId: string;
    provider?: string;
    usage: Usage;
  }): Promise<ReturnType<typeof computeTokenCostsForModel>> {
    const details = await this.describeModel(args);
    if (!details.costs) {
      throw new Error("Usage is required to compute token costs");
    }
    return details.costs;
  }

  /** @public Describe a model's metadata, limits, costs, and hints. */
  async describeModel(args: {
    modelId: string;
    provider?: string;
    usage?: Usage;
  }): Promise<ModelDetails> {
    const providers = await this.getProviders();
    const resolved = resolveModel({
      providers,
      providerId: args.provider,
      modelId: args.modelId,
    });
    const costs = args.usage
      ? computeTokenCostsForModel({ model: resolved.model, usage: args.usage })
      : undefined;
    const limit = resolved.model?.limit;
    const hints = buildResultHints(resolved.model);
    return {
      providerId: resolved.providerId,
      modelId: resolved.modelId,
      model: resolved.model,
      limit,
      costs,
      hints,
    };
  }

  /** @public Fetch context, input, and output token limits for a model. */
  async getContextLimits(args: {
    modelId: string;
    provider?: string;
  }): Promise<
    { context?: number; input?: number; output?: number } | undefined
  > {
    const details = await this.describeModel({
      modelId: args.modelId,
      provider: args.provider,
    });
    return details.limit;
  }

  /** @public Experimental: count tokens with a model's tokenizer. */
  async experimental_countTokens(
    providerId: string,
    modelId: string,
    content: CountTokensContent,
    options?: CountTokensOptions,
  ): Promise<TokenizerResult> {
    const normalizedOptions = options ?? {};
    const { model, tokenizerId } = await this.#resolveTokenizerInfo({
      providerId,
      modelId,
      tokenizerId:
        normalizedOptions.tokenizerId ?? normalizedOptions.encodingOverride,
    });

    const tokenizer = await import("@tokenlens/tokenizer");

    const params: CountTokensParams = {
      providerId,
      modelId,
      content,
      options: {
        ...normalizedOptions,
        model: normalizedOptions.model ?? model,
        tokenizerId: tokenizerId ?? normalizedOptions.tokenizerId,
        encodingOverride: normalizedOptions.encodingOverride,
        usage: normalizedOptions.usage,
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

    const details = await this.describeModel({
      provider: args.providerId,
      modelId: args.modelId,
    });

    const inferred =
      details.model?.extras && typeof details.model.extras === "object"
        ? (details.model.extras as { architecture?: { tokenizer?: string } })
            .architecture?.tokenizer
        : undefined;

    return {
      model: details.model,
      tokenizerId: inferred,
    };
  }
}

let shared: Tokenlens | undefined;
export function getShared(): Tokenlens {
  shared ??= new Tokenlens();
  return shared;
}
