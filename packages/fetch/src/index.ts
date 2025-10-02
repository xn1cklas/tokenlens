/**
 * Thin async client for the models.dev API (https://models.dev/api.json).
 *
 * - Defaults to returning the full JSON catalog.
 * - Optionally filter by `provider` (e.g. "deepseek", "vercel") and/or `model` (e.g. "gpt-4o").
 * - No runtime dependencies. Uses `globalThis.fetch` if available, or accept a custom `fetch` via options.
 *
 * Note: This returns the raw models.dev schema as-is. Any higher-level formatting can be layered on later.
 */

// Minimal "fetch-like" contract to avoid depending on DOM lib types in this package.
export type FetchLike = (
  input: string,
  init?: { signal?: unknown } & Record<string, unknown>,
  // deno-lint-ignore no-explicit-any
) => Promise<{
  ok: boolean;
  status: number;
  statusText: string;
  json(): Promise<unknown>;
  text(): Promise<string>;
}>;

import type { SourceModel, SourceProviders } from "@tokenlens/core";

export type {
  SourceId,
  SourceModel,
  SourceProvider,
  SourceProviders,
} from "@tokenlens/core";

// ---------------------------------------------
// v2 API: unified data shape + scoped fetchers
// ---------------------------------------------

// DTO types are sourced from @tokenlens/core now

type CommonOptions = {
  provider?: string;
  model?: string;
  fetch?: FetchLike;
};

function getFetch(options?: CommonOptions): FetchLike {
  const f = options?.fetch ?? (globalThis as { fetch?: FetchLike }).fetch;
  if (!f) throw new Error("No fetch implementation available");
  return f;
}

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
  const f = getFetch(options);
  const res = await f("https://models.dev/api.json");
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
  // const rawCost = (m["pricing"] as Record<string, string | number> | undefined) ??
  //   (m["cost"] as Record<string, string | number> | undefined);

  // // Convert OpenRouter per-token costs to per-million-token costs
  // const cost = rawCost ? {
  //   ...(rawCost['prompt'] !== undefined ? {
  //     input: typeof rawCost['prompt'] === 'string' ?
  //       parseFloat(rawCost['prompt']) :
  //       rawCost['prompt']
  //   } : {}),
  //   ...(rawCost['completion'] !== undefined ? {
  //     output: typeof rawCost['completion'] === 'string' ?
  //       parseFloat(rawCost['completion']) :
  //       rawCost['completion']
  //   } : {}),
  //   ...(rawCost['internal_reasoning'] !== undefined ? {
  //     reasoning: typeof rawCost['internal_reasoning'] === 'string' ?
  //       parseFloat(rawCost['internal_reasoning']) :
  //       rawCost['internal_reasoning']
  //   } : {}),
  //   ...(rawCost['input_cache_read'] !== undefined ? {
  //     cache_read: typeof rawCost['input_cache_read'] === 'string' ?
  //       parseFloat(rawCost['input_cache_read']) :
  //       rawCost['input_cache_read']
  //   } : {}),
  //   ...(rawCost['input_cache_write'] !== undefined ? {
  //     cache_write: typeof rawCost['input_cache_write'] === 'string' ?
  //       parseFloat(rawCost['input_cache_write']) :
  //       rawCost['input_cache_write']
  //   } : {}),
  // } : undefined;
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
    name: (m["name"] as string | undefined) ?? id,
    ...(m["description"] !== undefined
      ? { description: m["description"] as string }
      : {}),
    ...(m["attachment"] !== undefined
      ? { attachment: Boolean(m["attachment"]) }
      : {}),
    ...(m["reasoning"] !== undefined
      ? { reasoning: Boolean(m["reasoning"]) }
      : {}),
    ...(m["temperature"] !== undefined
      ? { temperature: Boolean(m["temperature"]) }
      : {}),
    ...(m["tool_call"] !== undefined
      ? { tool_call: Boolean(m["tool_call"]) }
      : {}),
    ...(m["knowledge"] !== undefined
      ? { knowledge: m["knowledge"] as string }
      : {}),
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
    extras: Object.fromEntries(
      Object.entries({
        canonical_slug: (m as { canonical_slug?: string }).canonical_slug,
        hugging_face_id: (m as { hugging_face_id?: string }).hugging_face_id,
        architecture: m["architecture"],
        top_provider: m["top_provider"],
        per_request_limits: (m as { per_request_limits?: unknown })
          .per_request_limits,
        supported_parameters: (m as { supported_parameters?: unknown })
          .supported_parameters,
      }).filter(([_, v]) => v !== undefined),
    ),
  };
}

export async function fetchOpenrouter(
  options?: CommonOptions,
): Promise<SourceProviders> {
  const f = getFetch(options);
  const res = await f("https://openrouter.ai/api/v1/models");
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
