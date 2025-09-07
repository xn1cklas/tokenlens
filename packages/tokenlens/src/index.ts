/**
 * Public API surface: types, registry helpers, context & cost utilities, and sugar helpers.
 */
export type {
  Model,
  Provider,
  Status,
  UsageLike,
  NormalizedUsage,
} from "./types.js";
export {
  models,
  aliases,
  getModelRaw,
  resolveModel,
  listModels,
  MODEL_IDS,
  isModelId,
  assertModelId,
} from "./registry.js";
export type { ModelId } from "./registry.js";
export {
  getContextWindow,
  normalizeUsage,
  breakdownTokens,
  remainingContext,
  fitsContext,
  pickModelFor,
  estimateCost,
  consumedTokens,
  percentRemaining,
  shouldCompact,
  contextHealth,
  tokensToCompact,
} from "./context.js";
export {
  modelMeta,
  percentOfContextUsed,
  tokensRemaining,
  costFromUsage,
} from "./simple.js";
export {
  sumUsage,
  estimateConversationCost,
  computeContextRot,
  nextTurnBudget,
} from "./conversation.js";
