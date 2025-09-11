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
import {
  summarizeUsage as _summarizeUsage,
  toModelId as _toModelId,
  getTokenCosts as _getTokenCosts,
  getContext as _getContext,
  getUsage as _getUsage,
} from "@tokenlens/helpers/context";
export type {
  UsageSummary,
  ContextData,
  TokenCosts,
  UsageData,
} from "@tokenlens/helpers/context";

/**
 * @deprecated Prefer getContext/getUsage/getTokenCosts with `{ providers }`. For raw caps use helpers directly.
 */
export function getContextWindow(
  modelId: string,
  opts?: { catalog?: ModelCatalog },
) {
  const catalog = opts?.catalog ?? defaultCatalog;
  return _getContextWindow(modelId, { catalog });
}

/**
 * @deprecated Prefer getContext/getUsage with `{ providers }`.
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
 * @deprecated Prefer getTokenCosts/getUsage with `{ providers }`.
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
 * @deprecated Prefer getContext/getUsage with `{ providers }`.
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

// Pure helpers (no DI) – re-export directly (deprecated)
/** @deprecated Prefer getUsage/getTokenCosts */
export const normalizeUsage = _normalizeUsage;
/** @deprecated Prefer getUsage/getTokenCosts */
export const breakdownTokens = _breakdownTokens;
/** @deprecated Prefer getUsage/getTokenCosts */
export const consumedTokens = _consumedTokens;
/** @deprecated Prefer getContext + filtering externally */
export const pickModelFor = _pickModelFor;

// Back-compat wrapper that injects defaultCatalog when not provided
/** @deprecated Prefer getUsage/getTokenCosts/getContext */
export function summarizeUsage(args: {
  modelId?: string;
  usage: UsageLike | undefined;
  catalog?: ModelCatalog;
  reserveOutput?: number;
}) {
  return _summarizeUsage({
    modelId: args.modelId,
    usage: args.usage,
    catalog: args.catalog ?? defaultCatalog,
    reserveOutput: args.reserveOutput,
  });
}

/** @deprecated Internal normalization is automatic; avoid direct use. */
export function toModelId(gatewayId?: string) {
  return _toModelId(gatewayId);
}

// Focused surface wrappers with default catalog fallback
export function getTokenCosts(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage | TokenBreakdown | undefined;
  providers?: ModelCatalog;
}) {
  return _getTokenCosts({
    modelId: args.modelId,
    usage: args.usage,
    providers: args.providers ?? defaultCatalog,
  });
}

export function getContext(args: {
  modelId: string;
  providers?: ModelCatalog;
}) {
  return _getContext({
    modelId: args.modelId,
    providers: args.providers ?? defaultCatalog,
  });
}

export function getUsage(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage | TokenBreakdown | undefined;
  providers?: ModelCatalog;
  reserveOutput?: number;
}) {
  return _getUsage({
    modelId: args.modelId,
    usage: args.usage,
    providers: args.providers ?? defaultCatalog,
    reserveOutput: args.reserveOutput,
  });
}
