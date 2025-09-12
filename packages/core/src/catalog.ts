import type { ModelCatalog, ProviderInfo, ProviderModel } from "./types.js";
import { toModelId } from "./id.js";

export type GetModelMetaOptions = {
  providers: ModelCatalog;
  provider?: string;
  model?: string;
  models?: readonly string[];
  id?: string;
};

/**
 * Get raw provider info or one/many model entries from a models.dev-compatible catalog.
 *
 * Overloads:
 * - getModelMeta({ providers, provider }) -> ProviderInfo | undefined
 * - getModelMeta({ providers, provider, model }) -> ProviderModel | undefined
 * - getModelMeta({ providers, provider, models }) -> Record<id, ProviderModel>
 * - getModelMeta({ providers, id }) -> ProviderModel | undefined (accepts 'provider:model' or 'provider/model')
 *
 * Positional overloads are supported for back-compat:
 * - getModelMeta(providers, providerOrId)
 * - getModelMeta(providers, provider, modelId)
 * - getModelMeta(providers, provider, modelIds[])
 */
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
