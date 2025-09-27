export { Tokenlens } from "./client.js";
import { Tokenlens as TokenlensClient, type ModelDetails } from "./client.js";
import type { Usage } from "@tokenlens/core";
import type {
  CountTokensContent,
  CountTokensOptions,
  TokenizerResult,
} from "@tokenlens/tokenizer";
import type { SourceLoader, SourceId, TokenlensOptions } from "./types.js";
import { DEFAULT_SOURCE, getDefaultLoader } from "./default-loaders.js";

/**
 * Create a new Tokenlens instance with the given options.
 * @param options - The options for the Tokenlens instance.
 * @returns A new Tokenlens instance.
 */
export function createTokenlens(
  options?: ConstructorParameters<typeof TokenlensClient>[0],
) {
  const { sources, loaders, ...rest } = options ?? {};
  const resolvedSources = [...(sources?.length ? sources : [DEFAULT_SOURCE])];
  const resolvedLoaders: Partial<Record<SourceId, SourceLoader>> = {
    ...(loaders ?? {}),
  };

  for (const source of resolvedSources) {
    if (!resolvedLoaders[source]) {
      const fallback = getDefaultLoader(source);
      if (!fallback) {
        throw new Error(`No loader available for source "${source}"`);
      }
      resolvedLoaders[source] = fallback;
    }
  }

  return new TokenlensClient({
    ...rest,
    sources: resolvedSources,
    loaders: resolvedLoaders,
  });
}

/**
 * Calculate a model's token usage cost in USD.
 */
export async function computeCostUSD(args: {
  modelId: string;
  provider?: string;
  usage: Usage;
}) {
  const tokenlens = getTokenlens();
  return tokenlens.computeCostUSD(args);
}

/**
 * Read the context, input, and output token limits for a model.
 */
export async function getContextLimits(args: {
  modelId: string;
  provider?: string;
}) {
  const tokenlens = getTokenlens();
  return tokenlens.getContextLimits(args);
}

/**
 * Describe a model's metadata exactly as stored in the active sources.
 */
export async function describeModel(args: {
  modelId: string;
  provider?: string;
}): Promise<ModelDetails> {
  const tokenlens = getTokenlens();
  return tokenlens.describeModel(args);
}

export async function experimental_countTokens(args: {
  modelId: string;
  provider?: string;
  content: CountTokensContent;
  options?: CountTokensOptions;
}): Promise<TokenizerResult> {
  const tokenlens = getTokenlens();
  return tokenlens.experimental_countTokens(args);
}

let sharedTokenlens: TokenlensClient | undefined;

/**
 * @internal
 * Lazily creates or returns the shared Tokenlens instance.
 */
function getTokenlens(): TokenlensClient {
  sharedTokenlens ??= new TokenlensClient();
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
export type {
  CountTokensContent,
  CountTokensOptions,
  TokenizerResult,
} from "@tokenlens/tokenizer";
