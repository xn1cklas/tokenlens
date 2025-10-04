import type { SourceModel, SourceProviders } from "@tokenlens/core";

export type {
  SourceId,
  SourceModel,
  SourceProvider,
  SourceProviders,
} from "@tokenlens/core";

type CommonOptions = {
  provider?: string;
  model?: string;
};

function filterCatalog(
  catalog: SourceProviders,
  provider?: string,
  model?: string,
): SourceProviders {
  const out: SourceProviders = {};
  for (const [provKey, prov] of Object.entries(catalog)) {
    if (provider && provKey !== provider) continue;
    const models = prov.models || {};
    const filteredModels = model
      ? Object.fromEntries(
          Object.entries(models).filter(([id]) => id.includes(model)),
        )
      : models;
    if (Object.keys(filteredModels).length > 0 || !model) {
      out[provKey] = { ...prov, models: filteredModels };
    }
  }
  return out;
}

export async function fetchModelsDev(
  options?: CommonOptions,
): Promise<SourceProviders> {
  const res = await fetch("https://models.dev/api.json");
  if (!res.ok) {
    throw new Error(
      `Failed to fetch models.dev: ${res.status} ${res.statusText}`,
    );
  }
  type ModelsDevProviderJson = {
    id?: string;
    name?: string;
    api?: string;
    doc?: string;
    docs?: string;
    env?: readonly string[];
    models?: Record<string, SourceModel>;
  };
  const raw = (await res.json()) as Record<string, ModelsDevProviderJson>;
  // Normalize to ProviderInfo minimally
  const catalog: SourceProviders = {};
  const entries: Array<[string, ModelsDevProviderJson]> = Object.entries(
    (raw ?? {}) as Record<string, ModelsDevProviderJson>,
  );
  for (const [provKey, prov] of entries) {
    const models = (prov.models ?? {}) as Record<string, SourceModel>;
    catalog[provKey] = {
      id: prov.id ?? provKey,
      ...(prov.name !== undefined ? { name: prov.name } : { name: provKey }),
      ...(prov.api !== undefined ? { api: prov.api } : {}),
      ...((prov.doc ?? prov.docs) ? { doc: prov.doc ?? prov.docs } : {}),
      ...(prov.env !== undefined ? { env: prov.env } : {}),
      source: "models.dev",
      schemaVersion: 1,
      models,
    };
  }
  return filterCatalog(catalog, options?.provider, options?.model);
}

function mapOpenrouterModel(m: Record<string, unknown>): SourceModel {
  const id = String(m["id"] ?? "");
  const arch = m["architecture"] as
    | {
        input_modalities?: string[];
        output_modalities?: string[];
        tokenizer?: string;
        modality?: string;
      }
    | undefined;
  const modalities = arch
    ? ({ input: arch.input_modalities, output: arch.output_modalities } as {
        input?: string[];
        output?: string[];
      })
    : undefined;
  const cost =
    (m["pricing"] as Record<string, number> | undefined) ??
    (m["cost"] as Record<string, number> | undefined);
  const limit =
    (m["limit"] as
      | { context?: number; input?: number; output?: number }
      | undefined) ?? undefined;
  const context_length = (m as { context_length?: number }).context_length;
  const topProvider = m["top_provider"] as
    | {
        max_completion_tokens?: number;
        context_length?: number;
        is_moderated?: boolean;
      }
    | undefined;
  const outputCap = topProvider?.max_completion_tokens;
  return {
    id,
    canonical_id: id,
    name: (m["name"] as string | undefined) ?? id,
    ...((m as { created?: number }).created !== undefined
      ? { created: (m as { created?: number }).created }
      : {}),
    ...(m["release_date"] !== undefined
      ? { release_date: m["release_date"] as string }
      : {}),
    ...(m["last_updated"] !== undefined
      ? { last_updated: m["last_updated"] as string }
      : {}),
    ...(modalities ? { modalities } : {}),
    ...(m["open_weights"] !== undefined
      ? { open_weights: m["open_weights"] as boolean }
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
  const res = await fetch("https://openrouter.ai/api/v1/models");
  if (!res.ok) {
    throw new Error(
      `Failed to fetch OpenRouter: ${res.status} ${res.statusText}`,
    );
  }
  const parsed = (await res.json()) as {
    data?: Array<Record<string, unknown>>;
  };
  const list = Array.isArray(parsed.data) ? parsed.data : [];

  const catalog: SourceProviders = {};
  for (const m of list) {
    const id = String(m["id"] ?? "");
    const providerPart = id.includes("/") ? id.split("/")[0] : undefined;
    const provider = providerPart ?? "openrouter";
    if (!catalog[provider]) {
      catalog[provider] = {
        id: provider,
        name: provider,
        api: "https://openrouter.ai/api/v1",
        doc: "https://openrouter.ai/models",
        env: ["OPENROUTER_API_KEY"],
        source: "openrouter",
        schemaVersion: 1,
        models: {},
      };
    }
    const existingProvider = catalog[provider];
    if (existingProvider) {
      existingProvider.models[id] = mapOpenrouterModel(m);
    }
  }

  return filterCatalog(catalog, options?.provider, options?.model);
}
