import type {
  ModelsDevApi,
  NormalizedUsage,
  TokenBreakdown,
  UsageLike,
} from "@tokenlens/core";
import {
  estimateConversationCost as _estimateConversationCost,
  nextTurnBudget as _nextTurnBudget,
  computeContextRot,
  sumUsage,
} from "@tokenlens/helpers/conversation";
import { defaultCatalog } from "./source.js";

export { computeContextRot, sumUsage };

/**
 * @deprecated Prefer passing { source } or { catalog } explicitly.
 */
export function estimateConversationCost(args: {
  modelId: string;
  usages: Array<
    UsageLike | NormalizedUsage | TokenBreakdown | undefined | null
  >;
  catalog?: ModelsDevApi;
}) {
  const catalog = args.catalog ?? defaultCatalog;
  return _estimateConversationCost({
    modelId: args.modelId,
    usages: args.usages,
    catalog,
  });
}

/**
 * @deprecated Prefer passing { source } or { catalog } explicitly.
 */
export function nextTurnBudget(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage | undefined;
  reserveOutput?: number;
  catalog?: ModelsDevApi;
}): number | undefined {
  const catalog = args.catalog ?? defaultCatalog;
  return _nextTurnBudget({
    modelId: args.modelId,
    usage: args.usage,
    reserveOutput: args.reserveOutput,
    catalog,
  });
}
