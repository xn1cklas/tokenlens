export { Tokenlens, getShared } from "./client.js";
import { Tokenlens as Client, type ModelDetails } from "./client.js";
import type { Usage } from "@tokenlens/core/types";
import type { SourceLoader, SourceId } from "./types.js";
import { DEFAULT_SOURCE, getDefaultLoader } from "./default-loaders.js";

/**
 * Create a new Tokenlens client with the given options.
 * @param options - The options for the Tokenlens client.
 * @returns A new Tokenlens client.
 */
/**
 * @public
 * Create a Tokenlens client with optional source/loaders overrides.
 */
export function createClient(
  options?: ConstructorParameters<typeof Client>[0],
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

  return new Client({
    ...rest,
    sources: resolvedSources,
    loaders: resolvedLoaders,
  });
}

/**
 * @public
 * Estimate a model's token usage cost in USD.
 */
export async function estimateCostUSD(args: {
  modelId: string;
  provider?: string;
  usage: Usage;
}) {
  return (await import("./client.js")).getShared().estimateCostUSD(args);
}

/**
 * @public
 * Read the context, input, and output token limits for a model.
 */
export async function getContextLimits(args: {
  modelId: string;
  provider?: string;
}) {
  return (await import("./client.js")).getShared().getContextLimits(args);
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
  return (await import("./client.js")).getShared().describeModel(args);
}

export * from "@tokenlens/helpers";
export type { SourceProviders, SourceModel } from "@tokenlens/core/dto";
