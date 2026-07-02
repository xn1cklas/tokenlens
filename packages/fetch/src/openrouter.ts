import {
  type SourceModel,
  type SourceProviders,
  TokenlensError,
} from "@tokenlens/core";
import type { CommonOptions } from "./types.js";
import {
  costFromPerTokenPricing,
  ensureJsonObject,
  filterCatalog,
  requireArrayField,
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
  limit?: { context?: number; input?: number; output?: number };
  context_length?: number;
  top_provider?: {
    max_completion_tokens?: number;
    context_length?: number;
    is_moderated?: boolean;
  };
};

function mapOpenrouterModel(m: OpenrouterModelJson, id: string): SourceModel {
  const pricingRaw = m.pricing ?? m.cost;
  const cost = costFromPerTokenPricing(pricingRaw);
  const limit = m.limit;
  const context_length = m.context_length;
  const topProvider = m.top_provider;
  const outputCap = topProvider?.max_completion_tokens;
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
    ...(limit || context_length || outputCap
      ? {
          limit: limit ?? {
            ...(context_length !== undefined
              ? { context: context_length }
              : {}),
            ...(outputCap !== undefined ? { output: outputCap } : {}),
          },
        }
      : {}),
  };
}

export async function fetchOpenrouter(
  options?: CommonOptions,
): Promise<SourceProviders> {
  const fetchImpl = options?.fetch ?? globalThis.fetch;
  const res = await fetchImpl("https://openrouter.ai/api/v1/models");
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
