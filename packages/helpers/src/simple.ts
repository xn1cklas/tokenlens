import type {
  Model,
  ModelsDevApi,
  NormalizedUsage,
  UsageLike,
} from "@tokenlens/core";
import { estimateCost, remainingContext } from "./context.js";

export function modelMeta(
  id: string,
  opts?: { catalog?: ModelsDevApi },
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
export function modelMeta(
  id: string,
  opts?: { catalog?: ModelsDevApi },
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

export function percentOfContextUsed(args: {
  id: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  catalog?: ModelsDevApi;
}): number {
  const rc = remainingContext({
    modelId: args.id,
    usage: args.usage,
    reserveOutput: args.reserveOutput,
    catalog: args.catalog,
  });
  return rc.percentUsed;
}

export function tokensRemaining(args: {
  id: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
  catalog?: ModelsDevApi;
}): number | undefined {
  const rc = remainingContext({
    modelId: args.id,
    usage: args.usage,
    reserveOutput: args.reserveOutput,
    catalog: args.catalog,
  });
  return rc.remainingCombined ?? rc.remainingInput;
}

export function costFromUsage(args: {
  id: string;
  usage: UsageLike | NormalizedUsage;
  catalog?: ModelsDevApi;
}): number | undefined {
  const c = estimateCost({
    modelId: args.id,
    usage: args.usage,
    catalog: args.catalog,
  });
  return c.totalUSD;
}
