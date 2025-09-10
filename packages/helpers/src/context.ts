import type {
  Model,
  ModelsDevApi,
  NormalizedUsage,
  TokenBreakdown,
  UsageLike,
} from "@tokenlens/core";

/**
 * Return the raw context window caps for a model id (canonical or alias).
 */
export function getContextWindow(
  modelId: string,
  opts?: { catalog?: ModelsDevApi },
): {
  inputMax?: number;
  outputMax?: number;
  combinedMax?: number;
} {
  const m = resolveModelFromCatalog(modelId, opts?.catalog);
  return m?.context ?? {};
}

type AIV2Usage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cachedInputTokens?: number;
};

const TOKENS_PER_MILLION = 1_000_000;

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

export type RemainingArgs = {
  modelId: string;
  usage: UsageLike | NormalizedUsage | undefined;
  reserveOutput?: number;
  strategy?: "combined" | "provider-default" | "input-only";
  catalog?: ModelsDevApi;
};

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

export function fitsContext({
  modelId,
  tokens,
  reserveOutput,
  catalog,
}: {
  modelId: string;
  tokens: number;
  reserveOutput?: number;
  catalog?: ModelsDevApi;
}): boolean {
  const m = resolveModelFromCatalog(modelId, catalog);
  if (!m) return false;
  const cap =
    m.context.combinedMax ?? m.context.inputMax ?? Number.POSITIVE_INFINITY;
  return tokens + Math.max(0, reserveOutput ?? 0) <= cap;
}

export function pickModelFor(
  tokens: number,
  opts?: {
    provider?: Model["provider"];
    minStatus?: Model["status"];
    buffer?: number;
    catalog?: ModelsDevApi;
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

export function estimateCost({
  modelId,
  usage,
  catalog,
}: {
  modelId: string;
  usage: UsageLike | NormalizedUsage | TokenBreakdown;
  catalog?: ModelsDevApi;
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

export function consumedTokens(
  usage: UsageLike | NormalizedUsage | undefined | null,
): number {
  const u = normalizeUsage(usage);
  return u.total ?? u.input + u.output;
}

export function percentRemaining(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  catalog?: ModelsDevApi;
}): number {
  const rc = remainingContext({
    modelId: args.modelId,
    usage: args.usage,
    reserveOutput: args.reserveOutput,
    catalog: args.catalog,
  });
  return 1 - rc.percentUsed;
}

export function shouldCompact(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  threshold?: number;
  catalog?: ModelsDevApi;
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

export function contextHealth(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  warnAt?: number;
  compactAt?: number;
  catalog?: ModelsDevApi;
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

export function tokensToCompact(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  targetPercent?: number;
  catalog?: ModelsDevApi;
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
  catalog?: ModelsDevApi,
): Model | undefined {
  if (!catalog) return undefined;
  // Support canonical provider:id or providerless id; no custom alias mapping here.
  const key = idOrAlias.trim();
  let provider: string | undefined;
  let mid: string | undefined;
  const idx = key.indexOf(":");
  if (idx > 0) {
    provider = key.slice(0, idx);
    mid = key.slice(idx + 1);
    const prov = catalog[provider];
    if (mid) {
      const m = prov?.models?.[mid];
      if (m) return mapModelsDevEntry(provider, mid, m, prov);
    }
  }
  // providerless: search across providers
  for (const [provKey, prov] of Object.entries(catalog)) {
    const m = prov?.models?.[key as string];
    if (m) return mapModelsDevEntry(provKey, key, m, prov);
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
    ? m.modalities.input
    : [];
  const outputMods: string[] = Array.isArray(m?.modalities?.output)
    ? m.modalities.output
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

function modelsFromCatalog(catalog: ModelsDevApi): Model[] {
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
