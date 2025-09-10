/**
 * Context + cost helpers (back-compat wrappers).
 *
 * Prefer DI from @tokenlens/models via sourceFromModels([...]) or
 * live catalogs via @tokenlens/fetch. These wrappers default to the
 * static defaultSource for backwards compatibility.
 */
import type {
  ModelsDevApi,
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
 * @deprecated Prefer passing { source } or { catalog } explicitly.
 */
export function getContextWindow(
  modelId: string,
  opts?: { catalog?: ModelsDevApi },
) {
  const catalog = opts?.catalog ?? defaultCatalog;
  return _getContextWindow(modelId, { catalog });
}

/**
 * @deprecated Prefer passing { source } or { catalog } explicitly.
 */
export function remainingContext(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage | undefined;
  reserveOutput?: number;
  strategy?: "combined" | "provider-default" | "input-only";
  catalog?: ModelsDevApi;
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
 * @deprecated Prefer passing { source } or { catalog } explicitly.
 */
export function estimateCost(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage | TokenBreakdown;
  catalog?: ModelsDevApi;
}) {
  const catalog = args.catalog ?? defaultCatalog;
  return _estimateCost({ modelId: args.modelId, usage: args.usage, catalog });
}

/**
 * @deprecated Prefer passing { source } or { catalog } explicitly.
 */
export function fitsContext(args: {
  modelId: string;
  tokens: number;
  reserveOutput?: number;
  catalog?: ModelsDevApi;
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
 * @deprecated Prefer passing { source } or { catalog } explicitly.
 */
export function percentRemaining(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  catalog?: ModelsDevApi;
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
 * @deprecated Prefer passing { source } or { catalog } explicitly.
 */
export function shouldCompact(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  threshold?: number;
  catalog?: ModelsDevApi;
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
 * @deprecated Prefer passing { source } or { catalog } explicitly.
 */
export function tokensToCompact(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  targetPercent?: number;
  catalog?: ModelsDevApi;
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
 * @deprecated Prefer passing { source } or { catalog } explicitly.
 */
export function contextHealth(args: {
  modelId: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  catalog?: ModelsDevApi;
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
