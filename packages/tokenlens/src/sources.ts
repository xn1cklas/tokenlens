import type { Providers } from "@tokenlens/core/dto";
import type { FetchLike, SourceId, SourceLoader } from "./types.js";

export async function loadPackageProviders(): Promise<Providers> {
  return {} as Providers;
}

export async function loadSources(
  sources: ReadonlyArray<SourceId>,
  f: FetchLike,
  loaders: Record<SourceId, SourceLoader>,
): Promise<Providers[]> {
  const tasks = sources.map(
    (s) => loaders[s]?.(f) ?? Promise.resolve({} as Providers),
  );
  return Promise.all(tasks);
}
