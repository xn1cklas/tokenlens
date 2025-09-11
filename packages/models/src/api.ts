import type { Model, ModelCatalog, ProviderInfo } from "@tokenlens/core";

export type PickMap = Record<string, ReadonlyArray<string> | undefined>;

export function catalogFromModelArrays(
  providerArrays: ReadonlyArray<ReadonlyArray<Model>>,
  pick?: PickMap,
): ModelCatalog {
  const out: ModelCatalog = {} as ModelCatalog;
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
      out[provKey].models[modelShort] = {
        id: modelShort,
        name: m.displayName || modelShort,
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
    }
  }
  return out;
}

export function catalogFromProviders(
  providers: ReadonlyArray<ProviderInfo>,
): ModelCatalog {
  const out: ModelCatalog = {} as ModelCatalog;
  for (const p of providers) {
    if (!p?.id) continue;
    out[p.id] = p as ProviderInfo;
  }
  return out;
}
