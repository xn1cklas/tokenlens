import type { SourceModel, Usage } from "@tokenlens/core";
import { normalizeUsage, perMTokensToUnitCostUSD, round6 } from "./internal.js";

export type TokenCosts = {
  inputTokenCostUSD: number;
  outputTokenCostUSD: number;
  reasoningTokenCostUSD?: number;
  cacheReadTokenCostUSD?: number;
  cacheWriteTokenCostUSD?: number;
  totalTokenCostUSD: number;
  ratesUsed: {
    inputPerMTokens?: number;
    outputPerMTokens?: number;
    reasoningPerMTokens?: number;
    cacheReadPerMTokens?: number;
    cacheWritePerMTokens?: number;
  };
};

function usableRate(rate?: number): number | undefined {
  return rate !== undefined && Number.isFinite(rate) && rate >= 0
    ? rate
    : undefined;
}

export function computeTokenCostsForModel(args: {
  model?: SourceModel;
  usage: Usage;
}): TokenCosts {
  const { model, usage } = args;
  const normalized = normalizeUsage(usage);
  const rawCost = model?.cost ?? {};
  const cost = {
    input: usableRate(rawCost.input),
    output: usableRate(rawCost.output),
    reasoning: usableRate(rawCost.reasoning),
    cache_read: usableRate(rawCost.cache_read),
    cache_write: usableRate(rawCost.cache_write),
  };
  const cacheReadTokens = normalized.cacheReads ?? 0;
  const cacheWriteTokens = normalized.cacheWrites ?? 0;
  const reasoningTokens = normalized.reasoningTokens ?? 0;
  const cacheReadHasRate = cost.cache_read !== undefined;
  const cacheWriteHasRate = cost.cache_write !== undefined;
  const cacheTokensIncludedInInput =
    normalized.cacheTokensIncludedInInput !== false;
  const inputTokenAdjustment = cacheTokensIncludedInInput
    ? (cacheReadHasRate ? cacheReadTokens : 0) +
      (cacheWriteHasRate ? cacheWriteTokens : 0)
    : 0;
  const billableInputTokens = Math.max(
    0,
    normalized.input - inputTokenAdjustment,
  );
  const hasReasoningRate = cost.reasoning !== undefined;
  const billableOutputTokens =
    hasReasoningRate && normalized.reasoningIncludedInOutput
      ? Math.max(0, normalized.output - reasoningTokens)
      : normalized.output;
  const inputUSD = perMTokensToUnitCostUSD(billableInputTokens, cost.input);
  const outputUSD = perMTokensToUnitCostUSD(billableOutputTokens, cost.output);
  const reasoningUSD =
    reasoningTokens && hasReasoningRate
      ? perMTokensToUnitCostUSD(reasoningTokens, cost.reasoning)
      : 0;
  const cacheReadUSD =
    cacheReadTokens && cacheReadHasRate
      ? perMTokensToUnitCostUSD(cacheReadTokens, cost.cache_read)
      : 0;
  const cacheWriteUSD =
    cacheWriteTokens && cacheWriteHasRate
      ? perMTokensToUnitCostUSD(cacheWriteTokens, cost.cache_write)
      : 0;
  const total =
    inputUSD + outputUSD + reasoningUSD + cacheReadUSD + cacheWriteUSD;

  return {
    inputTokenCostUSD: round6(inputUSD),
    outputTokenCostUSD: round6(outputUSD),
    ...(reasoningUSD ? { reasoningTokenCostUSD: round6(reasoningUSD) } : {}),
    ...(cacheReadUSD ? { cacheReadTokenCostUSD: round6(cacheReadUSD) } : {}),
    ...(cacheWriteUSD ? { cacheWriteTokenCostUSD: round6(cacheWriteUSD) } : {}),
    totalTokenCostUSD: round6(total),
    ratesUsed: {
      ...(cost.input !== undefined ? { inputPerMTokens: cost.input } : {}),
      ...(cost.output !== undefined ? { outputPerMTokens: cost.output } : {}),
      ...(cost.reasoning !== undefined
        ? { reasoningPerMTokens: cost.reasoning }
        : {}),
      ...(cost.cache_read !== undefined
        ? { cacheReadPerMTokens: cost.cache_read }
        : {}),
      ...(cost.cache_write !== undefined
        ? { cacheWritePerMTokens: cost.cache_write }
        : {}),
    },
  };
}
