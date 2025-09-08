import { resolveModel, models } from './registry.js';
import type { Model, NormalizedUsage, UsageLike, TokenBreakdown } from './types.js';
import type { ModelId } from './registry.js';

/**
 * Return the raw context window caps for a model id (canonical or alias).
 */
export function getContextWindow(modelId: ModelId | string): { inputMax?: number; outputMax?: number; combinedMax?: number } {
  const m = resolveModel(modelId);
  return m?.context ?? {};
}

/**
 * Normalize various provider usage shapes into a consistent `{ input, output, total }` object.
 * Missing fields default to `0`. If a provider supplies a `total`, it is preserved.
 */
type AIV2Usage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cachedInputTokens?: number;
};

const TOKENS_PER_MILLION = 1_000_000;

export function normalizeUsage(usage: UsageLike | NormalizedUsage | undefined | null): NormalizedUsage {
  if (!usage) {
    return { input: 0, output: 0, total: 0 };
  }
  // Pass-through when already normalized
  if (typeof (usage as NormalizedUsage).input === 'number' && typeof (usage as NormalizedUsage).output === 'number') {
    const u = usage as NormalizedUsage;
    return { input: u.input, output: u.output, total: u.total ?? u.input + u.output };
  }
  const ul = usage as UsageLike;
  const inputCandidates = [
    ul.input_tokens,
    ul.prompt_tokens,
    ul.promptTokens,
    // Vercel AI SDK v2 (@ai-sdk/provider)
    (ul as unknown as AIV2Usage).inputTokens,
  ].filter((v): v is number => typeof v === 'number');
  const outputCandidates = [
    ul.output_tokens,
    ul.completion_tokens,
    ul.completionTokens,
    // Vercel AI SDK v2 (@ai-sdk/provider)
    (ul as unknown as AIV2Usage).outputTokens,
  ].filter((v): v is number => typeof v === 'number');
  const totalCandidates = [
    ul.total_tokens,
    ul.totalTokens,
    // Vercel AI SDK v2 (@ai-sdk/provider)
    (ul as unknown as AIV2Usage).totalTokens,
  ].filter((v): v is number => typeof v === 'number');

  const input = inputCandidates[0] ?? 0;
  const output = outputCandidates[0] ?? 0;
  const total = totalCandidates[0];

  if (total !== undefined) {
    // If total doesn't equal input+output due to provider semantics, keep both.
    return { input, output, total };
  }
  return { input, output, total: input + output };
}

/**
 * Attempts to extract granular token breakdown including cache read/write counts
 * from various provider shapes. If fields are unavailable, cache fields remain undefined.
 */
export function breakdownTokens(usage: UsageLike | NormalizedUsage | TokenBreakdown | undefined | null): TokenBreakdown {
  if (!usage) {
    return { input: 0, output: 0, total: 0, cacheReads: 0, cacheWrites: 0, reasoningTokens: 0 };
  }
  // Pass-through when already a breakdown
  if (
    typeof (usage as TokenBreakdown).input === 'number' &&
    typeof (usage as TokenBreakdown).output === 'number' &&
    // cache fields optional
    ('cacheReads' in (usage as TokenBreakdown) || 'cacheWrites' in (usage as TokenBreakdown) || 'total' in (usage as TokenBreakdown))
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
  const u = usage as unknown as Record<string, unknown> & {
    cache_read_input_tokens?: number;
    cache_read_tokens?: number;
    prompt_cache_hit_tokens?: number;
    prompt_tokens_details?: { cached_tokens?: number };
    promptTokensDetails?: { cachedTokens?: number; cacheCreationTokens?: number };
    cache_creation_input_tokens?: number;
    cache_creation_tokens?: number;
    cachedInputTokens?: number;
    reasoning_tokens?: number;
    reasoningTokens?: number;
  };

  // Known/observed field names across providers (Anthropic/OpenAI) and SDKs
  const cacheReadCandidates = [
    u.cache_read_input_tokens,
    u.cache_read_tokens,
    u.prompt_cache_hit_tokens,
    u.prompt_tokens_details?.cached_tokens,
    u.promptTokensDetails?.cachedTokens,
    // Vercel AI SDK v2 (@ai-sdk/provider)
    u.cachedInputTokens,
  ].filter((v: unknown): v is number => typeof v === 'number');

  const cacheWriteCandidates = [
    u.cache_creation_input_tokens,
    u.cache_creation_tokens,
    u.prompt_cache_write_tokens,
    u.promptTokensDetails?.cacheCreationTokens,
  ].filter((v: unknown): v is number => typeof v === 'number');

  const cacheReads = cacheReadCandidates[0];
  const cacheWrites = cacheWriteCandidates[0];

  // Reasoning tokens (OpenAI o-series, AI SDK v2, others)
  const reasoningCandidates = [u.reasoning_tokens, u.reasoningTokens].filter((v: unknown): v is number => typeof v === 'number');
  const reasoningTokens = reasoningCandidates[0];
  return { ...base, cacheReads, cacheWrites, reasoningTokens };
}

export type RemainingArgs = {
  modelId: ModelId | string;
  usage: UsageLike | NormalizedUsage | undefined;
  reserveOutput?: number;
  strategy?: 'combined' | 'provider-default' | 'input-only';
};

/**
 * Compute remaining context for a model given usage so far.
 * - `reserveOutput` protects future output budget (e.g. reserve 256 tokens for the reply).
 * - `strategy` controls which cap is used when models expose both input and combined caps.
 */
export function remainingContext(args: RemainingArgs): {
  remainingInput?: number;
  remainingCombined?: number;
  percentUsed: number; // 0..1 based on the chosen constraint
  model?: Model;
} {
  const model = resolveModel(args.modelId);
  const usage = normalizeUsage(args.usage as UsageLike | NormalizedUsage);
  const reserve = Math.max(0, args.reserveOutput ?? 0);
  const strategy = args.strategy ?? 'provider-default';

  if (!model) {
    return { remainingCombined: undefined, remainingInput: undefined, percentUsed: 1 };
  }

  const { inputMax, combinedMax } = model.context;
  const usedInput = usage.input ?? 0;
  const usedOutput = usage.output ?? 0;

  if (strategy === 'input-only' || (!combinedMax && inputMax)) {
    const cap = inputMax ?? Number.POSITIVE_INFINITY;
    const remainingInput = Math.max(0, cap - usedInput);
    const percentUsed = cap === Number.POSITIVE_INFINITY ? 0 : clamp01((usedInput + reserve) / cap);
    return { remainingInput, remainingCombined: undefined, percentUsed, model };
  }

  // Combined or provider-default
  const cap = strategy === 'combined' ? combinedMax ?? inputMax ?? Number.POSITIVE_INFINITY : combinedMax ?? Number.POSITIVE_INFINITY;
  const used = usedInput + usedOutput;
  const remainingCombined = Math.max(0, cap - used - reserve);
  const percentUsed = cap === Number.POSITIVE_INFINITY ? 0 : clamp01((used + reserve) / cap);
  return { remainingCombined, remainingInput: inputMax ? Math.max(0, inputMax - usedInput) : undefined, percentUsed, model };
}

/**
 * Quick check whether a token count fits within a model's context window,
 * optionally reserving some budget for future output.
 */
export function fitsContext({ modelId, tokens, reserveOutput }: { modelId: ModelId | string; tokens: number; reserveOutput?: number }): boolean {
  const m = resolveModel(modelId);
  if (!m) return false;
  const cap = m.context.combinedMax ?? m.context.inputMax ?? Number.POSITIVE_INFINITY;
  return tokens + Math.max(0, reserveOutput ?? 0) <= cap;
}

/**
 * Pick the smallest-capacity model that can fit the given token count,
 * with optional provider and minimum status filtering.
 * `buffer` can be used to add a safety margin to the token count when searching.
 */
export function pickModelFor(
  tokens: number,
  opts?: { provider?: Model['provider']; minStatus?: Model['status']; buffer?: number }
): Model | undefined {
  const buffer = Math.max(0, opts?.buffer ?? 0);
  const candidates = Object.values(models) as Model[];
  const filtered = candidates.filter((m) => {
    if (opts?.provider && m.provider !== opts.provider) return false;
    if (opts?.minStatus) {
      if (!statusMeets(m.status, opts.minStatus)) return false;
    }
    const cap = m.context.combinedMax ?? m.context.inputMax ?? 0;
    return cap >= tokens + buffer;
  });
  // Smallest cap that fits
  filtered.sort((a, b) => (a.context.combinedMax ?? a.context.inputMax ?? Number.POSITIVE_INFINITY) - (b.context.combinedMax ?? b.context.inputMax ?? Number.POSITIVE_INFINITY));
  return filtered[0];
}

/**
 * Estimate USD cost from usage based on the model's configured pricing hints.
 * Returns partial values when only one direction (input/output) is available.
 */
export function estimateCost({ modelId, usage }: { modelId: string; usage: UsageLike | NormalizedUsage }): {
  inputUSD?: number;
  outputUSD?: number;
  totalUSD?: number;
} {
  const model = resolveModel(modelId);
  if (!model?.pricing) return {};
  const u = normalizeUsage(usage);
  const inputUSD = model.pricing.inputPerMTokens !== undefined ? (u.input / TOKENS_PER_MILLION) * model.pricing.inputPerMTokens : undefined;
  const outputUSD = model.pricing.outputPerMTokens !== undefined ? (u.output / TOKENS_PER_MILLION) * model.pricing.outputPerMTokens : undefined;
  const totalUSD =
    inputUSD !== undefined && outputUSD !== undefined ? inputUSD + outputUSD : inputUSD ?? outputUSD;
  return { inputUSD, outputUSD, totalUSD };
}

/**
 * Convenience: total consumed tokens from a usage object.
 */
export function consumedTokens(usage: UsageLike | NormalizedUsage | undefined | null): number {
  const u = normalizeUsage(usage);
  return u.total ?? (u.input + u.output);
}

/**
 * Proportion of remaining context (0..1), complement to percent used.
 */
export function percentRemaining(args: { modelId: ModelId | string; usage: UsageLike | NormalizedUsage; reserveOutput?: number }): number {
  const rc = remainingContext({ modelId: args.modelId, usage: args.usage, reserveOutput: args.reserveOutput });
  return 1 - rc.percentUsed;
}

/**
 * Returns whether compaction is recommended based on a threshold of percent used.
 */
export function shouldCompact(args: {
  modelId: ModelId | string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  threshold?: number; // default 0.85
}): boolean {
  const threshold = Math.max(0, Math.min(1, args.threshold ?? 0.85));
  const rc = remainingContext({ modelId: args.modelId, usage: args.usage, reserveOutput: args.reserveOutput });
  return rc.percentUsed >= threshold;
}

/**
 * Returns a simple health summary for UI badges/meters.
 */
export function contextHealth(args: {
  modelId: ModelId | string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  warnAt?: number; // default 0.75
  compactAt?: number; // default 0.85
}): { percentUsed: number; remaining?: number; status: 'ok' | 'warn' | 'compact' } {
  const warnAt = Math.max(0, Math.min(1, args.warnAt ?? 0.75));
  const compactAt = Math.max(0, Math.min(1, args.compactAt ?? 0.85));
  const rc = remainingContext({ modelId: args.modelId, usage: args.usage, reserveOutput: args.reserveOutput });
  const remaining = rc.remainingCombined ?? rc.remainingInput;
  const status: 'ok' | 'warn' | 'compact' = rc.percentUsed >= compactAt ? 'compact' : rc.percentUsed >= warnAt ? 'warn' : 'ok';
  return { percentUsed: rc.percentUsed, remaining, status };
}

/**
 * Rough guidance: how many tokens to remove/summarize to reach a target percent used.
 */
export function tokensToCompact(args: {
  modelId: ModelId | string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  targetPercent?: number; // default 0.6
}): number {
  const model = resolveModel(args.modelId);
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

// Helpers
function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function statusMeets(actual: Model['status'], min: Model['status']): boolean {
  const order: Record<Model['status'], number> = { retired: 0, deprecated: 1, preview: 2, stable: 3 };
  return order[actual] >= order[min];
}

// no-op
