import type {
  Model,
  ModelCatalog,
  NormalizedUsage,
  ProviderInfo,
  TokenBreakdown,
  UsageLike,
} from "@tokenlens/core";

/**
 * Return the raw context window caps for a model id (canonical or alias).
 * @deprecated Prefer getContextData({ modelId, catalog })
 */
export function getContextWindow(
  modelId: string,
  opts?: { catalog?: ModelCatalog },
): {
  inputMax?: number;
  outputMax?: number;
  combinedMax?: number; // deprecated alias for totalMax
  totalMax?: number;
} {
  const m = resolveModelFromCatalog(modelId, opts?.catalog);
  const ctx = (m?.context ?? {}) as {
    inputMax?: number;
    outputMax?: number;
    combinedMax?: number;
  };
  return ctx?.combinedMax !== undefined
    ? { ...ctx, totalMax: ctx.combinedMax }
    : ctx;
}

type AIV2Usage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cachedInputTokens?: number;
};

const TOKENS_PER_MILLION = 1_000_000;

/**
 * @deprecated Prefer getUsageData/getTokenCosts with a catalog
 */
export function normalizeUsage(
  usage: UsageLike | NormalizedUsage | undefined | null,
): NormalizedUsage {
  if (!usage) return { input: 0, output: 0, total: 0 };
  if (
    typeof (usage as NormalizedUsage).input === "number" &&
    typeof (usage as NormalizedUsage).output === "number"
  ) {
    const u = usage as NormalizedUsage;
    return {
      input: u.input,
      output: u.output,
      total: u.total ?? u.input + u.output,
    };
  }
  const ul = usage as UsageLike;
  const inputCandidates = [
    ul.input_tokens,
    ul.prompt_tokens,
    ul.promptTokens,
    (ul as unknown as AIV2Usage).inputTokens,
  ].filter((v): v is number => typeof v === "number");
  const outputCandidates = [
    ul.output_tokens,
    ul.completion_tokens,
    ul.completionTokens,
    (ul as unknown as AIV2Usage).outputTokens,
  ].filter((v): v is number => typeof v === "number");
  const totalCandidates = [
    ul.total_tokens,
    ul.totalTokens,
    (ul as unknown as AIV2Usage).totalTokens,
  ].filter((v): v is number => typeof v === "number");
  const input = inputCandidates[0] ?? 0;
  const output = outputCandidates[0] ?? 0;
  const total = totalCandidates[0];
  if (total !== undefined) return { input, output, total };
  return { input, output, total: input + output };
}

/**
 * @deprecated Prefer getUsageData/getTokenCosts with a catalog
 */
export function breakdownTokens(
  usage: UsageLike | NormalizedUsage | TokenBreakdown | undefined | null,
): TokenBreakdown {
  if (!usage)
    return {
      input: 0,
      output: 0,
      total: 0,
      cacheReads: 0,
      cacheWrites: 0,
      reasoningTokens: 0,
    };
  if (
    typeof (usage as TokenBreakdown).input === "number" &&
    typeof (usage as TokenBreakdown).output === "number" &&
    ("cacheReads" in (usage as TokenBreakdown) ||
      "cacheWrites" in (usage as TokenBreakdown) ||
      "total" in (usage as TokenBreakdown))
  ) {
    const u0 = usage as TokenBreakdown;
    return {
      input: u0.input,
      output: u0.output,
      total: u0.total ?? u0.input + u0.output,
      cacheReads: u0.cacheReads,
      cacheWrites: u0.cacheWrites,
      reasoningTokens: u0.reasoningTokens,
    };
  }
  const base = normalizeUsage(usage as UsageLike | NormalizedUsage);
  const u = usage as unknown as Record<string, unknown> as Record<
    string,
    unknown
  > & {
    cache_read_input_tokens?: number;
    cache_read_tokens?: number;
    prompt_cache_hit_tokens?: number;
    prompt_tokens_details?: { cached_tokens?: number };
    promptTokensDetails?: {
      cachedTokens?: number;
      cacheCreationTokens?: number;
    };
    cache_creation_input_tokens?: number;
    cache_creation_tokens?: number;
    prompt_cache_write_tokens?: number;
    cachedInputTokens?: number;
    reasoning_tokens?: number;
    reasoningTokens?: number;
  };
  const cacheReadCandidates = [
    u.cache_read_input_tokens,
    u.cache_read_tokens,
    u.prompt_cache_hit_tokens,
    u.prompt_tokens_details?.cached_tokens,
    u.promptTokensDetails?.cachedTokens,
    u.cachedInputTokens,
  ].filter((v: unknown): v is number => typeof v === "number");
  const cacheWriteCandidates = [
    u.cache_creation_input_tokens,
    u.cache_creation_tokens,
    u.prompt_cache_write_tokens,
    u.promptTokensDetails?.cacheCreationTokens,
  ].filter((v: unknown): v is number => typeof v === "number");
  const cacheReads = cacheReadCandidates[0];
  const cacheWrites = cacheWriteCandidates[0];
  const reasoningCandidates = [u.reasoning_tokens, u.reasoningTokens].filter(
    (v: unknown): v is number => typeof v === "number",
  );
  const reasoningTokens = reasoningCandidates[0];
  return { ...base, cacheReads, cacheWrites, reasoningTokens };
}

/** @deprecated Prefer getContextData/getUsageData */
export type RemainingArgs = {
  modelId: string;
  usage: UsageLike | NormalizedUsage | undefined;
  reserveOutput?: number;
  strategy?: "combined" | "provider-default" | "input-only";
  catalog?: ModelCatalog;
};

/**
 * @deprecated Prefer getContextData/getUsageData with a catalog
 */
export function remainingContext(args: RemainingArgs): {
  remainingInput?: number;
  remainingCombined?: number;
  percentUsed: number;
  model?: Model;
} {
  const model = resolveModelFromCatalog(args.modelId, args.catalog);
  const usage = normalizeUsage(args.usage as UsageLike | NormalizedUsage);
  const reserve = Math.max(0, args.reserveOutput ?? 0);
  const strategy = args.strategy ?? "provider-default";
  if (!model)
    return {
      remainingCombined: undefined,
      remainingInput: undefined,
      percentUsed: 1,
    };
  const { inputMax, combinedMax } = model.context;
  const usedInput = usage.input ?? 0;
  const usedOutput = usage.output ?? 0;
  if (strategy === "input-only" || (!combinedMax && inputMax)) {
    const cap = inputMax ?? Number.POSITIVE_INFINITY;
    const remainingInput = Math.max(0, cap - usedInput);
    const percentUsed =
      cap === Number.POSITIVE_INFINITY
        ? 0
        : clamp01((usedInput + reserve) / cap);
    return { remainingInput, remainingCombined: undefined, percentUsed, model };
  }
  const cap =
    strategy === "combined"
      ? (combinedMax ?? inputMax ?? Number.POSITIVE_INFINITY)
      : (combinedMax ?? Number.POSITIVE_INFINITY);
  const used = usedInput + usedOutput;
  const remainingCombined = Math.max(0, cap - used - reserve);
  const percentUsed =
    cap === Number.POSITIVE_INFINITY ? 0 : clamp01((used + reserve) / cap);
  return {
    remainingCombined,
    remainingInput: inputMax ? Math.max(0, inputMax - usedInput) : undefined,
    percentUsed,
    model,
  };
}

/**
 * @deprecated Prefer getContextData/getUsageData with a catalog
 */
export function fitsContext({
  modelId,
  tokens,
  reserveOutput,
  catalog,
}: {
  modelId: string;
  tokens: number;
  reserveOutput?: number;
  catalog?: ModelCatalog;
}): boolean {
  const m = resolveModelFromCatalog(modelId, catalog);
  if (!m) return false;
  const cap =
    m.context.combinedMax ?? m.context.inputMax ?? Number.POSITIVE_INFINITY;
  return tokens + Math.max(0, reserveOutput ?? 0) <= cap;
}

/**
 * @deprecated Prefer getContextData + filtering models externally
 */
export function pickModelFor(
  tokens: number,
  opts?: {
    provider?: Model["provider"];
    minStatus?: Model["status"];
    buffer?: number;
    catalog?: ModelCatalog;
  },
): Model | undefined {
  const buffer = Math.max(0, opts?.buffer ?? 0);
  const candidates = (
    opts?.catalog ? modelsFromCatalog(opts.catalog) : []
  ) as Model[];
  const filtered = candidates.filter((m) => {
    if (opts?.provider && m.provider !== opts.provider) return false;
    if (opts?.minStatus)
      if (!statusMeets(m.status, opts.minStatus)) return false;
    const cap = m.context.combinedMax ?? m.context.inputMax ?? 0;
    return cap >= tokens + buffer;
  });
  filtered.sort(
    (a, b) =>
      (a.context.combinedMax ??
        a.context.inputMax ??
        Number.POSITIVE_INFINITY) -
      (b.context.combinedMax ?? b.context.inputMax ?? Number.POSITIVE_INFINITY),
  );
  return filtered[0];
}

/**
 * @deprecated Prefer getTokenCosts/getUsageData with a catalog
 */
export function estimateCost({
  modelId,
  usage,
  catalog,
}: {
  modelId: string;
  usage: UsageLike | NormalizedUsage | TokenBreakdown;
  catalog?: ModelCatalog;
}): {
  inputUSD?: number;
  outputUSD?: number;
  totalUSD?: number;
  reasoningUSD?: number;
  cacheReadUSD?: number;
  cacheWriteUSD?: number;
} {
  const model = resolveModelFromCatalog(modelId, catalog);
  if (!model?.pricing) return {};
  const base = normalizeUsage(usage as UsageLike | NormalizedUsage);
  const breakdown = breakdownTokens(
    usage as UsageLike | NormalizedUsage | TokenBreakdown,
  );
  const inputUSD =
    model.pricing.inputPerMTokens !== undefined
      ? (base.input / TOKENS_PER_MILLION) * model.pricing.inputPerMTokens
      : undefined;
  const outputUSD =
    model.pricing.outputPerMTokens !== undefined
      ? (base.output / TOKENS_PER_MILLION) * model.pricing.outputPerMTokens
      : undefined;
  const reasoningUSD =
    model.pricing.reasoningPerMTokens !== undefined &&
    typeof breakdown.reasoningTokens === "number"
      ? (breakdown.reasoningTokens / TOKENS_PER_MILLION) *
        model.pricing.reasoningPerMTokens
      : undefined;
  const cacheReadUSD =
    model.pricing.cacheReadPerMTokens !== undefined &&
    typeof breakdown.cacheReads === "number"
      ? (breakdown.cacheReads / TOKENS_PER_MILLION) *
        model.pricing.cacheReadPerMTokens
      : undefined;
  const cacheWriteUSD =
    model.pricing.cacheWritePerMTokens !== undefined &&
    typeof breakdown.cacheWrites === "number"
      ? (breakdown.cacheWrites / TOKENS_PER_MILLION) *
        model.pricing.cacheWritePerMTokens
      : undefined;
  const totalParts = [
    inputUSD,
    outputUSD,
    reasoningUSD,
    cacheReadUSD,
    cacheWriteUSD,
  ].filter((v): v is number => typeof v === "number");
  const totalUSD = totalParts.length
    ? totalParts.reduce((a, b) => a + b, 0)
    : undefined;
  return {
    inputUSD,
    outputUSD,
    reasoningUSD,
    cacheReadUSD,
    cacheWriteUSD,
    totalUSD,
  };
}

/**
 * @deprecated Prefer getUsageData/getTokenCosts
 */
export function consumedTokens(
  usage: UsageLike | NormalizedUsage | undefined | null,
): number {
  const u = normalizeUsage(usage);
  return u.total ?? u.input + u.output;
}

// Aggregated usage summary (pure, no default catalog fallback)
/** @deprecated Prefer getUsageData/getTokenCosts/getContextData */
export type UsageSummary = {
  modelId?: string;
  context?: ReturnType<typeof getContextWindow>;
  normalized: ReturnType<typeof normalizeUsage>;
  breakdown: ReturnType<typeof breakdownTokens>;
  costUSD?: ReturnType<typeof estimateCost>;
  percentUsed?: number;
};

/**
 * Convert gateway-style ids (e.g. "provider/model") into canonical
 * TokenLens ids ("provider:model"). If already canonical, returns input.
 */
/** @deprecated Internal normalization is automatic; avoid direct use. */
export function toModelId(gatewayId?: string) {
  if (!gatewayId) return undefined as undefined;
  const i = gatewayId.indexOf("/");
  return i > 0
    ? `${gatewayId.slice(0, i)}:${gatewayId.slice(i + 1)}`
    : gatewayId;
}

/**
 * Pure aggregator: summarize usage, cost, and context.
 * Requires an explicit catalog for model-specific fields.
 */
/**
 * @deprecated Prefer getUsageData/getTokenCosts/getContextData
 */
export function summarizeUsage(args: {
  modelId?: string;
  usage: UsageLike | undefined;
  catalog?: ModelCatalog;
  reserveOutput?: number;
}): UsageSummary {
  const normalized = normalizeUsage(args.usage);
  const breakdown = breakdownTokens(args.usage);
  if (!args.modelId) {
    return {
      modelId: undefined,
      context: undefined,
      normalized,
      breakdown,
      costUSD: undefined,
      percentUsed: undefined,
    };
  }
  const rc = remainingContext({
    modelId: args.modelId,
    usage: args.usage ?? {},
    reserveOutput: args.reserveOutput,
    catalog: args.catalog,
  });
  const canonicalId = rc.model?.id ?? toModelId(args.modelId);
  const context =
    rc.model?.context ??
    (canonicalId
      ? getContextWindow(canonicalId, { catalog: args.catalog })
      : undefined);
  const costUSD = canonicalId
    ? estimateCost({
        modelId: canonicalId,
        usage: args.usage ?? {},
        catalog: args.catalog,
      })
    : undefined;
  return {
    modelId: canonicalId,
    context,
    normalized,
    breakdown,
    costUSD,
    percentUsed: rc.percentUsed,
  };
}

// Minimal focused surface
export type ContextData = {
  inputMax?: number;
  outputMax?: number;
  combinedMax?: number;
  totalMax?: number;
};
export type TokenCosts = {
  inputUSD?: number;
  outputUSD?: number;
  totalUSD?: number;
  reasoningUSD?: number;
  cacheReadUSD?: number;
  cacheWriteUSD?: number;
};
export type UsageData = { context?: ContextData; costUSD?: TokenCosts };

// getTokenCosts: object and positional overloads, with alias fields
export function getTokenCosts(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage | TokenBreakdown | undefined;
  providers: ModelCatalog | ProviderInfo;
}): TokenCosts & {
  inputTokenUSD?: number;
  outputTokenUSD?: number;
  reasoningTokenUSD?: number;
  cacheReadsUSD?: number;
  cacheWritesUSD?: number;
};
export function getTokenCosts(
  modelId: string,
  usage: UsageLike | NormalizedUsage | TokenBreakdown | undefined,
  providers: ModelCatalog | ProviderInfo,
): TokenCosts & {
  inputTokenUSD?: number;
  outputTokenUSD?: number;
  reasoningTokenUSD?: number;
  cacheReadsUSD?: number;
  cacheWritesUSD?: number;
};
export function getTokenCosts(
  a:
    | {
        modelId: string;
        usage: UsageLike | NormalizedUsage | TokenBreakdown | undefined;
        providers: ModelCatalog | ProviderInfo;
      }
    | string,
  b?: UsageLike | NormalizedUsage | TokenBreakdown | undefined,
  c?: ModelCatalog | ProviderInfo,
) {
  const modelId = typeof a === "string" ? a : a.modelId;
  const usage = (typeof a === "string" ? b : a.usage) ?? {};
  const providers = (typeof a === "string" ? c : a.providers) as
    | ModelCatalog
    | ProviderInfo;
  const model = resolveModelFromCatalog(modelId, providers);
  if (!model?.pricing) return {} as TokenCosts & { inputTokenUSD?: number };
  const base = normalizeUsage(usage as UsageLike | NormalizedUsage);
  const breakdown = breakdownTokens(
    usage as UsageLike | NormalizedUsage | TokenBreakdown,
  );
  const inputUSD =
    model.pricing.inputPerMTokens !== undefined
      ? (base.input / TOKENS_PER_MILLION) * model.pricing.inputPerMTokens
      : undefined;
  const outputUSD =
    model.pricing.outputPerMTokens !== undefined
      ? (base.output / TOKENS_PER_MILLION) * model.pricing.outputPerMTokens
      : undefined;
  const reasoningUSD =
    model.pricing.reasoningPerMTokens !== undefined &&
    typeof breakdown.reasoningTokens === "number"
      ? (breakdown.reasoningTokens / TOKENS_PER_MILLION) *
        model.pricing.reasoningPerMTokens
      : undefined;
  const cacheReadUSD =
    model.pricing.cacheReadPerMTokens !== undefined &&
    typeof breakdown.cacheReads === "number"
      ? (breakdown.cacheReads / TOKENS_PER_MILLION) *
        model.pricing.cacheReadPerMTokens
      : undefined;
  const cacheWriteUSD =
    model.pricing.cacheWritePerMTokens !== undefined &&
    typeof breakdown.cacheWrites === "number"
      ? (breakdown.cacheWrites / TOKENS_PER_MILLION) *
        model.pricing.cacheWritePerMTokens
      : undefined;
  const totalParts = [
    inputUSD,
    outputUSD,
    reasoningUSD,
    cacheReadUSD,
    cacheWriteUSD,
  ].filter((v): v is number => typeof v === "number");
  const totalUSD = totalParts.length
    ? totalParts.reduce((a, b) => a + b, 0)
    : undefined;
  const res: TokenCosts = {
    inputUSD,
    outputUSD,
    reasoningUSD,
    cacheReadUSD,
    cacheWriteUSD,
    totalUSD,
  };
  return {
    ...res,
    inputTokenUSD: res.inputUSD,
    outputTokenUSD: res.outputUSD,
    reasoningTokenUSD: res.reasoningUSD,
    cacheReadsUSD: res.cacheReadUSD,
    cacheWritesUSD: res.cacheWriteUSD,
  };
}

// getContext: object and positional overloads, with alias fields
export function getContext(args: {
  modelId: string;
  providers: ModelCatalog | ProviderInfo;
}): ContextData & {
  maxInput?: number;
  maxOutput?: number;
  maxTotal?: number;
};
export function getContext(
  modelId: string,
  providers: ModelCatalog | ProviderInfo,
): ContextData & {
  maxInput?: number;
  maxOutput?: number;
  maxTotal?: number;
};
export function getContext(
  a: { modelId: string; providers: ModelCatalog | ProviderInfo } | string,
  b?: ModelCatalog | ProviderInfo,
): ContextData & { maxInput?: number; maxOutput?: number; maxTotal?: number } {
  const modelId = typeof a === "string" ? a : a.modelId;
  const providers = (typeof a === "string" ? b : a.providers) as
    | ModelCatalog
    | ProviderInfo;
  const model = resolveModelFromCatalog(modelId, providers);
  const inputMax = model?.context?.inputMax;
  const outputMax = model?.context?.outputMax;
  const combinedMax = model?.context?.combinedMax;
  const totalMax = combinedMax;
  return {
    inputMax,
    outputMax,
    combinedMax,
    totalMax,
    maxInput: inputMax,
    maxOutput: outputMax,
    maxTotal: totalMax,
  };
}

// getUsage: object and positional overloads
export function getUsage(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage | TokenBreakdown | undefined;
  providers: ModelCatalog;
  reserveOutput?: number;
}): UsageData;
export function getUsage(
  modelId: string,
  usage: UsageLike | NormalizedUsage | TokenBreakdown | undefined,
  providers: ModelCatalog,
  reserveOutput?: number,
): UsageData;
export function getUsage(
  a:
    | {
        modelId: string;
        usage: UsageLike | NormalizedUsage | TokenBreakdown | undefined;
        providers: ModelCatalog;
        reserveOutput?: number;
      }
    | string,
  b?: UsageLike | NormalizedUsage | TokenBreakdown | undefined,
  c?: ModelCatalog,
  _d?: number,
): UsageData {
  const modelId = typeof a === "string" ? a : a.modelId;
  const usage = typeof a === "string" ? b : a.usage;
  const providers = (typeof a === "string" ? c : a.providers) as ModelCatalog;
  const context = getContext(modelId, providers);
  const costUSD = getTokenCosts(modelId, usage, providers);
  return { context, costUSD };
}

/**
 * @deprecated Prefer getContextData/getUsageData
 */
export function percentRemaining(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  catalog?: ModelCatalog;
}): number {
  const rc = remainingContext({
    modelId: args.modelId,
    usage: args.usage,
    reserveOutput: args.reserveOutput,
    catalog: args.catalog,
  });
  return 1 - rc.percentUsed;
}

/**
 * @deprecated Prefer getContextData/getUsageData
 */
export function shouldCompact(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  threshold?: number;
  catalog?: ModelCatalog;
}): boolean {
  const threshold = Math.max(0, Math.min(1, args.threshold ?? 0.85));
  const rc = remainingContext({
    modelId: args.modelId,
    usage: args.usage,
    reserveOutput: args.reserveOutput,
    catalog: args.catalog,
  });
  return rc.percentUsed >= threshold;
}

/**
 * @deprecated Prefer getContextData/getUsageData
 */
export function contextHealth(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  warnAt?: number;
  compactAt?: number;
  catalog?: ModelCatalog;
}): {
  percentUsed: number;
  remaining?: number;
  status: "ok" | "warn" | "compact";
} {
  const warnAt = Math.max(0, Math.min(1, args.warnAt ?? 0.75));
  const compactAt = Math.max(0, Math.min(1, args.compactAt ?? 0.85));
  const rc = remainingContext({
    modelId: args.modelId,
    usage: args.usage,
    reserveOutput: args.reserveOutput,
    catalog: args.catalog,
  });
  const remaining = rc.remainingCombined ?? rc.remainingInput;
  const status: "ok" | "warn" | "compact" =
    rc.percentUsed >= compactAt
      ? "compact"
      : rc.percentUsed >= warnAt
        ? "warn"
        : "ok";
  return { percentUsed: rc.percentUsed, remaining, status };
}

/**
 * @deprecated Prefer getContextData/getUsageData
 */
export function tokensToCompact(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  targetPercent?: number;
  catalog?: ModelCatalog;
}): number {
  const model = resolveModelFromCatalog(args.modelId, args.catalog);
  if (!model) return 0;
  const u = normalizeUsage(args.usage);
  const used = u.input + u.output;
  const cap = model.context.combinedMax ?? model.context.inputMax;
  if (!cap || !Number.isFinite(cap)) return 0;
  const reserve = Math.max(0, args.reserveOutput ?? 0);
  const targetPercent = Math.max(0, Math.min(1, args.targetPercent ?? 0.6));
  const targetUsedBudget = Math.max(0, cap * targetPercent - reserve);
  return Math.max(0, used - targetUsedBudget);
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function statusMeets(actual: Model["status"], min: Model["status"]): boolean {
  const order: Record<Model["status"], number> = {
    retired: 0,
    deprecated: 1,
    preview: 2,
    stable: 3,
  } as const;
  return order[actual] >= order[min];
}

// Dynamic model resolution using either the installed registry or a live catalog
function resolveModelFromCatalog(
  idOrAlias: string,
  providers?: ModelCatalog | ProviderInfo,
): Model | undefined {
  if (!providers) return undefined;
  const base = idOrAlias.trim().toLowerCase();
  const candidates: string[] = [base];
  // Accept provider/model by translating to provider:model
  if (base.includes("/")) {
    const i = base.indexOf("/");
    const p = base.slice(0, i);
    const rest = base.slice(i + 1);
    candidates.push(`${p}:${rest}`);
    // try dot→dash in model segment (e.g. claude-3.5 → claude-3-5)
    candidates.push(`${p}:${rest.replace(/(\d)\.(\d)/g, "$1-$2")}`);
  }
  // For provider:id, also try dot→dash variant
  if (base.includes(":")) {
    const i = base.indexOf(":");
    const p = base.slice(0, i);
    const rest = base.slice(i + 1);
    candidates.push(`${p}:${rest.replace(/(\d)\.(\d)/g, "$1-$2")}`);
  }
  // For providerless ids, also try dot→dash variant across providers
  if (!base.includes(":") && !base.includes("/")) {
    candidates.push(base.replace(/(\d)\.(\d)/g, "$1-$2"));
  }
  for (const key of candidates) {
    // provider-prefixed
    const idx = key.indexOf(":");
    if (idx > 0) {
      const providerKey = key.slice(0, idx);
      const mid = key.slice(idx + 1);
      for (const [provKey, prov] of iterateProviders(providers)) {
        if (mid) {
          const m = prov?.models?.[mid as string];
          if (m && (provKey === providerKey || providerKey.length > 0))
            return mapModelsDevEntry(provKey, mid, m, prov);
        }
      }
    }
    // providerless: search across providers
    for (const [provKey, prov] of iterateProviders(providers)) {
      const m = prov?.models?.[key as string];
      if (m) return mapModelsDevEntry(provKey, key, m, prov);
    }
  }
  return undefined;
}

function mapModelsDevEntry(
  provider: string,
  modelId: string,
  m: {
    modalities?: { input?: unknown; output?: unknown };
    limit?: { context?: number; input?: number; output?: number };
    cost?: {
      input?: number;
      output?: number;
      reasoning?: number;
      cache_read?: number;
      cache_write?: number;
    };
    name?: string;
    release_date?: string;
    last_updated?: string;
  },
  prov: { doc?: string; models?: Record<string, unknown> } & Record<
    string,
    unknown
  >,
): Model {
  const inputMods: string[] = Array.isArray(m?.modalities?.input)
    ? (m.modalities?.input as string[])
    : [];
  const outputMods: string[] = Array.isArray(m?.modalities?.output)
    ? (m.modalities?.output as string[])
    : [];
  const textIn = inputMods.includes("text");
  const imageIn = inputMods.includes("image");
  const textOut = outputMods.includes("text");
  const combinedMax =
    typeof m?.limit?.context === "number" ? m.limit.context : undefined;
  const inputMax =
    typeof m?.limit?.input === "number" ? m.limit.input : undefined;
  const outputMax =
    typeof m?.limit?.output === "number" ? m.limit.output : undefined;
  const pricing =
    m?.cost &&
    (typeof m.cost.input === "number" ||
      typeof m.cost.output === "number" ||
      typeof m.cost.reasoning === "number" ||
      typeof m.cost.cache_read === "number" ||
      typeof m.cost.cache_write === "number")
      ? {
          ...(typeof m.cost.input === "number"
            ? { inputPerMTokens: m.cost.input }
            : {}),
          ...(typeof m.cost.output === "number"
            ? { outputPerMTokens: m.cost.output }
            : {}),
          ...(typeof m.cost.reasoning === "number"
            ? { reasoningPerMTokens: m.cost.reasoning }
            : {}),
          ...(typeof m.cost.cache_read === "number"
            ? { cacheReadPerMTokens: m.cost.cache_read }
            : {}),
          ...(typeof m.cost.cache_write === "number"
            ? { cacheWritePerMTokens: m.cost.cache_write }
            : {}),
        }
      : undefined;
  return {
    id: `${provider}:${modelId}`,
    provider,
    vendorId: modelId,
    displayName: m?.name || modelId,
    family: modelId,
    status: "stable",
    context: Object.fromEntries(
      Object.entries({ combinedMax, inputMax, outputMax }).filter(
        ([, v]) => typeof v === "number",
      ),
    ),
    modalities:
      textIn || textOut || imageIn
        ? {
            ...(textIn && { textIn: true }),
            ...(textOut && { textOut: true }),
            ...(imageIn && { imageIn: true }),
          }
        : undefined,
    pricing,
    pricingSource: "models.dev",
    aliases: [`${provider}/${modelId}`],
    releasedAt: m?.release_date || undefined,
    source:
      (prov as { doc?: string } & Record<string, unknown>)?.doc ||
      ((prov as Record<string, unknown>).docs as string) ||
      "https://models.dev",
    contextSource:
      (prov as { doc?: string } & Record<string, unknown>)?.doc ||
      ((prov as Record<string, unknown>).docs as string) ||
      undefined,
    verifiedAt: m?.last_updated || undefined,
  } as Model;
}

function modelsFromCatalog(catalog: ModelCatalog): Model[] {
  const out: Model[] = [];
  for (const [provKey, prov] of Object.entries(catalog)) {
    for (const mid of Object.keys(prov?.models ?? {})) {
      const m = (prov as { models?: Record<string, unknown> }).models?.[
        mid
      ] as Parameters<typeof mapModelsDevEntry>[2];
      out.push(mapModelsDevEntry(provKey, mid, m, prov));
    }
  }
  return out;
}

// Internal: iterate providers uniformly whether a full catalog or a single provider was supplied
function* iterateProviders(
  providers: ModelCatalog | ProviderInfo,
): Generator<[string, ProviderInfo]> {
  if ((providers as ProviderInfo)?.models) {
    const p = providers as ProviderInfo;
    const key = (p as { id?: string }).id || "provider";
    yield [key, p];
    return;
  }
  for (const [key, prov] of Object.entries(providers as ModelCatalog)) {
    // prov is ProviderInfo
    yield [key, prov as ProviderInfo];
  }
}
