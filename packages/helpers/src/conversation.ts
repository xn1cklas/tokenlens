import type {
  ModelsDevApi,
  NormalizedUsage,
  TokenBreakdown,
  UsageLike,
} from "@tokenlens/core";
import {
  estimateCost,
  getContextWindow,
  normalizeUsage,
  remainingContext,
} from "./context.js";

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
      typeof u === "object" &&
      u !== null &&
      "input" in (u as Record<string, unknown>)
        ? (u as NormalizedUsage)
        : normalizeUsage(u as UsageLike);
    input += n.input || 0;
    output += n.output || 0;
    if (typeof n.total === "number") total = (total ?? 0) + n.total;
  }
  return { input, output, total: total ?? input + output };
}

export function estimateConversationCost(args: {
  modelId: string;
  usages: Array<
    UsageLike | NormalizedUsage | TokenBreakdown | undefined | null
  >;
  catalog?: ModelsDevApi;
}): { inputUSD?: number; outputUSD?: number; totalUSD?: number } {
  const u = sumUsage(args.usages);
  return estimateCost({
    modelId: args.modelId as string,
    usage: u,
    catalog: args.catalog,
  });
}

export type ContextRotResult = {
  totalTokens: number;
  recentTokens: number;
  staleTokens: number;
  staleShareOfUsed: number;
  staleShareOfMax?: number;
  trimFrom?: number;
};

export function computeContextRot(args: {
  messageTokens: number[];
  keepRecentTurns?: number;
  modelId?: string;
  targetStaleShareOfUsed?: number;
  catalog?: ModelsDevApi;
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
  let staleShareOfMax: number | undefined;
  if (args.modelId) {
    const cw = getContextWindow(args.modelId, { catalog: args.catalog });
    const cap = cw.combinedMax ?? cw.inputMax;
    if (typeof cap === "number" && cap > 0) staleShareOfMax = staleTokens / cap;
  }
  let trimFrom: number | undefined;
  const target = args.targetStaleShareOfUsed;
  if (typeof target === "number" && target >= 0 && target <= 1) {
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
      if (k < maxDrop) dropped += tokens[k] || 0;
    }
    if (trimFrom === undefined) trimFrom = maxDrop;
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

export function nextTurnBudget(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage | undefined;
  reserveOutput?: number;
  catalog?: ModelsDevApi;
}): number | undefined {
  const rc = remainingContext({
    modelId: args.modelId,
    usage: args.usage,
    reserveOutput: args.reserveOutput,
    catalog: args.catalog,
  });
  return rc.remainingCombined ?? rc.remainingInput;
}
