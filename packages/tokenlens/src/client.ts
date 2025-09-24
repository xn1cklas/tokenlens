import type { Providers } from "@tokenlens/core/dto";
import type { Usage } from "@tokenlens/core/types";
import { computeTokenCostsForModel } from "@tokenlens/helpers";
import type { Model } from "@tokenlens/core/dto";
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

export type ModelHints = {
  modalities?: Model["modalities"];
  supportsReasoning: boolean;
  supportsToolCall: boolean;
  supportsAttachments: boolean;
  knowledge?: string;
  openWeights: boolean;
};

function buildResultHints(model?: Model): ModelHints | undefined {
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
    if (!options?.sources || options.sources.length === 0) {
      throw new Error("Tokenlens requires at least one source");
    }
    this.sources = options.sources;
    this.ttlMs = options?.ttlMs ?? 24 * 60 * 60 * 1000;
    this.fetchImpl = options?.fetch ?? getDefaultFetch();
    this.cache = options?.cache ?? new MemoryCache();
    this.cacheKey =
      options?.cacheKey ?? `tokenlens:v2:${this.sources.join(",")}`;
    this.loaders = {} as Record<SourceId, SourceLoader>;
    for (const source of this.sources) {
      const loader = options?.loaders?.[source];
      if (!loader) {
        throw new Error(`No loader provided for source "${source}"`);
      }
      this.loaders[source] = loader;
    }
  }

  async getProviders(): Promise<Providers> {
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

  async refresh(force?: boolean): Promise<Providers> {
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

  async getTokenCosts(args: {
    modelId: string;
    provider?: string;
    usage: Usage;
  }): Promise<ReturnType<typeof computeTokenCostsForModel>> {
    const details = await this.getModelDetails(args);
    if (!details.costs) {
      throw new Error("Usage is required to compute token costs");
    }
    return details.costs;
  }

  async getModel(args: { modelId: string; provider?: string }): Promise<{
    providerId: string;
    modelId: string;
    model: import("@tokenlens/core/dto").Model | undefined;
  }> {
    const providers = await this.getProviders();
    return resolveModel({
      providers,
      providerId: args.provider,
      modelId: args.modelId,
    });
  }

  async getModelDetails(args: {
    modelId: string;
    provider?: string;
    usage?: Usage;
  }): Promise<{
    providerId: string;
    modelId: string;
    model: Model | undefined;
    limit?: { context?: number; input?: number; output?: number };
    costs: ReturnType<typeof computeTokenCostsForModel> | undefined;
    hints: ModelHints | undefined;
  }> {
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

  async getLimit(args: {
    modelId: string;
    provider?: string;
  }): Promise<
    { context?: number; input?: number; output?: number } | undefined
  > {
    const details = await this.getModelDetails({
      modelId: args.modelId,
      provider: args.provider,
    });
    return details.limit;
  }
}

let shared: Tokenlens | undefined;
export function getShared(): Tokenlens {
  shared ??= new Tokenlens();
  return shared;
}
