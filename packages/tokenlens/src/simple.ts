import { estimateCost, remainingContext } from './context.js';
import { resolveModel } from './registry.js';
import type { ModelId } from './registry.js';
import type { Model, NormalizedUsage, UsageLike } from './types.js';

/**
 * Convenience accessor for commonly-used model metadata and derived values.
 * Accepts canonical ids or aliases. Overloaded to return `undefined` for unknown ids.
 */
export function modelMeta(id: ModelId): {
  id: string;
  displayName?: string;
  provider: Model['provider'];
  status: Model['status'];
  maxTokens?: number;
  pricePerTokenIn?: number;
  pricePerTokenOut?: number;
  source: string;
};
export function modelMeta(id: string): {
  id: string;
  displayName?: string;
  provider: Model['provider'];
  status: Model['status'];
  maxTokens?: number;
  pricePerTokenIn?: number;
  pricePerTokenOut?: number;
  source: string;
} | undefined {
  const m = resolveModel(id);
  if (!m) return undefined;
  const cap = m.context.combinedMax ?? m.context.inputMax;
  return {
    id: m.id,
    displayName: m.displayName,
    provider: m.provider,
    status: m.status,
    maxTokens: cap,
    pricePerTokenIn: m.pricing?.inputPerMTokens !== undefined ? m.pricing.inputPerMTokens / 1_000_000 : undefined,
    pricePerTokenOut: m.pricing?.outputPerMTokens !== undefined ? m.pricing.outputPerMTokens / 1_000_000 : undefined,
    source: m.source,
  };
}

// Intentionally no throwing variant to keep API small.

/**
 * Return the proportion (0..1) of context consumed, optionally reserving output.
 */
export function percentOfContextUsed(args: {
  id: string;
  usage: UsageLike | NormalizedUsage;
  reserveOutput?: number;
}): number {
  const rc = remainingContext({ modelId: args.id, usage: args.usage, reserveOutput: args.reserveOutput });
  return rc.percentUsed;
}

/**
 * Return remaining token budget (combined or input-only depending on the model).
 */
export function tokensRemaining(args: { id: string; usage: UsageLike | NormalizedUsage; reserveOutput?: number }): number | undefined {
  const rc = remainingContext({ modelId: args.id, usage: args.usage, reserveOutput: args.reserveOutput });
  return rc.remainingCombined ?? rc.remainingInput;
}

/**
 * Return total estimated USD cost from usage if pricing hints are available.
 */
export function costFromUsage(args: { id: string; usage: UsageLike | NormalizedUsage }): number | undefined {
  const c = estimateCost({ modelId: args.id, usage: args.usage });
  return c.totalUSD;
}
