import type { TokenBreakdown, Usage } from "@tokenlens/core";

export type NormalizedUsage = TokenBreakdown;

export function normalizeUsage(usage: Usage): NormalizedUsage {
  const u = (usage as Record<string, unknown>) ?? {};
  const num = (x: unknown): number | undefined =>
    typeof x === "number" && Number.isFinite(x) ? x : undefined;
  const firstNum = (...keys: string[]): number => {
    for (const k of keys) {
      const v = num(u[k]);
      if (v !== undefined) return v;
    }
    return 0;
  };
  const nestedNum = (
    objectKey: string,
    valueKey: string,
  ): number | undefined => {
    const value = u[objectKey];
    if (!value || typeof value !== "object") return undefined;
    return num((value as Record<string, unknown>)[valueKey]);
  };
  const prompt = firstNum(
    "prompt_tokens",
    "promptTokens",
    "input_tokens",
    "inputTokens",
  );
  const completion = firstNum(
    "completion_tokens",
    "completionTokens",
    "output_tokens",
    "outputTokens",
  );
  const total = num(u["total_tokens"]) ?? num(u["totalTokens"]) ?? undefined;
  const nestedReasoningTokens = nestedNum(
    "completion_tokens_details",
    "reasoning_tokens",
  );
  const reasoningTokens =
    num(u["reasoning_tokens"]) ??
    num(u["reasoningTokens"]) ??
    nestedReasoningTokens;
  const openAiCacheReads = nestedNum("prompt_tokens_details", "cached_tokens");
  const anthropicCacheReads = num(u["cache_read_input_tokens"]);
  const anthropicCacheWrites = num(u["cache_creation_input_tokens"]);
  const flatCacheReads =
    num(u["cache_read_tokens"]) ??
    num(u["cacheReads"]) ??
    num(u["cacheReadTokens"]) ??
    num(u["cachedInputTokens"]);
  const flatCacheWrites =
    num(u["cache_write_tokens"]) ??
    num(u["cacheWrites"]) ??
    num(u["cacheWriteTokens"]);
  const cacheReads = flatCacheReads ?? openAiCacheReads ?? anthropicCacheReads;
  const cacheWrites = flatCacheWrites ?? anthropicCacheWrites;
  const hasCacheBreakdown =
    cacheReads !== undefined || cacheWrites !== undefined;
  const hasAnthropicCacheBreakdown =
    (anthropicCacheReads !== undefined || anthropicCacheWrites !== undefined) &&
    flatCacheReads === undefined &&
    flatCacheWrites === undefined &&
    openAiCacheReads === undefined;
  const hasReasoningBreakdown = reasoningTokens !== undefined;
  return {
    input: prompt,
    output: completion,
    ...(total !== undefined ? { total } : {}),
    ...(reasoningTokens !== undefined ? { reasoningTokens } : {}),
    ...(cacheReads !== undefined ? { cacheReads } : {}),
    ...(cacheWrites !== undefined ? { cacheWrites } : {}),
    ...(hasCacheBreakdown
      ? { cacheTokensIncludedInInput: !hasAnthropicCacheBreakdown }
      : {}),
    ...(hasReasoningBreakdown
      ? { reasoningIncludedInOutput: completion > 0 }
      : {}),
  };
}

export function perMTokensToUnitCostUSD(
  tokens: number,
  ratePerMTokens?: number,
): number {
  if (!ratePerMTokens || ratePerMTokens < 0 || !Number.isFinite(tokens))
    return 0;
  return (tokens * ratePerMTokens) / 1_000_000;
}

export function round6(n: number): number {
  return Math.round(n * 1_000_000) / 1_000_000;
}
