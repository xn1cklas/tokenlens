import type { Model } from "@tokenlens/core";
import type {
  SourceModel,
  SourceProviders,
  SourceProvider,
} from "@tokenlens/core/dto";

export type PickMap = Record<string, ReadonlyArray<string> | undefined>;

export function modelsToSourceProviders(
  providerArrays: ReadonlyArray<ReadonlyArray<Model>>,
  pick?: PickMap,
): SourceProviders {
  const out: SourceProviders = {} as SourceProviders;
  for (const arr of providerArrays) {
    for (const m of arr) {
      if (!m?.id || !m?.provider) continue;
      const provKey = m.provider;
      const modelShort = m.id.includes(":") ? m.id.split(":")[1] : m.id;
      const allow = pick?.[provKey];
      if (allow && allow.length > 0) {
        const ok =
          allow.includes(m.id) ||
          (m.vendorId ? allow.includes(m.vendorId) : false) ||
          allow.includes(modelShort);
        if (!ok) continue;
      }
      if (!out[provKey]) out[provKey] = { id: provKey, models: {} };
      const sourceModel: SourceModel = {
        id: modelShort,
        name: m.name || modelShort,
        modalities: {
          input: [
            ...(m.modalities?.textIn ? ["text"] : []),
            ...(m.modalities?.imageIn ? ["image"] : []),
          ],
          output: [...(m.modalities?.textOut ? ["text"] : [])],
        },
        cost: m.pricing
          ? {
              input: m.pricing.inputPerMTokens,
              output: m.pricing.outputPerMTokens,
              reasoning: m.pricing.reasoningPerMTokens,
              cache_read: m.pricing.cacheReadPerMTokens,
              cache_write: m.pricing.cacheWritePerMTokens,
            }
          : undefined,
        limit: {
          context: m.context.combinedMax,
          input: m.context.inputMax,
          output: m.context.outputMax,
        },
        release_date: m.releasedAt,
        last_updated: m.verifiedAt,
      };
      out[provKey].models[modelShort] = sourceModel;
    }
  }
  return out;
}

export function sourceProvidersFromArray(
  providers: ReadonlyArray<SourceProvider>,
): SourceProviders {
  const out: SourceProviders = {} as SourceProviders;
  for (const p of providers) {
    if (!p?.id) continue;
    out[p.id] = p;
  }
  return out;
}
