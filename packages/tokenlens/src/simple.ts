import type {
  Model,
  ModelCatalog,
  NormalizedUsage,
  UsageLike,
} from "@tokenlens/core";
import {
  costFromUsage as _costFromUsage,
  modelMeta as _modelMeta,
  percentOfContextUsed as _percentOfContextUsed,
  tokensRemaining as _tokensRemaining,
} from "@tokenlens/helpers/simple";
import { defaultCatalog } from "./source.js";

/**
 * @deprecated Prefer getContextData/getTokenCosts/getUsageData with a catalog
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
  const catalog = opts?.catalog ?? defaultCatalog;
  return _modelMeta(id, { catalog });
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
  const catalog = args.catalog ?? defaultCatalog;
  return _percentOfContextUsed({
    id: args.id,
    usage: args.usage,
    reserveOutput: args.reserveOutput,
    catalog,
  });
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
  const catalog = args.catalog ?? defaultCatalog;
  return _tokensRemaining({
    id: args.id,
    usage: args.usage,
    reserveOutput: args.reserveOutput,
    catalog,
  });
}

/**
 * @deprecated Prefer getTokenCosts/getUsageData
 */
export function costFromUsage(args: {
  id: string;
  usage: UsageLike | NormalizedUsage;
  catalog?: ModelCatalog;
}): number | undefined {
  const catalog = args.catalog ?? defaultCatalog;
  return _costFromUsage({ id: args.id, usage: args.usage, catalog });
}
