import { assertSourceProviders, type SourceProviders } from "@tokenlens/core";
import { describe, expect, it, vi } from "vitest";
import { fetchModelsDev, fetchOpenrouter, fetchVercel } from "../src/index.ts";

const describeLive =
  process.env["RUN_LIVE_TESTS"] === "1" ? describe : describe.skip;

const jsonResponse = (body: unknown): Response =>
  ({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => body,
  }) as Response;

function allModels(providers: SourceProviders) {
  return Object.values(providers).flatMap((provider) =>
    Object.values(provider.models),
  );
}

function expectUsefulModel(providers: SourceProviders, search: string) {
  const model = allModels(providers).find((entry) => entry.id.includes(search));
  expect(model).toBeDefined();
  expect(model?.cost ?? model?.limit).toBeDefined();
}

describe("fetch injection", () => {
  it("fetchOpenrouter uses the provided fetch implementation", async () => {
    const fetchImpl = vi.fn<typeof globalThis.fetch>(async () =>
      jsonResponse({
        data: [
          {
            id: "openai/gpt-4o",
            name: "GPT-4o",
            pricing: { prompt: "0.0000025", completion: "0.00001" },
            context_length: 128_000,
          },
        ],
      }),
    );

    const providers = await fetchOpenrouter({ fetch: fetchImpl });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/models",
    );
    expect(providers.openai.models["openai/gpt-4o"]?.cost?.input).toBe(2.5);
  });

  it("fetchModelsDev uses the provided fetch implementation", async () => {
    const fetchImpl = vi.fn<typeof globalThis.fetch>(async () =>
      jsonResponse({
        openai: {
          id: "openai",
          models: {
            "openai/gpt-4o": {
              id: "openai/gpt-4o",
              canonical_id: "openai/gpt-4o",
              name: "GPT-4o",
            },
          },
        },
      }),
    );

    const providers = await fetchModelsDev({ fetch: fetchImpl });

    expect(fetchImpl).toHaveBeenCalledWith("https://models.dev/api.json");
    expect(providers.openai.models["openai/gpt-4o"]?.name).toBe("GPT-4o");
  });

  it("fetchVercel uses the provided fetch implementation", async () => {
    const fetchImpl = vi.fn<typeof globalThis.fetch>(async () =>
      jsonResponse({
        data: [
          {
            id: "openai/gpt-4o",
            name: "GPT-4o",
            owned_by: "openai",
            pricing: { prompt: "0.0000025", completion: "0.00001" },
            context_window: 128_000,
          },
        ],
      }),
    );

    const providers = await fetchVercel({ fetch: fetchImpl });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://ai-gateway.vercel.sh/v1/models",
    );
    expect(providers.openai.models["openai/gpt-4o"]?.limit?.context).toBe(
      128_000,
    );
  });
});

describeLive("live fetchers", () => {
  it("fetchOpenrouter returns catalog with providers and models", async () => {
    const providers = await fetchOpenrouter();
    assertSourceProviders(providers, "live OpenRouter");

    const providerIds = Object.keys(providers);
    expect(providerIds.length).toBeGreaterThan(0);

    const providerId = providerIds[0] as string;
    const provider = providers[providerId];
    expect(providerId).toBeTruthy();
    expect(provider.id).toBe(providerId);
    expect(provider.source).toBe("openrouter");
    expect(provider.env).toContain("OPENROUTER_API_KEY");

    const modelIds = Object.keys(provider.models);
    expect(modelIds.length).toBeGreaterThan(0);

    const modelId = modelIds[0] as string;
    const model = provider.models[modelId];
    expect(modelId).toBeTruthy();
    expect(model.id).toBe(modelId);
    expect(typeof model.name).toBe("string");
  }, 30000);

  it("fetchModelsDev returns providers and models", async () => {
    const providers = await fetchModelsDev();
    assertSourceProviders(providers, "live models.dev");

    const providerIds = Object.keys(providers);
    expect(providerIds.length).toBeGreaterThan(0);

    const providerId = providerIds[0] as string;
    const provider = providers[providerId];
    expect(providerId).toBeTruthy();
    expect(provider.id).toBe(providerId);
    expect(provider.source).toBe("models.dev");

    const modelIds = Object.keys(provider.models);
    expect(modelIds.length).toBeGreaterThan(0);

    const modelId = modelIds[0] as string;
    const model = provider.models[modelId];
    expect(modelId).toBeTruthy();
    expect(model.id).toBe(modelId);
    expect(typeof model.name).toBe("string");
  }, 30000);

  it("fetchVercel returns catalog with providers and models", async () => {
    const providers = await fetchVercel();
    assertSourceProviders(providers, "live Vercel AI Gateway");

    const providerIds = Object.keys(providers);
    expect(providerIds.length).toBeGreaterThan(0);

    const providerId = providerIds[0] as string;
    const provider = providers[providerId];
    expect(providerId).toBeTruthy();
    expect(provider.id).toBe(providerId);
    expect(provider.source).toBe("vercel");
    expect(provider.env).toContain("VERCEL_AI_API_KEY");

    const modelIds = Object.keys(provider.models);
    expect(modelIds.length).toBeGreaterThan(0);

    const modelId = modelIds[0] as string;
    const model = provider.models[modelId];
    expect(modelId).toBeTruthy();
    expect(model.id).toBe(modelId);
    expect(typeof model.name).toBe("string");
  }, 30000);

  it("live parity and overlap checks", async () => {
    const [openrouter, modelsdev] = await Promise.all([
      fetchOpenrouter(),
      fetchModelsDev(),
    ]);

    // Compute overlap by canonical id
    const orIds = new Set(
      Object.values(openrouter).flatMap((p) => Object.keys(p.models)),
    );
    const mdIds = new Set(
      Object.values(modelsdev).flatMap((p) => Object.keys(p.models)),
    );
    const overlap = [...orIds].filter((id) => mdIds.has(id));

    // We expect at least some overlap; skip if dynamic data fails
    expect(overlap.length).toBeGreaterThan(0);

    // Spot-check a few overlapping ids for presence and typed fields
    function findModel(
      catalog: Record<string, { models: Record<string, unknown> }>,
      id: string,
    ) {
      for (const prov of Object.keys(catalog)) {
        const model = catalog[prov]?.models[id];
        if (model)
          return model as {
            id?: string;
            name?: string;
            cost?: { input?: number };
            limit?: { context?: number };
          };
      }
      return undefined;
    }

    for (const id of overlap.slice(0, 5)) {
      const orModel = findModel(openrouter, id);
      const mdModel = findModel(modelsdev, id);
      expect(orModel?.id).toBe(id);
      expect(mdModel?.id).toBe(id);
      expect(typeof orModel?.name).toBe("string");
      expect(typeof mdModel?.name).toBe("string");
      // Costs may differ; just assert numeric if present
      if (orModel?.cost?.input !== undefined) {
        expect(typeof orModel.cost.input).toBe("number");
      }
      if (mdModel?.cost?.input !== undefined) {
        expect(typeof mdModel.cost.input).toBe("number");
      }
      // Context limit presence check
      if (orModel?.limit?.context !== undefined) {
        expect(typeof orModel.limit.context).toBe("number");
      }
      if (mdModel?.limit?.context !== undefined) {
        expect(typeof mdModel.limit.context).toBe("number");
      }
    }
  }, 60000);

  it("live common model contracts include scalar costs or limits", async () => {
    const [openrouter, modelsDev, vercel] = await Promise.all([
      fetchOpenrouter({ provider: "openai", model: "gpt-4o" }),
      fetchModelsDev({ provider: "openai", model: "gpt-4o" }),
      fetchVercel({ provider: "openai", model: "gpt-4o" }),
    ]);

    assertSourceProviders(openrouter, "live OpenRouter filtered");
    assertSourceProviders(modelsDev, "live models.dev filtered");
    assertSourceProviders(vercel, "live Vercel filtered");
    expectUsefulModel(openrouter, "gpt-4o");
    expectUsefulModel(modelsDev, "gpt-4o");
    expectUsefulModel(vercel, "gpt-4o");
  }, 30000);

  it("live Vercel endpoint enrichment remains DTO-compatible", async () => {
    const providers = await fetchVercel({
      endpointConcurrency: 1,
      includeEndpointDetails: true,
      model: "claude",
      provider: "anthropic",
    });

    assertSourceProviders(providers, "live enriched Vercel AI Gateway");
    expectUsefulModel(providers, "claude");
  }, 30000);
});
