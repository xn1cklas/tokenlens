import {
  type SourceModel,
  type SourceProviders,
  TokenlensError,
} from "@tokenlens/core";
import type { CommonOptions, VercelOptions } from "./types.js";
import {
  costFromPerTokenPricing,
  ensureJsonObject,
  filterCatalog,
  mapWithConcurrency,
  requireArrayField,
  toNumber,
  upsertCatalogProvider,
} from "./utils.js";

const DEFAULT_ENDPOINT_CONCURRENCY = 5;

type VercelModelJson = {
  [key: string]: unknown;
  id?: string;
  name?: string;
  owned_by?: string;
  created?: number;
  context_window?: number | string | null;
  max_tokens?: number | string | null;
  pricing?: Record<string, unknown>;
};

type VercelEndpointJson = {
  provider_name?: string;
  tag?: string;
  context_length?: number | string | null;
  max_completion_tokens?: number | string | null;
  max_prompt_tokens?: number | string | null;
  pricing?: Record<string, unknown>;
};

type VercelModelEndpointsJson = {
  [key: string]: unknown;
  endpoints?: VercelEndpointJson[];
};
type VercelModelWithId = VercelModelJson & { id: string };

function providerIdForVercelModel(model: VercelModelWithId): string {
  const id = model.id;
  const providerPart = id.includes("/") ? id.split("/")[0] : undefined;
  return typeof model.owned_by === "string" && model.owned_by.length > 0
    ? model.owned_by
    : (providerPart ?? "vercel");
}

function selectVercelEndpoint(
  model: VercelModelJson,
  endpoints?: VercelEndpointJson[],
): VercelEndpointJson | undefined {
  if (!endpoints?.length) return undefined;
  if (typeof model.owned_by !== "string" || model.owned_by.length === 0) {
    return endpoints[0];
  }
  return (
    endpoints.find(
      (endpoint) =>
        endpoint.provider_name === model.owned_by ||
        endpoint.tag === model.owned_by,
    ) ?? endpoints[0]
  );
}

function mapVercelModel(
  model: VercelModelWithId,
  endpointDetails?: VercelModelEndpointsJson,
): SourceModel {
  const endpoint = selectVercelEndpoint(model, endpointDetails?.endpoints);
  const contextWindow =
    toNumber(endpoint?.context_length) ?? toNumber(model.context_window);
  const maxTokens =
    toNumber(endpoint?.max_completion_tokens) ?? toNumber(model.max_tokens);
  const maxPromptTokens = toNumber(endpoint?.max_prompt_tokens);
  const limit =
    contextWindow !== undefined ||
    maxPromptTokens !== undefined ||
    maxTokens !== undefined
      ? {
          ...(contextWindow !== undefined ? { context: contextWindow } : {}),
          ...(maxPromptTokens !== undefined ? { input: maxPromptTokens } : {}),
          ...(maxTokens !== undefined ? { output: maxTokens } : {}),
        }
      : undefined;
  const id = model.id;
  const pricingRaw = endpoint?.pricing ?? model.pricing;
  const cost = costFromPerTokenPricing(pricingRaw);

  return {
    id,
    canonical_id: id,
    name: model.name ?? id,
    ...(model.created !== undefined ? { created: model.created } : {}),
    ...(cost !== undefined ? { cost } : {}),
    ...(limit !== undefined ? { limit } : {}),
  };
}

export async function fetchVercelModelEndpoints(
  modelId: string,
  options?: Pick<CommonOptions, "fetch">,
): Promise<VercelModelEndpointsJson> {
  const fetchImpl = options?.fetch ?? globalThis.fetch;
  const encodedModelId = modelId
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  const res = await fetchImpl(
    `https://ai-gateway.vercel.sh/v1/models/${encodedModelId}/endpoints`,
  );
  if (!res.ok) {
    throw new TokenlensError.FetchFailed({
      target: `Vercel AI Gateway endpoints for ${modelId}`,
      status: res.status,
      statusText: res.statusText,
    });
  }
  const parsed = ensureJsonObject(
    await res.json(),
    `Vercel AI Gateway endpoints for ${modelId}`,
  );
  const data = parsed["data"];
  return data && typeof data === "object" && !Array.isArray(data)
    ? (data as VercelModelEndpointsJson)
    : {};
}

async function fetchEndpointDetails(
  models: readonly VercelModelWithId[],
  options: VercelOptions,
): Promise<Map<string, VercelModelEndpointsJson>> {
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const endpointDetailsByModel = new Map<string, VercelModelEndpointsJson>();

  await mapWithConcurrency(
    models,
    options.endpointConcurrency ?? DEFAULT_ENDPOINT_CONCURRENCY,
    async (model) => {
      try {
        endpointDetailsByModel.set(
          model.id,
          await fetchVercelModelEndpoints(model.id, { fetch: fetchImpl }),
        );
      } catch {
        // Per-model endpoint details are enrichment. Keep the base catalog usable
        // when one endpoint is rate-limited, removed, or temporarily unavailable.
      }
    },
  );

  return endpointDetailsByModel;
}

export async function fetchVercel(
  options?: VercelOptions,
): Promise<SourceProviders> {
  const fetchImpl = options?.fetch ?? globalThis.fetch;
  const res = await fetchImpl("https://ai-gateway.vercel.sh/v1/models");
  if (!res.ok) {
    throw new TokenlensError.FetchFailed({
      target: "Vercel AI Gateway",
      status: res.status,
      statusText: res.statusText,
    });
  }
  const parsed = ensureJsonObject(await res.json(), "Vercel AI Gateway");
  const list = requireArrayField<VercelModelJson>(
    parsed,
    "data",
    "Vercel AI Gateway",
  );
  const endpointCandidateList = list.filter(
    (model): model is VercelModelWithId => {
      if (!model) return false;
      const id = String(model.id ?? "");
      if (!id) return false;
      if (
        options?.provider &&
        providerIdForVercelModel({ ...model, id }) !== options.provider
      ) {
        return false;
      }
      return options?.model ? id.includes(options.model) : true;
    },
  );
  const endpointDetailsByModel = options?.includeEndpointDetails
    ? await fetchEndpointDetails(endpointCandidateList, options)
    : new Map<string, VercelModelEndpointsJson>();

  const catalog: SourceProviders = {};
  for (const model of list) {
    const id = String(model.id ?? "");
    if (!id) continue;
    const modelWithId = { ...model, id };
    const providerId = providerIdForVercelModel(modelWithId);
    const provider = upsertCatalogProvider(catalog, {
      providerKey: providerId,
      api: "https://ai-gateway.vercel.sh/v1",
      doc: "https://vercel.com/docs/ai/ai-gateway",
      env: ["VERCEL_AI_API_KEY"],
      source: "vercel",
    });
    provider.models[id] = mapVercelModel(
      modelWithId,
      endpointDetailsByModel.get(id),
    );
  }

  return filterCatalog(catalog, options?.provider, options?.model);
}
