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
      const splitId = m.id.split(":");
      const modelShort = m.id.includes(":") && splitId[1] ? splitId[1] : m.id;
      const allow = pick?.[provKey];
      if (allow && allow.length > 0) {
        const ok =
          allow.includes(m.id) ||
          (m.vendorId ? allow.includes(m.vendorId) : false) ||
          allow.includes(modelShort);
        if (!ok) continue;
      }
      if (!out[provKey]) {
        out[provKey] = {
          id: provKey,
          models: {},
          source: "package" as const,
          schemaVersion: 1,
          name: provKey,
        };
      }
      const sourceModel: SourceModel = {
        id: modelShort,
        name: m.name ?? modelShort,
        ...(m.modalities?.textIn ||
        m.modalities?.imageIn ||
        m.modalities?.textOut
          ? {
              modalities: {
                input: [
                  ...(m.modalities?.textIn ? ["text"] : []),
                  ...(m.modalities?.imageIn ? ["image"] : []),
                ],
                output: [...(m.modalities?.textOut ? ["text"] : [])],
              },
            }
          : {}),
        ...(m.pricing
          ? {
              cost: {
                ...(m.pricing.inputPerMTokens !== undefined
                  ? { input: m.pricing.inputPerMTokens }
                  : {}),
                ...(m.pricing.outputPerMTokens !== undefined
                  ? { output: m.pricing.outputPerMTokens }
                  : {}),
                ...(m.pricing.reasoningPerMTokens !== undefined
                  ? { reasoning: m.pricing.reasoningPerMTokens }
                  : {}),
                ...(m.pricing.cacheReadPerMTokens !== undefined
                  ? { cache_read: m.pricing.cacheReadPerMTokens }
                  : {}),
                ...(m.pricing.cacheWritePerMTokens !== undefined
                  ? { cache_write: m.pricing.cacheWritePerMTokens }
                  : {}),
              },
            }
          : {}),
        limit: {
          ...(m.context.combinedMax !== undefined
            ? { context: m.context.combinedMax }
            : {}),
          ...(m.context.inputMax !== undefined
            ? { input: m.context.inputMax }
            : {}),
          ...(m.context.outputMax !== undefined
            ? { output: m.context.outputMax }
            : {}),
        },
        ...(m.releasedAt ? { release_date: m.releasedAt } : {}),
        ...(m.verifiedAt ? { last_updated: m.verifiedAt } : {}),
      };
      const provider = out[provKey];
      if (provider) {
        provider.models[modelShort] = sourceModel;
      }
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
