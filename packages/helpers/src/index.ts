import type { SourceModel, Usage } from "@tokenlens/core";
import { normalizeUsage, perMTokensToUnitCostUSD, round6 } from "./internal.js";

// moved model resolution into @tokenlens/tokenlens core

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

export function computeTokenCostsForModel(args: {
  model?: SourceModel;
  usage: Usage;
}): TokenCosts {
  const { model, usage } = args;
  const normalized = normalizeUsage(usage);
  const cost = model?.cost ?? {};
  const inputUSD = perMTokensToUnitCostUSD(normalized.input, cost.input);
  const outputUSD = perMTokensToUnitCostUSD(normalized.output, cost.output);
  const reasoningUSD = normalized.reasoningTokens
    ? perMTokensToUnitCostUSD(normalized.reasoningTokens, cost.reasoning)
    : 0;
  const cacheReadUSD = normalized.cacheReads
    ? perMTokensToUnitCostUSD(normalized.cacheReads, cost.cache_read)
    : 0;
  const cacheWriteUSD = normalized.cacheWrites
    ? perMTokensToUnitCostUSD(normalized.cacheWrites, cost.cache_write)
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
