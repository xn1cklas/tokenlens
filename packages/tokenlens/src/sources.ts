import type { SourceProviders } from "@tokenlens/core/dto";
import type { FetchLike, SourceId, SourceLoader } from "./types.js";

export async function loadPackageProviders(): Promise<SourceProviders> {
  return {} as SourceProviders;
}

export async function loadSources(
  sources: ReadonlyArray<SourceId>,
  f: FetchLike,
  loaders: Record<SourceId, SourceLoader>,
): Promise<SourceProviders[]> {
  const tasks = sources.map(
    (s) => loaders[s]?.(f) ?? Promise.resolve({} as SourceProviders),
  );
  return Promise.all(tasks);
}
