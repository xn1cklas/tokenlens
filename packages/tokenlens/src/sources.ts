import type { SourceProviders } from "@tokenlens/core";
import type { FetchLike, SourceId, SourceLoader } from "./types.js";

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
