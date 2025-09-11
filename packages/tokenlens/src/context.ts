/**
 * Context and cost helpers (back-compat wrappers).
 *
 * For new code, pass a catalog explicitly:
 * - Fetch a live catalog via `fetchModels()` from `@tokenlens/fetch` and pass `{ catalog }`.
 * - Or build a static catalog via `getModels()` from `@tokenlens/models` and pass `{ catalog }`.
 *
 * These wrappers fall back to a bundled default catalog for backwards compatibility.
 */
import type {
  ModelCatalog,
  NormalizedUsage,
  TokenBreakdown,
  UsageLike,
} from "@tokenlens/core";
import {
  breakdownTokens as _breakdownTokens,
  consumedTokens as _consumedTokens,
  contextHealth as _contextHealth,
  estimateCost as _estimateCost,
  fitsContext as _fitsContext,
  getContextWindow as _getContextWindow,
  normalizeUsage as _normalizeUsage,
  percentRemaining as _percentRemaining,
  pickModelFor as _pickModelFor,
  remainingContext as _remainingContext,
  shouldCompact as _shouldCompact,
  tokensToCompact as _tokensToCompact,
} from "@tokenlens/helpers/context";
import { defaultCatalog } from "./source.js";

/**
 * @deprecated Pass `{ catalog }` from `@tokenlens/fetch` (`fetchModels()`) or from `@tokenlens/models` (`getModels()`).
 */
export function getContextWindow(
  modelId: string,
  opts?: { catalog?: ModelCatalog },
) {
  const catalog = opts?.catalog ?? defaultCatalog;
  return _getContextWindow(modelId, { catalog });
}

/**
 * @deprecated Pass `{ catalog }` from `@tokenlens/fetch` (`fetchModels()`) or from `@tokenlens/models` (`getModels()`).
 */
export function remainingContext(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage | undefined;
  reserveOutput?: number;
  strategy?: "combined" | "provider-default" | "input-only";
  catalog?: ModelCatalog;
}) {
  const catalog = args.catalog ?? defaultCatalog;
  return _remainingContext({
    modelId: args.modelId,
    usage: args.usage,
    reserveOutput: args.reserveOutput,
    strategy: args.strategy,
    catalog,
  });
}

/**
 * @deprecated Pass `{ catalog }` from `@tokenlens/fetch` (`fetchModels()`) or from `@tokenlens/models` (`getModels()`).
 */
export function estimateCost(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage | TokenBreakdown;
  catalog?: ModelCatalog;
}) {
  const catalog = args.catalog ?? defaultCatalog;
  return _estimateCost({ modelId: args.modelId, usage: args.usage, catalog });
}

/**
 * @deprecated Pass `{ catalog }` from `@tokenlens/fetch` (`fetchModels()`) or from `@tokenlens/models` (`getModels()`).
 */
export function fitsContext(args: {
  modelId: string;
  tokens: number;
  reserveOutput?: number;
  catalog?: ModelCatalog;
}): boolean {
  const catalog = args.catalog ?? defaultCatalog;
  return _fitsContext({
    modelId: args.modelId,
    tokens: args.tokens,
    reserveOutput: args.reserveOutput,
    catalog,
  });
}

/**
 * @deprecated Pass `{ catalog }` from `@tokenlens/fetch` (`fetchModels()`) or from `@tokenlens/models` (`getModels()`).
 */
export function percentRemaining(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  catalog?: ModelCatalog;
}): number {
  const catalog = args.catalog ?? defaultCatalog;
  return _percentRemaining({
    modelId: args.modelId,
    usage: args.usage,
    reserveOutput: args.reserveOutput,
    catalog,
  });
}

/**
 * @deprecated Pass `{ catalog }` from `@tokenlens/fetch` (`fetchModels()`) or from `@tokenlens/models` (`getModels()`).
 */
export function shouldCompact(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  threshold?: number;
  catalog?: ModelCatalog;
}) {
  const catalog = args.catalog ?? defaultCatalog;
  return _shouldCompact({
    modelId: args.modelId,
    usage: args.usage,
    reserveOutput: args.reserveOutput,
    threshold: args.threshold,
    catalog,
  });
}

/**
 * @deprecated Pass `{ catalog }` from `@tokenlens/fetch` (`fetchModels()`) or from `@tokenlens/models` (`getModels()`).
 */
export function tokensToCompact(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  targetPercent?: number;
  catalog?: ModelCatalog;
}) {
  const catalog = args.catalog ?? defaultCatalog;
  return _tokensToCompact({
    modelId: args.modelId,
    usage: args.usage,
    reserveOutput: args.reserveOutput,
    targetPercent: args.targetPercent,
    catalog,
  });
}

/**
 * @deprecated Pass `{ catalog }` from `@tokenlens/fetch` (`fetchModels()`) or from `@tokenlens/models` (`getModels()`).
 */
export function contextHealth(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  catalog?: ModelCatalog;
}) {
  const catalog = args.catalog ?? defaultCatalog;
  return _contextHealth({
    modelId: args.modelId,
    usage: args.usage,
    reserveOutput: args.reserveOutput,
    catalog,
  });
}

// Pure helpers (no DI) – re-export directly
export const normalizeUsage = _normalizeUsage;
export const breakdownTokens = _breakdownTokens;
export const consumedTokens = _consumedTokens;
export const pickModelFor = _pickModelFor;
