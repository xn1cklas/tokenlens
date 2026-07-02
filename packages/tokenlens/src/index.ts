import { type ModelDetails, Tokenlens } from "./client.js";
import { getTokenlens } from "./shared.js";
import type { TokenlensOptions } from "./types.js";

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

type HelperClient = {
  tokenlens?: Tokenlens;
};
type HelperArgs<T> = T & TokenlensOptions & HelperClient;
type CountTokensArgs = Parameters<Tokenlens["countTokens"]>[0];
type EstimateCostUSDArgs = HelperArgs<
  Parameters<Tokenlens["estimateCostUSD"]>[0]
>;
type ComputeCostUSDArgs = HelperArgs<
  Parameters<Tokenlens["computeCostUSD"]>[0]
>;
type GetContextLimitsArgs = HelperArgs<
  Parameters<Tokenlens["getContextLimits"]>[0]
>;
type GetModelDataArgs = HelperArgs<Parameters<Tokenlens["getModelData"]>[0]>;
type GetContextHealthArgs = HelperArgs<
  Parameters<Tokenlens["getContextHealth"]>[0]
>;
type ListModelsArgs = HelperArgs<
  NonNullable<Parameters<Tokenlens["listModels"]>[0]>
>;
type ListProvidersArgs = TokenlensOptions & HelperClient;
type TryGetModelDataArgs = HelperArgs<
  Parameters<Tokenlens["tryGetModelData"]>[0]
>;

function optionsFromArgs(args: TokenlensOptions): TokenlensOptions | undefined {
  const options: TokenlensOptions = {};
  if (args.catalog !== undefined) options.catalog = args.catalog;
  if (args.overrides !== undefined) options.overrides = args.overrides;
  if (args.ttlMs !== undefined) options.ttlMs = args.ttlMs;
  if (args.fetch !== undefined) options.fetch = args.fetch;
  if (args.signal !== undefined) options.signal = args.signal;
  if (args.timeoutMs !== undefined) options.timeoutMs = args.timeoutMs;
  if (args.cache !== undefined) options.cache = args.cache;
  if (args.cacheKey !== undefined) options.cacheKey = args.cacheKey;
  if (args.staleIfError !== undefined) {
    options.staleIfError = args.staleIfError;
  }
  if (args.sourceOptions !== undefined)
    options.sourceOptions = args.sourceOptions;
  if (args.tokenizer !== undefined) options.tokenizer = args.tokenizer;
  return Object.keys(options).length ? options : undefined;
}

function clientFromArgs(args: TokenlensOptions & HelperClient): Tokenlens {
  return args.tokenlens ?? getTokenlens(optionsFromArgs(args));
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

export async function countTokens(args: HelperArgs<CountTokensArgs>) {
  const tokenlens = clientFromArgs(args);
  return tokenlens.countTokens({
    data: args.data,
    modelId: args.modelId,
  });
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
  const tokenlens = clientFromArgs(args);
  return tokenlens.estimateCostUSD({
    data: args.data,
    modelId: args.modelId,
    ...(args.provider !== undefined ? { provider: args.provider } : {}),
  });
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
  const tokenlens = clientFromArgs(args);
  return tokenlens.computeCostUSD({
    modelId: args.modelId,
    ...(args.provider !== undefined ? { provider: args.provider } : {}),
    usage: args.usage,
  });
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
  const tokenlens = clientFromArgs(args);
  return tokenlens.getContextLimits({
    modelId: args.modelId,
    ...(args.provider !== undefined ? { provider: args.provider } : {}),
  });
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
  const tokenlens = clientFromArgs(args);
  return tokenlens.getModelData({
    modelId: args.modelId,
    ...(args.provider !== undefined ? { provider: args.provider } : {}),
  });
}

export async function tryGetModelData(args: TryGetModelDataArgs) {
  const tokenlens = clientFromArgs(args);
  return tokenlens.tryGetModelData({
    modelId: args.modelId,
    ...(args.provider !== undefined ? { provider: args.provider } : {}),
  });
}

export async function listModels(args: ListModelsArgs = {}) {
  const tokenlens = clientFromArgs(args);
  return tokenlens.listModels({
    ...(args.provider !== undefined ? { provider: args.provider } : {}),
    ...(args.search !== undefined ? { search: args.search } : {}),
  });
}

export async function listProviders(args: ListProvidersArgs = {}) {
  const tokenlens = clientFromArgs(args);
  return tokenlens.listProviders();
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
  const tokenlens = clientFromArgs(args);
  return tokenlens.getContextHealth({
    modelId: args.modelId,
    ...(args.provider !== undefined ? { provider: args.provider } : {}),
    usage: args.usage,
  });
}

export type {
  SourceId,
  SourceModel,
  SourceProvider,
  SourceProviders,
  Usage,
} from "@tokenlens/core";
export type { ModelDetails, TokenlensOptions };
export type { CatalogSource } from "@tokenlens/fetch";
export type { ContextHealth, TokenCosts } from "@tokenlens/helpers";
// Re-export helper utilities
export {
  compactJson,
  estimateTokenSavings,
} from "@tokenlens/helpers";
export { Tokenlens } from "./client.js";
export type {
  Catalog,
  CatalogId,
  CatalogModelOverride,
  CatalogOverrides,
  CatalogProviderOverride,
  TokenCounter,
  TokenlensSourceOptions,
  VercelSourceOptions,
} from "./types.js";
