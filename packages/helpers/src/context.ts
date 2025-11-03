import type { SourceModel, Usage } from "@tokenlens/core";
import { normalizeUsage } from "./internal.js";

export type ContextHealth = {
  /** Total context window size in tokens */
  totalTokens: number;
  /** Number of tokens used (input + output + reasoning + cache reads + cache writes). Cache tokens consume model context even though they're subsets of input for pricing purposes. */
  usedTokens: number;
  /** Number of tokens remaining */
  remainingTokens: number;
  /** Percentage of context used (0-100) */
  usedPercentage: number;
  /** Percentage of context remaining (0-100) */
  remainingPercentage: number;
  /** Health status based on usage */
  status: "healthy" | "warning" | "critical";
};

/**
 * Calculate context window health metrics for a model and usage.
 *
 * Returns detailed information about context usage including:
 * - Total, used, and remaining tokens
 * - Usage percentages
 * - Health status (healthy: <70%, warning: 70-90%, critical: >90%)
 *
 * @param args - Model and usage information
 * @returns Context health metrics or undefined if context limit is unavailable
 *
 * @example
 * ```ts
 * const health = getContextHealth({
 *   model: { limit: { context: 128000 } },
 *   usage: { input_tokens: 50000, output_tokens: 10000 }
 * });
 *
 * console.log(health?.remainingTokens); // 68000
 * console.log(health?.remainingPercentage); // 53.125
 * console.log(health?.status); // "healthy"
 * ```
 */
export function getContextHealth(args: {
  model: SourceModel;
  usage: Usage;
}): ContextHealth | undefined {
  const { model, usage } = args;

  const contextLimit = model?.limit?.context;
  if (!contextLimit || contextLimit <= 0) {
    return undefined;
  }

  // Calculate total tokens used (input + output + reasoning + cache reads + cache writes)
  // Cache tokens consume model context even though they're subsets of input tokens for pricing
  const normalized = normalizeUsage(usage);
  const usedTokens =
    normalized.input +
    normalized.output +
    (normalized.reasoningTokens ?? 0) +
    (normalized.cacheReads ?? 0) +
    (normalized.cacheWrites ?? 0);

  // Calculate remaining tokens
  const remainingTokens = Math.max(0, contextLimit - usedTokens);

  // Calculate percentages
  const usedPercentage = (usedTokens / contextLimit) * 100;
  const remainingPercentage = (remainingTokens / contextLimit) * 100;

  // Determine health status
  let status: "healthy" | "warning" | "critical";
  if (usedPercentage < 70) {
    status = "healthy";
  } else if (usedPercentage < 90) {
    status = "warning";
  } else {
    status = "critical";
  }

  return {
    totalTokens: contextLimit,
    usedTokens,
    remainingTokens,
    usedPercentage,
    remainingPercentage,
    status,
  };
}
