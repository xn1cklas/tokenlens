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

import type {
  ModelCatalog,
  ProviderInfo,
  ProviderModel,
} from "@tokenlens/core";

export type FetchModelsOptions = {
  /** Filter by provider key (e.g. "deepseek", "xai", "vercel"). */
  provider?: string;
  /** Filter by model id within a provider (or search across providers when provider is omitted). */
  model?: string;
  /** Inject a custom fetch implementation (e.g. from undici/cross-fetch). */
  fetch?: FetchLike;
  /** Optional AbortSignal or similar. */
  signal?: unknown;
  /** Override base URL for testing. Defaults to https://models.dev/api.json */
  baseUrl?: string;
};

/** Coded error for better ergonomics in consumers */
export class FetchModelsError extends Error {
  readonly code: "NETWORK" | "HTTP" | "PARSE" | "UNAVAILABLE";
  readonly status?: number;
  constructor(opts: {
    code: FetchModelsError["code"];
    message: string;
    status?: number;
  }) {
    super(opts.message);
    this.name = "FetchModelsError";
    this.code = opts.code;
    this.status = opts.status;
  }
}

// Overloads for strong return types depending on filters
export async function fetchModels(): Promise<ModelCatalog>;
export async function fetchModels(opts: {
  provider?: undefined;
  model?: undefined;
  fetch?: FetchLike;
  signal?: unknown;
  baseUrl?: string;
}): Promise<ModelCatalog>;
export async function fetchModels(opts: {
  provider: string;
  model?: undefined;
  fetch?: FetchLike;
  signal?: unknown;
  baseUrl?: string;
}): Promise<ProviderInfo | undefined>;
export async function fetchModels(opts: {
  provider?: undefined;
  model: string;
  fetch?: FetchLike;
  signal?: unknown;
  baseUrl?: string;
}): Promise<Array<{ provider: string; model: ProviderModel }>>;
export async function fetchModels(opts: {
  provider: string;
  model: string;
  fetch?: FetchLike;
  signal?: unknown;
  baseUrl?: string;
}): Promise<ProviderModel | undefined>;

/**
 * Fetches the models.dev catalog and optionally filters results by provider and/or model.
 *
 * Error handling:
 * - Throws FetchModelsError with code: 'UNAVAILABLE' (no fetch present), 'NETWORK', 'HTTP', or 'PARSE'.
 */
export async function fetchModels(
  opts: FetchModelsOptions = {},
): Promise<
  | ModelCatalog
  | ProviderInfo
  | ProviderModel
  | Array<{ provider: string; model: ProviderModel }>
  | undefined
> {
  const url = opts.baseUrl ?? "https://models.dev/api.json";
  const fetchImpl: FetchLike | undefined =
    opts.fetch ?? (globalThis as { fetch?: FetchLike }).fetch;

  if (typeof fetchImpl !== "function") {
    throw new FetchModelsError({
      code: "UNAVAILABLE",
      message:
        "No fetch implementation found. Pass a custom `fetch` in options or run on a platform with global fetch (Node 18+, modern browsers).",
    });
  }

  let res: Awaited<ReturnType<FetchLike>>;
  try {
    res = await fetchImpl(
      url,
      opts.signal ? { signal: opts.signal } : undefined,
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown network error";
    throw new FetchModelsError({ code: "NETWORK", message });
  }

  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch {}
    const snippet = body
      ? ` Body: ${body.slice(0, 256)}${body.length > 256 ? "…" : ""}`
      : "";
    throw new FetchModelsError({
      code: "HTTP",
      status: res.status,
      message: `Failed to fetch models.dev API (${res.status} ${res.statusText}).${snippet}`,
    });
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid JSON";
    throw new FetchModelsError({ code: "PARSE", message });
  }

  const catalog = data as ModelCatalog;
  const { provider, model } = opts;
  if (!provider && !model) return catalog;
  if (provider && !model) return catalog[provider];
  if (provider && model) return catalog[provider]?.models?.[model];

  // model only: search across providers
  const matches: Array<{ provider: string; model: ProviderModel }> = [];
  if (!model) return matches;
  for (const [provKey, prov] of Object.entries(catalog)) {
    const m = prov?.models?.[model];
    if (m) matches.push({ provider: provKey, model: m });
  }
  return matches;
}
