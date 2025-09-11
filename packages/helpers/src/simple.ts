import type {
  Model,
  ModelCatalog,
  NormalizedUsage,
  UsageLike,
} from "@tokenlens/core";
import { estimateCost, remainingContext } from "./context.js";

/**
 * @deprecated Prefer getContextData/getTokenCosts/getUsageData
 */
export function modelMeta(
  id: string,
  opts?: { catalog?: ModelCatalog },
): {
  id: string;
  displayName?: string;
  provider: Model["provider"];
  status: Model["status"];
  maxTokens?: number;
  pricePerTokenIn?: number;
  pricePerTokenOut?: number;
  source: string;
};
/**
 * @deprecated Prefer getContextData/getTokenCosts/getUsageData
 */
export function modelMeta(
  id: string,
  opts?: { catalog?: ModelCatalog },
):
  | {
      id: string;
      displayName?: string;
      provider: Model["provider"];
      status: Model["status"];
      maxTokens?: number;
      pricePerTokenIn?: number;
      pricePerTokenOut?: number;
      source: string;
    }
  | undefined {
  // Resolve via catalog-only helper path for consistency
  const rc = remainingContext({
    modelId: id,
    usage: { input_tokens: 0 },
    catalog: opts?.catalog,
  });
  const m = rc.model;
  if (!m) return undefined;
  const cap = m.context.combinedMax ?? m.context.inputMax;
  return {
    id: m.id,
    displayName: m.displayName,
    provider: m.provider,
    status: m.status,
    maxTokens: cap,
    pricePerTokenIn:
      m.pricing?.inputPerMTokens !== undefined
        ? m.pricing.inputPerMTokens / 1_000_000
        : undefined,
    pricePerTokenOut:
      m.pricing?.outputPerMTokens !== undefined
        ? m.pricing.outputPerMTokens / 1_000_000
        : undefined,
    source: m.source,
  };
}

/**
 * @deprecated Prefer getContextData/getUsageData
 */
export function percentOfContextUsed(args: {
  id: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  catalog?: ModelCatalog;
}): number {
  const rc = remainingContext({
    modelId: args.id,
    usage: args.usage,
    reserveOutput: args.reserveOutput,
    catalog: args.catalog,
  });
  return rc.percentUsed;
}

/**
 * @deprecated Prefer getContextData/getUsageData
 */
export function tokensRemaining(args: {
  id: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  catalog?: ModelCatalog;
}): number | undefined {
  const rc = remainingContext({
    modelId: args.id,
    usage: args.usage,
    reserveOutput: args.reserveOutput,
    catalog: args.catalog,
  });
  return rc.remainingCombined ?? rc.remainingInput;
}

/**
 * @deprecated Prefer getTokenCosts/getUsageData
 */
export function costFromUsage(args: {
  id: string;
  usage: UsageLike | NormalizedUsage;
  catalog?: ModelCatalog;
}): number | undefined {
  const c = estimateCost({
    modelId: args.id,
    usage: args.usage,
    catalog: args.catalog,
  });
  return c.totalUSD;
}
