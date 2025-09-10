import { estimateCost, remainingContext, normalizeUsage } from "./context.js";
import { resolveModel } from "./registry.js";
import type { ModelId } from "./registry.js";
import type { NormalizedUsage, TokenBreakdown, UsageLike } from "./types.js";

/**
 * Sum an array of usage objects into a single normalized usage.
 * Accepts mixed shapes (provider usage, normalized usage, token breakdown).
 */
export function sumUsage(
  usages: Array<
    UsageLike | NormalizedUsage | TokenBreakdown | undefined | null
  >,
): NormalizedUsage {
  let input = 0;
  let output = 0;
  let total: number | undefined = 0;
  for (const u of usages) {
    if (!u) continue;
    const n =
      "input" in (u as any)
        ? (u as NormalizedUsage)
        : normalizeUsage(u as UsageLike);
    input += n.input || 0;
    output += n.output || 0;
    if (typeof n.total === "number") total = (total ?? 0) + n.total;
  }
  return { input, output, total: total ?? input + output };
}

/**
 * Estimate total conversation cost from a list of per-turn usage objects.
 */
export function estimateConversationCost(args: {
  modelId: ModelId | string;
  usages: Array<
    UsageLike | NormalizedUsage | TokenBreakdown | undefined | null
  >;
}): { inputUSD?: number; outputUSD?: number; totalUSD?: number } {
  const u = sumUsage(args.usages);
  return estimateCost({ modelId: args.modelId as string, usage: u });
}

export type ContextRotResult = {
  totalTokens: number;
  recentTokens: number;
  staleTokens: number;
  // Share of used context occupied by stale tokens (0..1)
  staleShareOfUsed: number;
  // Share of max context occupied by stale tokens (0..1), if known
  staleShareOfMax?: number;
  // Index from which to keep messages (drop [0..trimFrom-1]) to reduce stale share <= target
  trimFrom?: number;
};

/**
 * Compute a simple "context rot" metric: how much of the current prompt
 * is occupied by older messages vs. the most recent N turns.
 *
 * Note: This function is tokenizer-agnostic. Callers must provide per-message
 * token counts for the current prompt window.
 */
export function computeContextRot(args: {
  messageTokens: number[]; // token counts for messages in the current prompt, in order
  keepRecentTurns?: number; // count of most-recent messages to consider non-stale (default 3)
  modelId?: ModelId | string; // optional, to compute share vs max context if known
  targetStaleShareOfUsed?: number; // optional threshold (0..1) to compute a trimFrom index
}): ContextRotResult {
  const keepRecentTurns = Math.max(0, args.keepRecentTurns ?? 3);
  const tokens = (args.messageTokens ?? []).map((n) =>
    Math.max(0, Math.floor(n)),
  );
  const totalTokens = tokens.reduce((a, b) => a + b, 0);
  const recentTokens = tokens
    .slice(-keepRecentTurns)
    .reduce((a, b) => a + b, 0);
  const staleTokens = Math.max(0, totalTokens - recentTokens);
  const staleShareOfUsed = totalTokens > 0 ? staleTokens / totalTokens : 0;

  // Optional: compute share vs max context if model is known
  let staleShareOfMax: number | undefined;
  if (args.modelId) {
    const m = resolveModel(args.modelId as string);
    const cap = m?.context.combinedMax ?? m?.context.inputMax;
    if (typeof cap === "number" && cap > 0) staleShareOfMax = staleTokens / cap;
  }

  let trimFrom: number | undefined;
  const target = args.targetStaleShareOfUsed;
  if (typeof target === "number" && target >= 0 && target <= 1) {
    // Drop the minimal oldest prefix so that stale/(used after drop) <= target
    const maxDrop = Math.max(0, tokens.length - keepRecentTurns);
    let dropped = 0;
    for (let k = 0; k <= maxDrop; k++) {
      const usedAfterDrop = totalTokens - dropped;
      const staleAfterDrop = Math.max(0, staleTokens - dropped);
      const share = usedAfterDrop > 0 ? staleAfterDrop / usedAfterDrop : 0;
      if (share <= target) {
        trimFrom = k;
        break;
      }
      // prepare to drop next item (oldest to newest)
      if (k < maxDrop) dropped += tokens[k] || 0;
    }
    if (trimFrom === undefined) trimFrom = maxDrop; // worst-case drop all stale
  }

  return {
    totalTokens,
    recentTokens,
    staleTokens,
    staleShareOfUsed,
    staleShareOfMax,
    trimFrom,
  };
}

/**
 * Compute how many input tokens can still be sent on the next turn,
 * after reserving output space, given usage so far.
 */
export function nextTurnBudget(args: {
  modelId: ModelId | string;
  usage: UsageLike | NormalizedUsage | undefined;
  reserveOutput?: number;
}): number | undefined {
  const rc = remainingContext({
    modelId: args.modelId,
    usage: args.usage,
    reserveOutput: args.reserveOutput,
  });
  // Prefer combined remaining (typical), fall back to input-only when applicable
  return rc.remainingCombined ?? rc.remainingInput;
}
