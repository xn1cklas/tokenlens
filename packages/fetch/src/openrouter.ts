import {
  type SourceModel,
  type SourceProviders,
  TokenlensError,
} from "@tokenlens/core";
import type { CommonOptions } from "./types.js";
import {
  costFromPerTokenPricing,
  ensureJsonObject,
  fetchWithControls,
  filterCatalog,
  requireArrayField,
  toNumber,
  upsertCatalogProvider,
} from "./utils.js";

type OpenrouterModelJson = Record<string, unknown> & {
  id?: unknown;
  name?: unknown;
  created?: number;
  release_date?: unknown;
  last_updated?: unknown;
  pricing?: Record<string, unknown>;
  cost?: Record<string, unknown>;
  limit?: { context?: unknown; input?: unknown; output?: unknown };
  context_length?: unknown;
  top_provider?: {
    max_completion_tokens?: unknown;
    context_length?: unknown;
    is_moderated?: boolean;
  };
};

function toLimitNumber(value: unknown): number | undefined {
  const n = toNumber(value);
  return n !== undefined && n >= 0 ? n : undefined;
}

function limitFromOpenrouterModel(
  m: OpenrouterModelJson,
): SourceModel["limit"] | undefined {
  const context =
    toLimitNumber(m.limit?.context) ??
    toLimitNumber(m.context_length) ??
    toLimitNumber(m.top_provider?.context_length);
  const input = toLimitNumber(m.limit?.input);
  const output =
    toLimitNumber(m.limit?.output) ??
    toLimitNumber(m.top_provider?.max_completion_tokens);
  const limit = {
    ...(context !== undefined ? { context } : {}),
    ...(input !== undefined ? { input } : {}),
    ...(output !== undefined ? { output } : {}),
  };

  return Object.keys(limit).length ? limit : undefined;
}

function mapOpenrouterModel(m: OpenrouterModelJson, id: string): SourceModel {
  const pricingRaw = m.pricing ?? m.cost;
  const cost = costFromPerTokenPricing(pricingRaw);
  const limit = limitFromOpenrouterModel(m);
  return {
    id,
    canonical_id: id,
    name: (m.name as string | undefined) ?? id,
    ...(m.created !== undefined ? { created: m.created } : {}),
    ...(m.release_date !== undefined
      ? { release_date: m.release_date as string }
      : {}),
    ...(m.last_updated !== undefined
      ? { last_updated: m.last_updated as string }
      : {}),
    ...(cost !== undefined ? { cost } : {}),
    ...(limit !== undefined ? { limit } : {}),
  };
}

export async function fetchOpenrouter(
  options?: CommonOptions,
): Promise<SourceProviders> {
  const res = await fetchWithControls(
    "https://openrouter.ai/api/v1/models",
    options,
  );
  if (!res.ok) {
    throw new TokenlensError.FetchFailed({
      target: "OpenRouter",
      status: res.status,
      statusText: res.statusText,
    });
  }
  const parsed = ensureJsonObject(await res.json(), "OpenRouter");
  const list = requireArrayField<OpenrouterModelJson>(
    parsed,
    "data",
    "OpenRouter",
  );

  const catalog: SourceProviders = {};
  for (const m of list) {
    const id = String(m.id ?? "").trim();
    if (!id) continue;
    const providerPart = id.includes("/") ? id.split("/")[0] : undefined;
    const provider = providerPart ?? "openrouter";
    const existingProvider = upsertCatalogProvider(catalog, {
      providerKey: provider,
      api: "https://openrouter.ai/api/v1",
      doc: "https://openrouter.ai/models",
      env: ["OPENROUTER_API_KEY"],
      source: "openrouter",
    });
    existingProvider.models[id] = mapOpenrouterModel(m, id);
  }

  return filterCatalog(catalog, options?.provider, options?.model);
}
