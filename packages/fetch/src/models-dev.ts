import {
  type SourceModel,
  type SourceProviders,
  TokenlensError,
} from "@tokenlens/core";
import type { CommonOptions } from "./types.js";
import {
  costFromSourcePricing,
  ensureJsonObject,
  filterCatalog,
  hasTieredPricing,
  upsertCatalogProvider,
  withProviderPrefix,
} from "./utils.js";

type ModelsDevModelJson = Partial<SourceModel> & Record<string, unknown>;

function normalizeModelsDevModels(
  providerId: string,
  models: Record<string, ModelsDevModelJson>,
): Record<string, SourceModel> {
  const normalized: Record<string, SourceModel> = {};

  for (const [modelKey, model] of Object.entries(models)) {
    const { cost: rawCost, extras: rawExtras, ...modelFields } = model;
    const rawId =
      typeof model.id === "string" && model.id.length > 0 ? model.id : modelKey;
    const canonicalKey = withProviderPrefix(providerId, modelKey || rawId);
    const canonicalId = withProviderPrefix(providerId, rawId);
    const canonicalSourceId =
      typeof model.canonical_id === "string" && model.canonical_id.length > 0
        ? model.canonical_id
        : canonicalId;
    const cost = costFromSourcePricing(rawCost);
    const extras = {
      ...(rawExtras &&
      typeof rawExtras === "object" &&
      !Array.isArray(rawExtras)
        ? rawExtras
        : {}),
      ...(hasTieredPricing(rawCost) ? { sourceCost: rawCost } : {}),
    };

    normalized[canonicalKey] = {
      ...modelFields,
      id: canonicalId,
      canonical_id: withProviderPrefix(providerId, canonicalSourceId),
      name:
        typeof model.name === "string" && model.name.length > 0
          ? model.name
          : canonicalId,
      ...(cost ? { cost } : {}),
      ...(Object.keys(extras).length ? { extras } : {}),
    };
  }

  return normalized;
}

export async function fetchModelsDev(
  options?: CommonOptions,
): Promise<SourceProviders> {
  const fetchImpl = options?.fetch ?? globalThis.fetch;
  const res = await fetchImpl("https://models.dev/api.json");
  if (!res.ok) {
    throw new TokenlensError.FetchFailed({
      target: "models.dev",
      status: res.status,
      statusText: res.statusText,
    });
  }
  type ModelsDevProviderJson = {
    id?: string;
    name?: string;
    api?: string;
    doc?: string;
    docs?: string;
    env?: readonly string[];
    models?: Record<string, ModelsDevModelJson>;
  };
  const raw = ensureJsonObject(await res.json(), "models.dev") as Record<
    string,
    ModelsDevProviderJson
  >;
  const catalog: SourceProviders = {};
  const entries: Array<[string, ModelsDevProviderJson]> = Object.entries(raw);
  for (const [provKey, prov] of entries) {
    const providerId = prov.id ?? provKey;
    const models = normalizeModelsDevModels(providerId, prov.models ?? {});
    const provider = upsertCatalogProvider(catalog, {
      providerKey: provKey,
      providerId,
      name: prov.name ?? provKey,
      ...(prov.api !== undefined ? { api: prov.api } : {}),
      ...((prov.doc ?? prov.docs) ? { doc: prov.doc ?? prov.docs } : {}),
      ...(prov.env !== undefined ? { env: prov.env } : {}),
      source: "models.dev",
    });
    provider.models = models;
  }
  return filterCatalog(catalog, options?.provider, options?.model);
}
