import type { Usage } from "@tokenlens/core";
import { Tokenlens as TokenlensClient, type ModelDetails } from "./client.js";
import type { GatewayId, TokenlensOptions } from "./types.js";

/**
 * Create a new Tokenlens instance with the given options.
 * @param options - The options for the Tokenlens instance.
 * @returns A new Tokenlens instance.
 */

interface CreateTokenlensArgs {
  /** The options for the Tokenlens instance. */
  options?: ConstructorParameters<typeof TokenlensClient>[0];
}

export function createTokenlens(args: CreateTokenlensArgs) {
  return new TokenlensClient(args.options);
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

// export async function experimental_countTokens(args: {
//   modelId: string;
//   provider?: string;
//   content: CountTokensContent;
//   options?: CountTokensOptions;
// }): Promise<TokenizerResult> {
//   const tokenlens = getTokenlens();
//   return tokenlens.experimental_countTokens(args);
// }

let sharedTokenlens: TokenlensClient | undefined;

/**
 * @internal
 * Lazily creates or returns the shared Tokenlens instance.
 */
function getTokenlens(provider?: GatewayId): TokenlensClient {
  sharedTokenlens ??= new TokenlensClient({ catalog: provider ?? "auto" });
  return sharedTokenlens;
}

/**
 * @internal Utility for tests to override the shared Tokenlens instance.
 */
export function setSharedTokenlens(tokenlens?: TokenlensClient) {
  sharedTokenlens = tokenlens;
}

export type { SourceProviders, SourceModel, Usage } from "@tokenlens/core";
export type { ModelDetails, TokenlensOptions };
export type { TokenCosts } from "@tokenlens/helpers";
export { Tokenlens } from "./client.js";
