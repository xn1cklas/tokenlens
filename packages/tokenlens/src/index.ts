import type { Usage } from "@tokenlens/core";
import { Tokenlens, type ModelDetails } from "./client.js";
import type { GatewayId, TokenlensOptions } from "./types.js";
import type { Provider } from "@tokenlens/tokenizer";

/**
 * Create a new Tokenlens instance with the given options.
 * @param options - The options for the Tokenlens instance.
 * @returns A new Tokenlens instance.
 */

export function createTokenlens(
  options?: ConstructorParameters<typeof Tokenlens>[0],
) {
  return new Tokenlens(options);
}


interface CountTokensArgs {
  /** The model ID (e.g., "openai/gpt-4o-mini") */
  modelId: string;
  /** Text content to count tokens for */
  data: string;
}

/**
   * Count tokens in a text string for a given model.
   *
   * @param args - Configuration for token counting
   * @returns Token count
   *
   * @example
   * ```typescript
   * const tokenlens = new Tokenlens();
   * const tokens = await tokenlens.countTokens({
   *   modelId: "gpt-4o",
   *   data: "Write a story about a robot",
   * });
   *
   * console.log(`Input tokens: ${tokens}`);
   * ```
   */

export async function countTokens(args: CountTokensArgs) {
  const tokenlens = getTokenlens();
  return tokenlens.countTokens(args);
}

interface EstimateCostUSDArgs {
  /** The model ID (e.g., "openai/gpt-4o-mini" or just "gpt-4o-mini") */
  modelId: string;
  /** Provider for model lookup (e.g., "openai", "anthropic") */
  provider?: string;
  /** Text content to estimate costs for */
  data: string;
}

/**
 * Estimate token costs in USD by counting tokens in text and looking up pricing.
 * This is useful for estimating costs BEFORE making an API call.
 *
 * @example
 * ```typescript
 * const estimate = await estimateCostUSD({
 *   modelId: "openai/gpt-4o",
 *   provider: "openai",
 *   data: "Write a story about a robot",
 * });
 * ```
 */
export async function estimateCostUSD(args: EstimateCostUSDArgs) {
  const tokenlens = getTokenlens();
  return tokenlens.estimateCostUSD(args);
}

interface ComputeCostUSDArgs {
  /** The model ID (e.g., "openai/gpt-4o-mini") */
  modelId: string;
  /** Token usage data */
  usage: Usage;
  /** Gateway to use (defaults to "auto") */
  gateway?: GatewayId;
  /** Optional provider to disambiguate model lookup */
  provider?: string;
}

/**
 * Calculate a model's token usage cost in USD.
 */
export async function computeCostUSD(args: ComputeCostUSDArgs) {
  const tokenlens = getTokenlens(args.gateway);
  return tokenlens.computeCostUSD(args);
}

interface GetContextLimitsArgs {
  /** The model ID (e.g., "openai/gpt-4o-mini") */
  modelId: string;
  /** Optional provider to disambiguate model lookup */
  provider?: string;
  /** Gateway to use (defaults to "auto") */
  gateway?: GatewayId;
}

/**
 * Read the context, input, and output token limits for a model.
 */
export async function getContextLimits(args: GetContextLimitsArgs) {
  const tokenlens = getTokenlens(args.gateway);
  return tokenlens.getContextLimits(args);
}

interface GetModelDataArgs {
  /** The model ID (e.g., "openai/gpt-4o-mini") */
  modelId: string;
  /** Optional provider to disambiguate model lookup */
  provider?: string;
  /** Gateway to use (defaults to "auto") */
  gateway?: GatewayId;
}
/**
 * Describe a model's metadata exactly as stored in the active sources.
 */
export async function getModelData(args: GetModelDataArgs) {
  const tokenlens = getTokenlens(args.gateway);
  return tokenlens.getModelData(args);
}

const instances = new Map<GatewayId, Tokenlens>();

/**
 * @internal
 * Lazily creates or returns the shared Tokenlens instance for a given gateway.
 */
function getTokenlens(gateway?: GatewayId): Tokenlens {
  const key = gateway ?? "auto";
  let instance = instances.get(key);
  if (!instance) {
    instance = new Tokenlens({ catalog: key });
    instances.set(key, instance);
  }
  return instance;
}

/**
 * @internal Utility for tests to override the shared Tokenlens instance.
 */
export function setSharedTokenlens(tokenlens?: Tokenlens) {
  instances.clear();
  if (tokenlens) {
    instances.set("auto", tokenlens);
  }
}

export type { SourceProviders, SourceModel, Usage } from "@tokenlens/core";
export type { ModelDetails, TokenlensOptions };
export type { TokenCosts } from "@tokenlens/helpers";
export { Tokenlens } from "./client.js";
