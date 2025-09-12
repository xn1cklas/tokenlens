import type {
  Model,
  ModelCatalog,
  ProviderInfo,
  ProviderModel,
} from "@tokenlens/core";
import { toModelId } from "@tokenlens/core/id";

export type GetModelMetaOptions = {
  providers: ModelCatalog;
  provider?: string;
  model?: string;
  models?: readonly string[];
  id?: string;
};

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

/**
 * Get raw provider info or one/many model entries directly from the static
 * provider files generated in this package.
 *
 * - getModelMeta(provider) -> ProviderInfo | undefined
 * - getModelMeta(provider, modelId) -> ProviderModel | undefined
 * - getModelMeta(provider, [ids...]) -> Record<id, ProviderModel>
 */
// Object overloads (preferred)
export function getModelMeta(opts: {
  providers: ModelCatalog;
  provider: string;
  model?: undefined;
  models?: undefined;
  id?: undefined;
}): ProviderInfo | undefined;
export function getModelMeta(opts: {
  providers: ModelCatalog;
  provider: string;
  model: string;
  models?: undefined;
  id?: undefined;
}): ProviderModel | undefined;
export function getModelMeta(opts: {
  providers: ModelCatalog;
  provider: string;
  models: readonly string[];
  model?: undefined;
  id?: undefined;
}): Record<string, ProviderModel>;
export function getModelMeta(opts: {
  providers: ModelCatalog;
  id: string;
  provider?: string;
  model?: string;
  models?: undefined;
}): ProviderModel | undefined;
export function getModelMeta(
  opts: GetModelMetaOptions,
): ProviderInfo | ProviderModel | Record<string, ProviderModel> | undefined;
// Positional overloads (back-compat)
export function getModelMeta(
  providers: ModelCatalog,
  providerOrId: string,
): ProviderInfo | ProviderModel | undefined;
export function getModelMeta(
  providers: ModelCatalog,
  providerOrId: string,
  modelId: string,
): ProviderModel | undefined;
export function getModelMeta(
  providers: ModelCatalog,
  providerOrId: string,
  modelIds: readonly string[],
): Record<string, ProviderModel>;
export function getModelMeta(
  a: GetModelMetaOptions | ModelCatalog,
  b?: string,
  c?: string | readonly string[],
): ProviderInfo | ProviderModel | Record<string, ProviderModel> | undefined {
  let opts: GetModelMetaOptions;
  if (typeof a === "object" && "providers" in a && b === undefined) {
    opts = a as GetModelMetaOptions;
  } else {
    opts = {
      providers: a as ModelCatalog,
      provider: b as string,
      model: typeof c === "string" ? (c as string) : undefined,
      models: Array.isArray(c) ? (c as readonly string[]) : undefined,
    };
  }

  let provider = opts.provider;
  let mm: string | readonly string[] | undefined = opts.models ?? opts.model;
  if (!mm && opts.id) {
    const canonical = toModelId(opts.id) ?? opts.id.replace("/", ":");
    const idx = canonical.indexOf(":");
    if (idx > 0) {
      provider = canonical.slice(0, idx);
      mm = canonical.slice(idx + 1);
    }
  }

  if (!provider) return undefined;
  const provInfo = opts.providers[provider] as ProviderInfo | undefined;
  if (!provInfo) return undefined;
  if (mm === undefined) return provInfo;
  if (typeof mm === "string") {
    return provInfo.models[mm] as ProviderModel | undefined;
  }
  const out: Record<string, ProviderModel> = {};
  for (const id of mm) {
    const hit = provInfo.models[id];
    if (hit) out[id] = hit as ProviderModel;
  }
  return out;
}
