import type { Usage } from "@tokenlens/core";
import { Tokenlens, type ModelDetails } from "./client.js";
import type { GatewayId, TokenlensOptions } from "./types.js";

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
 * @param args - Configuration for cost estimation
 * @returns Token costs breakdown including total cost in USD and token counts
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
  /** The model ID (e.g., "openai/gpt-4o-mini" or "gpt-4o-mini") */
  modelId: string;
  /** Token usage data */
  usage: Usage;
  /** Gateway to use for fetching catalog (defaults to "auto") */
  gateway?: GatewayId;
  /** Optional provider to disambiguate model lookup (e.g., "openai", "anthropic") */
  provider?: string;
}

/**
 * Calculate a model's token usage cost in USD.
 *
 * @param args - Configuration for cost computation
 * @returns Token costs breakdown including input, output, and total costs in USD
 *
 * @example
 * ```typescript
 * const costs = await computeCostUSD({
 *   modelId: "openai/gpt-4o-mini",
 *   usage: { input_tokens: 1000, output_tokens: 500 }
 * });
 * console.log(`Total: $${costs.totalTokenCostUSD}`);
 * ```
 */
export async function computeCostUSD(args: ComputeCostUSDArgs) {
  const tokenlens = getTokenlens(args.gateway);
  return tokenlens.computeCostUSD(args);
}

interface GetContextLimitsArgs {
  /** The model ID (e.g., "openai/gpt-4o-mini" or "gpt-4o-mini") */
  modelId: string;
  /** Optional provider to disambiguate model lookup (e.g., "openai", "anthropic") */
  provider?: string;
  /** Gateway to use for fetching catalog (defaults to "auto") */
  gateway?: GatewayId;
}

/**
 * Read the context, input, and output token limits for a model.
 *
 * @param args - Configuration for context limits lookup
 * @returns Object containing context, input, and output token limits
 *
 * @example
 * ```typescript
 * const limits = await getContextLimits({ modelId: "openai/gpt-4o-mini" });
 * console.log(`Context: ${limits?.context} tokens`);
 * ```
 */
export async function getContextLimits(args: GetContextLimitsArgs) {
  const tokenlens = getTokenlens(args.gateway);
  return tokenlens.getContextLimits(args);
}

interface GetModelDataArgs {
  /** The model ID (e.g., "openai/gpt-4o-mini" or "gpt-4o-mini") */
  modelId: string;
  /** Optional provider to disambiguate model lookup (e.g., "openai", "anthropic") */
  provider?: string;
  /** Gateway to use for fetching catalog (defaults to "auto") */
  gateway?: GatewayId;
}
/**
 * Get a model's metadata exactly as stored in the active sources.
 *
 * Model ID formats supported:
 * - "openai/gpt-4o-mini" - Full provider/model format
 * - "gpt-4o-mini" with provider: "openai" - Separate model and provider
 * - "gpt-4o-mini" - Search across all providers (may be ambiguous)
 *
 * @param args - Configuration for model data lookup
 * @returns Model metadata including pricing, limits, and other details
 *
 * @example
 * ```typescript
 * // Using provider prefix
 * const details = await getModelData({ modelId: "openai/gpt-4o-mini" });
 *
 * // Using separate provider parameter (useful with AI SDK variables)
 * const model = "gpt-4o-mini";
 * const provider = "openai";
 * const details = await getModelData({ modelId: model, provider });
 * ```
 */
export async function getModelData(args: GetModelDataArgs) {
  const tokenlens = getTokenlens(args.gateway);
  return tokenlens.getModelData(args);
}

interface GetContextHealthArgs {
  /** The model ID (e.g., "openai/gpt-4o-mini" or "gpt-4o-mini") */
  modelId: string;
  /** Token usage data */
  usage: Usage;
  /** Optional provider to disambiguate model lookup (e.g., "openai", "anthropic") */
  provider?: string;
  /** Gateway to use for fetching catalog (defaults to "auto") */
  gateway?: GatewayId;
}

/**
 * Calculate context window health metrics for a model and usage.
 *
 * Returns detailed information about context usage including:
 * - Total, used, and remaining tokens
 * - Usage percentages
 * - Health status (healthy: <70%, warning: 70-90%, critical: >90%)
 *
 * @param args - Configuration for context health calculation
 * @returns Context health metrics including usage percentages and health status
 *
 * @example
 * ```typescript
 * const health = await getContextHealth({
 *   modelId: "openai/gpt-4o-mini",
 *   usage: { input_tokens: 50000, output_tokens: 10000 }
 * });
 *
 * if (health) {
 *   console.log(`Used: ${health.usedPercentage.toFixed(1)}%`);
 *   console.log(`Status: ${health.status}`);
 * }
 * ```
 */
export async function getContextHealth(args: GetContextHealthArgs) {
  const tokenlens = getTokenlens(args.gateway);
  return tokenlens.getContextHealth(args);
}

const instances = new Map<GatewayId, Tokenlens>();

/**
 * @internal
 * Lazily creates or returns the shared Tokenlens instance for a given catalog.
 */
function getTokenlens(catalog?: GatewayId): Tokenlens {
  const key = catalog ?? "auto";
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
export type { TokenCosts, ContextHealth } from "@tokenlens/helpers";
export { Tokenlens } from "./client.js";

// Re-export helper utilities
export {
  compactJson,
  estimateTokenSavings,
} from "@tokenlens/helpers";
