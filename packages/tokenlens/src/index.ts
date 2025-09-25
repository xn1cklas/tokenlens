export { Tokenlens } from "./client.js";
import {
  Tokenlens as TokenlensClient,
  type ModelDetails,
  type ModelHints,
} from "./client.js";
import type { Usage } from "@tokenlens/core/types";
import type { SourceLoader, SourceId, TokenlensOptions } from "./types.js";
import { DEFAULT_SOURCE, getDefaultLoader } from "./default-loaders.js";

/**
 * Create a new Tokenlens instance with the given options.
 * @param options - The options for the Tokenlens instance.
 * @returns A new Tokenlens instance.
 */
/**
 * @public
 * Create a Tokenlens instance with optional source/loaders overrides.
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
 * @public
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
 * @public
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
 * @public
 * Describe a model's metadata, limits, cost hints, and capabilities.
 */
export async function describeModel(args: {
  modelId: string;
  provider?: string;
  usage?: Usage;
}): Promise<ModelDetails> {
  const tokenlens = getTokenlens();
  return tokenlens.describeModel(args);
}

let sharedTokenlens: TokenlensClient | undefined;

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

export type { SourceProviders, SourceModel } from "@tokenlens/core/dto";
export type { Usage } from "@tokenlens/core/types";
export type { ModelDetails, ModelHints, TokenlensOptions };
export type { TokenCosts } from "@tokenlens/helpers";
