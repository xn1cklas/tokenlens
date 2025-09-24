import type { Providers } from "@tokenlens/core/dto";
import type { SourceId, SourceLoader } from "./types.js";

const openrouterLoader: SourceLoader = async (fetchImpl) =>
  (await import("@tokenlens/fetch")).fetchOpenrouter({ fetch: fetchImpl });

const modelsDevLoader: SourceLoader = async (fetchImpl) =>
  (await import("@tokenlens/fetch")).fetchModelsDev({ fetch: fetchImpl });

const packageLoader: SourceLoader = async () => ({}) as Providers;

const defaultLoaders: Record<SourceId, SourceLoader> = {
  openrouter: openrouterLoader,
  "models.dev": modelsDevLoader,
  package: packageLoader,
};

export const DEFAULT_SOURCE: SourceId = "models.dev";

export function getDefaultLoader(source: SourceId): SourceLoader | undefined {
  return defaultLoaders[source];
}

export function buildLoaderMap(
  sources: ReadonlyArray<SourceId>,
  overrides?: Partial<Record<SourceId, SourceLoader>>,
): Record<SourceId, SourceLoader> {
  const map: Record<SourceId, SourceLoader> = {} as Record<
    SourceId,
    SourceLoader
  >;
  for (const source of sources) {
    const loader = overrides?.[source] ?? getDefaultLoader(source);
    if (loader) map[source] = loader;
  }
  return map;
}
