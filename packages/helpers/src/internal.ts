import type { Usage } from "@tokenlens/core/types";

export type NormalizedUsage = {
  input: number;
  output: number;
  total?: number;
  reasoningTokens?: number;
  cacheReads?: number;
  cacheWrites?: number;
};

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
  const reasoningTokens =
    num(u["reasoning_tokens"]) ?? num(u["reasoningTokens"]) ?? undefined;
  const cacheReads =
    num(u["cache_read_tokens"]) ??
    num(u["cacheReads"]) ??
    num(u["cacheReadTokens"]) ??
    undefined;
  const cacheWrites =
    num(u["cache_write_tokens"]) ??
    num(u["cacheWrites"]) ??
    num(u["cacheWriteTokens"]) ??
    undefined;
  return {
    input: prompt,
    output: completion,
    ...(total !== undefined ? { total } : {}),
    ...(reasoningTokens !== undefined ? { reasoningTokens } : {}),
    ...(cacheReads !== undefined ? { cacheReads } : {}),
    ...(cacheWrites !== undefined ? { cacheWrites } : {}),
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
