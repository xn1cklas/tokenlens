import type {
  Model,
  SourceModel,
  SourceProviders,
  SourceProvider,
} from "@tokenlens/core";

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

export type GetModelMetaArgs = {
  providers: SourceProviders;
  provider?: string;
  model?: string;
  models?: ReadonlyArray<string>;
  id?: string; // accepts "provider:model" or "provider/model"
};

/**
 * Flexible accessor for provider or model metadata from a `SourceProviders` catalog.
 *
 * Supports the following shapes:
 * - { providers, provider } -> returns SourceProvider
 * - { providers, provider, model } -> returns SourceModel
 * - { providers, provider, models: string[] } -> returns Record<string, SourceModel>
 * - { providers, id: "provider:model" | "provider/model" } -> returns SourceModel
 */
export function getModelMeta(
  args: GetModelMetaArgs,
): SourceProvider | SourceModel | Record<string, SourceModel> | undefined {
  const { providers } = args;
  if (!providers || typeof providers !== "object") return undefined;

  // Normalize input into provider/model/models
  let provider = args.provider?.trim();
  let model = args.model?.trim();
  const models = args.models?.map((m) => m.trim());

  if (!provider && args.id) {
    const id = args.id.trim();
    const delimIndex = Math.max(id.indexOf(":"), id.indexOf("/"));
    if (delimIndex > 0) {
      provider = id.slice(0, delimIndex);
      model = id.slice(delimIndex + 1);
    }
  }

  if (!provider) return undefined;
  const prov = providers[provider];
  if (!prov || !prov.models) return undefined;

  // Only provider requested
  if (!model && !models) {
    return prov;
  }

  // If model id comes as provider-prefixed, strip provider
  const toShortId = (m: string): string => {
    const idx = Math.max(m.indexOf(":"), m.indexOf("/"));
    if (idx > 0) {
      const maybeProv = m.slice(0, idx);
      const short = m.slice(idx + 1);
      return maybeProv === provider ? short : m;
    }
    return m;
  };

  if (model) {
    const short = toShortId(model);
    return prov.models[short];
  }

  if (models && models.length > 0) {
    const out: Record<string, SourceModel> = {};
    for (const m of models) {
      const short = toShortId(m);
      const found = prov.models[short];
      if (found) out[short] = found;
    }
    return out;
  }

  return undefined;
}
