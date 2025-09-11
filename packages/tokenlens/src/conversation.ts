import type {
  ModelCatalog,
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
 * @deprecated Prefer getUsageData/getTokenCosts; conversation-level helpers will move to a separate surface.
 */
export function estimateConversationCost(args: {
  modelId: string;
  usages: Array<
    UsageLike | NormalizedUsage | TokenBreakdown | undefined | null
  >;
  catalog?: ModelCatalog;
}) {
  const catalog = args.catalog ?? defaultCatalog;
  return _estimateConversationCost({
    modelId: args.modelId,
    usages: args.usages,
    catalog,
  });
}

/**
 * @deprecated Prefer getContextData/getUsageData; next-turn budgeting may be replaced by a separate component.
 */
export function nextTurnBudget(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage | undefined;
  reserveOutput?: number;
  catalog?: ModelCatalog;
}): number | undefined {
  const catalog = args.catalog ?? defaultCatalog;
  return _nextTurnBudget({
    modelId: args.modelId,
    usage: args.usage,
    reserveOutput: args.reserveOutput,
    catalog,
  });
}
