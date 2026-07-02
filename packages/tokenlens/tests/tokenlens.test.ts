import { type SourceProviders, TokenlensError } from "@tokenlens/core";
import { compactJson } from "@tokenlens/helpers";
import type { Mock } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tokenlens } from "../src/client.js";
import {
  computeCostUSD as apiComputeCostUSD,
  countTokens as apiCountTokens,
  estimateCostUSD as apiEstimateCostUSD,
  getContextHealth as apiGetContextHealth,
  getContextLimits as apiGetContextLimits,
  getModelData as apiGetModelData,
  listModels as apiListModels,
  listProviders as apiListProviders,
  tryGetModelData as apiTryGetModelData,
  createTokenlens,
} from "../src/index.js";
import { setSharedTokenlens } from "../src/test-utils.js";
import type { CacheAdapter, CacheEntry } from "../src/types.js";
import {
  createModelsDevProvidersFixture,
  createOpenrouterProvidersFixture,
  createVercelProvidersFixture,
} from "./fixtures/providers.js";

// Mock the fetch functions
vi.mock("@tokenlens/fetch", () => {
  type MockCatalogOptions = {
    endpointConcurrency?: number;
    fetch?: typeof globalThis.fetch;
    includeEndpointDetails?: boolean;
    signal?: AbortSignal;
    timeoutMs?: number;
  };
  type MockCatalogSource = {
    id: string;
    cacheKey?: string;
    load(options?: MockCatalogOptions): Promise<SourceProviders>;
  };
  const fetchOpenrouter = vi.fn();
  const fetchModelsDev = vi.fn();
  const fetchVercel = vi.fn();
  const isCatalogSource = (source: unknown): source is MockCatalogSource =>
    !!source &&
    typeof source === "object" &&
    "id" in source &&
    typeof (source as { id?: unknown }).id === "string" &&
    "load" in source &&
    typeof (source as { load?: unknown }).load === "function";
  return {
    fetchOpenrouter,
    fetchModelsDev,
    fetchVercel,
    catalogInputCacheKey: (
      source:
        | "auto"
        | "models.dev"
        | "openrouter"
        | "vercel"
        | MockCatalogSource,
    ) => (typeof source === "string" ? source : (source.cacheKey ?? source.id)),
    normalizeCatalogId: (
      source: "auto" | "models.dev" | "openrouter" | "vercel",
    ) => (source === "auto" ? "openrouter" : source),
    fetchCatalogSource: vi.fn(
      (
        source:
          | "auto"
          | "models.dev"
          | "openrouter"
          | "vercel"
          | MockCatalogSource,
        options?: MockCatalogOptions,
      ) => {
        if (isCatalogSource(source)) return source.load(options);
        if (source === "models.dev") return fetchModelsDev(options);
        if (source === "vercel") return fetchVercel(options);
        return fetchOpenrouter(options);
      },
    ),
    isCatalogSource,
  };
});

type Usage = {
  input_tokens?: number;
  output_tokens?: number;
  reasoning_tokens?: number;
  cache_read_tokens?: number;
};

function makeUsage(): Usage {
  return {
    input_tokens: 2000,
    output_tokens: 500,
    reasoning_tokens: 100,
    cache_read_tokens: 50,
  };
}

async function resetFetchMocks(): Promise<{
  fetchModelsDev: Mock;
  fetchOpenrouter: Mock;
  fetchVercel: Mock;
}> {
  const fetchModule = await import("@tokenlens/fetch");
  const fetchModelsDev = fetchModule.fetchModelsDev as Mock;
  const fetchOpenrouter = fetchModule.fetchOpenrouter as Mock;
  const fetchVercel = fetchModule.fetchVercel as Mock;
  fetchModelsDev.mockReset();
  fetchOpenrouter.mockReset();
  fetchVercel.mockReset();
  return { fetchModelsDev, fetchOpenrouter, fetchVercel };
}

describe("Tokenlens - Catalog Loading", () => {
  let fetchModelsDevSpy: Mock;
  let fetchOpenrouterSpy: Mock;
  let fetchVercelSpy: Mock;

  beforeEach(async () => {
    const fetchMocks = await resetFetchMocks();
    fetchModelsDevSpy = fetchMocks.fetchModelsDev;
    fetchOpenrouterSpy = fetchMocks.fetchOpenrouter;
    fetchVercelSpy = fetchMocks.fetchVercel;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("uses openrouter catalog", async () => {
    const mockCatalog = createOpenrouterProvidersFixture();
    fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens({
      catalog: "openrouter",
      cacheKey: "test-openrouter",
    });

    const modelData = await client.getModelData({ modelId: "openai/gpt-4o" });

    expect(modelData?.id).toBe("openai/gpt-4o");
    expect(fetchOpenrouterSpy).toHaveBeenCalled();
  });

  it("passes fetch controls to the catalog fetcher", async () => {
    const mockCatalog = createOpenrouterProvidersFixture();
    const fetchImpl = vi.fn<typeof globalThis.fetch>();
    const controller = new AbortController();
    fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens({
      catalog: "openrouter",
      cacheKey: "test-custom-fetch",
      fetch: fetchImpl,
      signal: controller.signal,
      timeoutMs: 123,
    });

    await client.getModelData({ modelId: "openai/gpt-4o" });

    expect(fetchOpenrouterSpy).toHaveBeenCalledWith({
      fetch: fetchImpl,
      signal: controller.signal,
      timeoutMs: 123,
    });
  });

  it("uses models.dev catalog", async () => {
    const mockCatalog = createModelsDevProvidersFixture();
    fetchModelsDevSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens({
      catalog: "models.dev",
      cacheKey: "test-modelsdev",
    });

    const modelData = await client.getModelData({
      modelId: "anthropic/claude-3.5",
    });

    expect(modelData?.id).toBe("anthropic/claude-3.5");
    expect(fetchModelsDevSpy).toHaveBeenCalled();
  });

  it("uses vercel catalog", async () => {
    const mockCatalog = createVercelProvidersFixture();
    fetchVercelSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens({
      catalog: "vercel",
      cacheKey: "test-vercel",
    });

    const modelData = await client.getModelData({ modelId: "openai/gpt-4o" });

    expect(modelData?.id).toBe("openai/gpt-4o");
    expect(fetchVercelSpy).toHaveBeenCalled();
  });

  it("passes Vercel source options to the catalog fetcher", async () => {
    const mockCatalog = createVercelProvidersFixture();
    fetchVercelSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens({
      catalog: "vercel",
      cacheKey: "test-vercel-source-options",
      sourceOptions: {
        vercel: {
          endpointConcurrency: 2,
          includeEndpointDetails: true,
        },
      },
    });

    await client.getModelData({ modelId: "openai/gpt-4o" });

    expect(fetchVercelSpy).toHaveBeenCalledWith({
      endpointConcurrency: 2,
      fetch: globalThis.fetch,
      includeEndpointDetails: true,
    });
  });

  it("uses custom catalog object without fetching", async () => {
    const customCatalog = createOpenrouterProvidersFixture();

    const client = new Tokenlens({
      catalog: customCatalog,
      cacheKey: "test-custom",
    });

    const modelData = await client.getModelData({ modelId: "openai/gpt-4o" });

    expect(modelData?.id).toBe("openai/gpt-4o");
    expect(fetchModelsDevSpy).not.toHaveBeenCalled();
    expect(fetchOpenrouterSpy).not.toHaveBeenCalled();
  });

  it("rejects malformed custom catalog objects before lookup", async () => {
    const client = new Tokenlens({
      catalog: {
        openai: {
          id: "openai",
          models: {
            "openai/gpt-4o": {
              id: "openai/gpt-4o",
              canonical_id: "openai/gpt-4o",
            },
          },
        },
      } as unknown as SourceProviders,
    });

    await expect(
      client.getModelData({ modelId: "openai/gpt-4o" }),
    ).rejects.toMatchObject({
      code: TokenlensError.InvalidCatalog.code,
      meta: {
        reason: "INVALID_FIELD",
        field: "name",
        providerId: "openai",
        modelId: "openai/gpt-4o",
      },
    });
  });

  it("applies custom overrides on top of a built-in catalog", async () => {
    const mockCatalog = createOpenrouterProvidersFixture();
    const overrides: SourceProviders = {
      openai: {
        id: "openai",
        source: "package",
        models: {
          "openai/gpt-4o": {
            id: "openai/gpt-4o",
            canonical_id: "openai/gpt-4o",
            name: "GPT-4o",
            cost: { input: 3, cache_write: 9 },
            limit: { output: 16_384 },
          },
        },
      },
    };
    fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens({
      catalog: "openrouter",
      overrides,
      cacheKey: "test-overrides",
    });

    const modelData = await client.getModelData({ modelId: "openai/gpt-4o" });
    const costs = await client.computeCostUSD({
      modelId: "openai/gpt-4o",
      usage: { input_tokens: 1_000, output_tokens: 1_000 },
    });

    expect(modelData?.limit?.context).toBe(128_000);
    expect(modelData?.limit?.output).toBe(16_384);
    expect(modelData?.cost?.input).toBe(3);
    expect(modelData?.cost?.output).toBe(60);
    expect(modelData?.cost?.cache_write).toBe(9);
    expect(costs.inputTokenCostUSD).toBeCloseTo(0.003, 6);
    expect(costs.outputTokenCostUSD).toBeCloseTo(0.06, 6);
  });

  it("keeps per-instance overrides separate when sharing a cache", async () => {
    const mockCatalog = createOpenrouterProvidersFixture();
    const cacheStore = new Map<string, CacheEntry>();
    const cache: CacheAdapter = {
      get: vi.fn((key) => cacheStore.get(key)),
      set: vi.fn((key, entry) => {
        cacheStore.set(key, entry);
      }),
    };
    const makeOverrides = (inputCost: number): SourceProviders => ({
      openai: {
        id: "openai",
        source: "package",
        models: {
          "openai/gpt-4o": {
            id: "openai/gpt-4o",
            canonical_id: "openai/gpt-4o",
            name: "GPT-4o",
            cost: { input: inputCost },
          },
        },
      },
    });
    fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

    const firstClient = new Tokenlens({
      catalog: "openrouter",
      overrides: makeOverrides(3),
      cache,
      cacheKey: "test-shared-overrides",
    });
    const secondClient = new Tokenlens({
      catalog: "openrouter",
      overrides: makeOverrides(7),
      cache,
      cacheKey: "test-shared-overrides",
    });

    const firstCosts = await firstClient.computeCostUSD({
      modelId: "openai/gpt-4o",
      usage: { input_tokens: 1_000 },
    });
    const secondCosts = await secondClient.computeCostUSD({
      modelId: "openai/gpt-4o",
      usage: { input_tokens: 1_000 },
    });

    expect(firstCosts.inputTokenCostUSD).toBeCloseTo(0.003, 6);
    expect(secondCosts.inputTokenCostUSD).toBeCloseTo(0.007, 6);
    expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(1);
    expect(
      cacheStore.get("test-shared-overrides")?.value.openai.models[
        "openai/gpt-4o"
      ].cost?.input,
    ).toBe(30);
  });

  it("applies custom overrides on top of a custom catalog object", async () => {
    const customCatalog = createOpenrouterProvidersFixture();
    const overrides: SourceProviders = {
      openai: {
        id: "openai",
        source: "package",
        models: {
          "openai/gpt-4o": {
            id: "openai/gpt-4o",
            canonical_id: "openai/gpt-4o",
            name: "GPT-4o",
            cost: { input: 4 },
          },
        },
      },
    };

    const client = new Tokenlens({
      catalog: customCatalog,
      overrides,
      cacheKey: "test-custom-overrides",
    });

    const modelData = await client.getModelData({ modelId: "openai/gpt-4o" });

    expect(modelData?.cost?.input).toBe(4);
    expect(modelData?.cost?.output).toBe(60);
    expect(fetchOpenrouterSpy).not.toHaveBeenCalled();
  });

  it("merges override-only providers, new models, nested fields, and extras", async () => {
    const baseCatalog: SourceProviders = {
      openai: {
        id: "openai",
        source: "package",
        env: ["BASE_OPENAI_KEY"],
        extras: { owner: "base" },
        models: {
          "openai/gpt-4o": {
            id: "openai/gpt-4o",
            canonical_id: "openai/gpt-4o",
            name: "GPT-4o",
            cost: { input: 1 },
            limit: { context: 128_000 },
          },
        },
      },
      plain: {
        id: "plain",
        source: "package",
        models: {
          "plain/model": {
            id: "plain/model",
            canonical_id: "plain/model",
            name: "Plain Model",
          },
        },
      },
    };
    const overrides: SourceProviders = {
      openai: {
        id: "openai",
        source: "package",
        env: ["OVERRIDE_OPENAI_KEY"],
        extras: { tier: "custom" },
        models: {
          "openai/gpt-4o": {
            id: "openai/gpt-4o",
            canonical_id: "openai/gpt-4o",
            name: "GPT-4o Override",
            cost: { output: 2 },
            limit: { output: 16_384 },
          },
          "openai/gpt-new": {
            id: "openai/gpt-new",
            canonical_id: "openai/gpt-new",
            name: "GPT New",
            cost: { input: 3 },
          },
        },
      },
      plain: {
        id: "plain",
        source: "package",
        models: {
          "plain/model": {
            id: "plain/model",
            canonical_id: "plain/model",
            name: "Plain Model Override",
          },
        },
      },
      custom: {
        id: "custom",
        source: "package",
        extras: { owner: "override" },
        models: {
          "custom/model": {
            id: "custom/model",
            canonical_id: "custom/model",
            name: "Custom Model",
          },
        },
      },
      "name-only": {
        id: "name-only",
        source: "package",
        models: {
          "name-only/model": {
            id: "name-only/model",
            canonical_id: "name-only/model",
            name: "Name Only",
          },
        },
      },
      "metadata-only": {
        id: "metadata-only",
        name: "Metadata Only",
        source: "package",
      },
    };

    const client = new Tokenlens({ catalog: baseCatalog, overrides });

    await expect(
      client.getModelData({ modelId: "openai/gpt-4o" }),
    ).resolves.toMatchObject({
      name: "GPT-4o Override",
      cost: { input: 1, output: 2 },
      limit: { context: 128_000, output: 16_384 },
    });
    await expect(
      client.getModelData({ modelId: "openai/gpt-new" }),
    ).resolves.toMatchObject({
      id: "openai/gpt-new",
      cost: { input: 3 },
    });
    await expect(
      client.getModelData({ modelId: "custom/model" }),
    ).resolves.toMatchObject({
      id: "custom/model",
    });
    await expect(
      client.getModelData({ modelId: "plain/model" }),
    ).resolves.toMatchObject({
      id: "plain/model",
      name: "Plain Model Override",
    });
    await expect(client.refresh()).resolves.toMatchObject({
      openai: {
        env: ["OVERRIDE_OPENAI_KEY"],
        extras: { owner: "base", tier: "custom" },
      },
      custom: {
        extras: { owner: "override" },
        models: {
          "custom/model": {
            id: "custom/model",
          },
        },
      },
      "metadata-only": {
        id: "metadata-only",
        models: {},
        name: "Metadata Only",
      },
    });
    await expect(
      client.getModelData({ modelId: "name-only/model" }),
    ).resolves.toMatchObject({
      id: "name-only/model",
      name: "Name Only",
    });
    expect(baseCatalog.openai?.models["openai/gpt-4o"]?.cost).toEqual({
      input: 1,
    });
  });

  it("accepts patch-style overrides and validates the merged catalog", async () => {
    const baseCatalog = createOpenrouterProvidersFixture();
    const client = new Tokenlens({
      catalog: baseCatalog,
      overrides: {
        openai: {
          models: {
            "openai/gpt-4o": {
              cost: { input: 4 },
            },
            "openai/custom": {
              cost: { input: 1, output: 2 },
            },
          },
        },
      },
    });

    await expect(
      client.getModelData({ modelId: "openai/gpt-4o" }),
    ).resolves.toMatchObject({
      cost: { input: 4, output: 60 },
    });
    await expect(
      client.getModelData({ modelId: "openai/custom" }),
    ).resolves.toMatchObject({
      id: "openai/custom",
      canonical_id: "openai/custom",
      name: "openai/custom",
      cost: { input: 1, output: 2 },
    });
  });

  it("rejects malformed override patches before lookup", async () => {
    const baseCatalog = createOpenrouterProvidersFixture();
    const client = new Tokenlens({
      catalog: baseCatalog,
      overrides: {
        openai: {
          models: {
            "openai/gpt-4o": {
              cost: { input: -1 },
            },
          },
        },
      },
    });

    await expect(
      client.getModelData({ modelId: "openai/gpt-4o" }),
    ).rejects.toMatchObject({
      code: TokenlensError.InvalidCatalog.code,
      meta: {
        catalogId: "overrides",
        field: "cost.input",
        modelId: "openai/gpt-4o",
        providerId: "openai",
        reason: "INVALID_FIELD",
      },
    });
  });

  it.each([
    ["root", [], { reason: "INVALID_ROOT" }],
    [
      "provider",
      { openai: null },
      { providerId: "openai", reason: "INVALID_PROVIDER" },
    ],
    [
      "provider field",
      { openai: { id: 42, models: {} } },
      { field: "id", providerId: "openai", reason: "INVALID_FIELD" },
    ],
    [
      "models field",
      { openai: { models: [] } },
      { field: "models", providerId: "openai", reason: "INVALID_FIELD" },
    ],
    [
      "model",
      { openai: { models: { "openai/gpt-4o": null } } },
      {
        modelId: "openai/gpt-4o",
        providerId: "openai",
        reason: "INVALID_MODEL",
      },
    ],
    [
      "model field",
      { openai: { models: { "openai/gpt-4o": { id: 42 } } } },
      {
        field: "id",
        modelId: "openai/gpt-4o",
        providerId: "openai",
        reason: "INVALID_FIELD",
      },
    ],
    [
      "cost field",
      { openai: { models: { "openai/gpt-4o": { cost: 1 } } } },
      {
        field: "cost",
        modelId: "openai/gpt-4o",
        providerId: "openai",
        reason: "INVALID_FIELD",
      },
    ],
    [
      "limit value",
      {
        openai: {
          models: {
            "openai/gpt-4o": {
              limit: { context: Number.POSITIVE_INFINITY },
            },
          },
        },
      },
      {
        field: "limit.context",
        modelId: "openai/gpt-4o",
        providerId: "openai",
        reason: "INVALID_FIELD",
      },
    ],
  ] satisfies Array<[string, unknown, Record<string, unknown>]>)(
    "rejects malformed override %s shapes",
    async (_name, overrides, meta) => {
      const client = new Tokenlens({
        catalog: createOpenrouterProvidersFixture(),
        overrides: overrides as never,
      });

      await expect(
        client.getModelData({ modelId: "openai/gpt-4o" }),
      ).rejects.toMatchObject({
        code: TokenlensError.InvalidCatalog.code,
        meta: {
          catalogId: "overrides",
          ...meta,
        },
      });
    },
  );

  it("reports minimal not-found metadata for object catalogs without providers", async () => {
    const client = new Tokenlens({ catalog: {} });

    await expect(client.getModelData({ modelId: "missing" })).rejects.toEqual(
      expect.objectContaining({
        code: TokenlensError.ModelNotFound.code,
        meta: { modelId: "missing" },
      }),
    );
  });

  it("defaults to 'auto' catalog when not specified", async () => {
    const mockCatalog = createOpenrouterProvidersFixture();
    fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens();

    await client.getModelData({ modelId: "openai/gpt-4o" });

    expect(fetchOpenrouterSpy).toHaveBeenCalled();
  });

  it("passes Vercel source options through standalone helpers", async () => {
    fetchVercelSpy.mockResolvedValue(createVercelProvidersFixture());

    await apiGetModelData({
      catalog: "vercel",
      modelId: "openai/gpt-4o",
      sourceOptions: {
        vercel: {
          endpointConcurrency: 3,
          includeEndpointDetails: true,
        },
      },
    });

    expect(fetchVercelSpy).toHaveBeenCalledWith({
      endpointConcurrency: 3,
      fetch: globalThis.fetch,
      includeEndpointDetails: true,
    });
  });
});

describe("Tokenlens.getContextHealth()", () => {
  let fetchOpenrouterSpy: Mock;

  beforeEach(async () => {
    const fetchMocks = await resetFetchMocks();
    fetchOpenrouterSpy = fetchMocks.fetchOpenrouter;
  });

  afterEach(() => {
    vi.clearAllMocks();
    setSharedTokenlens(undefined);
  });

  it("returns context health from the instance method", async () => {
    fetchOpenrouterSpy.mockResolvedValue(createOpenrouterProvidersFixture());
    const client = new Tokenlens({
      catalog: "openrouter",
      cacheKey: "test-context-health",
    });

    const health = await client.getContextHealth({
      modelId: "openai/gpt-4o",
      usage: { input_tokens: 100_000, output_tokens: 20_000 },
    });

    expect(health).toMatchObject({
      totalTokens: 128_000,
      usedTokens: 120_000,
      remainingTokens: 8_000,
      status: "critical",
    });
  });

  it("uses the standalone context-health helper with catalog selection", async () => {
    fetchOpenrouterSpy.mockResolvedValue(createOpenrouterProvidersFixture());

    const health = await apiGetContextHealth({
      modelId: "openai/gpt-4o",
      usage: { input_tokens: 10_000, output_tokens: 5_000 },
      catalog: "openrouter",
    });

    expect(health).toMatchObject({
      totalTokens: 128_000,
      usedTokens: 15_000,
      status: "healthy",
    });
    expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(1);
  });
});

describe("Tokenlens.getModelData()", () => {
  let fetchOpenrouterSpy: Mock;

  beforeEach(async () => {
    const fetchMocks = await resetFetchMocks();
    fetchOpenrouterSpy = fetchMocks.fetchOpenrouter;
  });

  afterEach(() => {
    vi.clearAllMocks();
    setSharedTokenlens(undefined);
  });

  describe("instance method", () => {
    it("returns model metadata with full details", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const client = new Tokenlens({
        catalog: "openrouter",
        cacheKey: "test-model-data",
      });

      const modelData = await client.getModelData({
        modelId: "openai/gpt-4o",
      });

      expect(modelData?.id).toBe("openai/gpt-4o");
      expect(modelData?.name).toBe("GPT-4o");
      expect(modelData?.limit?.context).toBe(128_000);
      expect(modelData?.cost?.input).toBe(30);
    });

    it("lists providers and models from the active catalog", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const client = new Tokenlens({
        catalog: "openrouter",
        cacheKey: "test-list-models",
      });

      const providers = await client.listProviders();
      const models = await client.listModels({
        provider: "openai.responses",
        search: "gpt-4o",
      });
      const allModels = await client.listModels();
      const providerModels = await client.listModels({
        provider: "openai.responses",
      });
      const searchModels = await client.listModels({
        search: "gpt-4o",
      });
      const missingModels = await client.listModels({
        provider: "openai.responses",
        search: "missing",
      });

      expect(providers.map((provider) => provider.id)).toContain("openai");
      expect(models.map((model) => model.id)).toContain("openai/gpt-4o");
      expect(models.every((model) => model.name.includes("GPT"))).toBe(true);
      expect(allModels.map((model) => model.id)).toContain("openai/gpt-4o");
      expect(providerModels.map((model) => model.id)).toContain(
        "openai/gpt-4o",
      );
      expect(searchModels.map((model) => model.id)).toContain("openai/gpt-4o");
      expect(missingModels).toEqual([]);
    });

    it("returns undefined from tryGetModelData for lookup misses", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const client = new Tokenlens({
        catalog: "openrouter",
        cacheKey: "test-try-get-model",
      });

      await expect(
        client.tryGetModelData({ modelId: "missing-model" }),
      ).resolves.toBeUndefined();
      await expect(
        client.tryGetModelData({ modelId: "openai/gpt-4o" }),
      ).resolves.toMatchObject({ id: "openai/gpt-4o" });
    });

    it("rethrows non-lookup errors from tryGetModelData", async () => {
      const client = new Tokenlens({
        catalog: createOpenrouterProvidersFixture(),
        overrides: [] as never,
      });

      await expect(
        client.tryGetModelData({ modelId: "openai/gpt-4o" }),
      ).rejects.toMatchObject({
        code: TokenlensError.InvalidCatalog.code,
      });
    });

    it("resolves models with provider specified", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const client = new Tokenlens({
        catalog: "openrouter",
        cacheKey: "test-provider",
      });

      const modelData = await client.getModelData({
        modelId: "openai/gpt-4o",
        provider: "openai",
      });

      expect(modelData?.id).toBe("openai/gpt-4o");
    });

    it("throws error for unknown model", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const client = new Tokenlens({
        catalog: "openrouter",
        cacheKey: "test-unknown-model",
      });

      const result = client.getModelData({ modelId: "unknown/model" });

      await expect(result).rejects.toThrow(TokenlensError.ModelNotFound);
      await expect(result).rejects.toMatchObject({
        code: TokenlensError.ModelNotFound.code,
      });
    });

    it("includes normalized model IDs in unknown-model metadata", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);
      const client = new Tokenlens({
        catalog: "openrouter",
        cacheKey: "test-normalized-unknown-model",
      });

      const result = client.getModelData({
        modelId: "anthropic/claude-3.5-sonnet-missing",
      });

      await expect(result).rejects.toMatchObject({
        code: TokenlensError.ModelNotFound.code,
        meta: {
          catalogId: "openrouter",
          providerId: "anthropic",
          resolvedModelId: "anthropic/claude-3-5-sonnet-missing",
        },
      });
    });

    it("throws a structured ambiguity error for unscoped duplicate models", async () => {
      const catalog = createOpenrouterProvidersFixture();
      catalog.azure = {
        id: "azure",
        models: {
          "azure/gpt-4o": {
            id: "azure/gpt-4o",
            canonical_id: "azure/gpt-4o",
            name: "Azure GPT-4o",
          },
        },
      };
      const client = new Tokenlens({ catalog });

      const result = client.getModelData({ modelId: "gpt-4o" });

      await expect(result).rejects.toThrow(TokenlensError.AmbiguousModelId);
      await expect(result).rejects.toMatchObject({
        code: TokenlensError.AmbiguousModelId.code,
        meta: {
          modelId: "gpt-4o",
          candidates: ["openai/gpt-4o", "azure/gpt-4o"],
        },
      });
    });
  });

  describe("standalone function", () => {
    it("uses shared instance", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const tokenlens = createTokenlens({
        catalog: "openrouter",
        cacheKey: "test-shared-model",
      });
      setSharedTokenlens(tokenlens);
      await tokenlens.getModelData({ modelId: "openai/gpt-4o" });

      const metadata = await apiGetModelData({
        modelId: "openai/gpt-4o",
      });

      expect(metadata?.id).toBe("openai/gpt-4o");
      expect(metadata?.limit?.context).toBe(128_000);
    });

    it("creates instance per catalog", async () => {
      const openrouterCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(openrouterCatalog);

      const result = await apiGetModelData({
        modelId: "openai/gpt-4o",
        catalog: "openrouter",
      });

      expect(result?.id).toBe("openai/gpt-4o");
      expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(1);
    });

    it("accepts custom catalogs directly on standalone helpers", async () => {
      const catalog = createOpenrouterProvidersFixture();

      const metadata = await apiGetModelData({
        catalog,
        modelId: "openai/gpt-4o",
      });

      expect(metadata.id).toBe("openai/gpt-4o");
      expect(fetchOpenrouterSpy).not.toHaveBeenCalled();
    });

    it("accepts a configured client on standalone helpers", async () => {
      const catalog = createOpenrouterProvidersFixture();
      const tokenlens = createTokenlens({ catalog });

      const metadata = await apiGetModelData({
        modelId: "openai/gpt-4o",
        tokenlens,
      });

      expect(metadata.id).toBe("openai/gpt-4o");
      expect(fetchOpenrouterSpy).not.toHaveBeenCalled();
    });

    it("exposes standalone discovery helpers", async () => {
      const catalog = createOpenrouterProvidersFixture();

      const providers = await apiListProviders({ catalog });
      const allModels = await apiListModels({ catalog });
      const models = await apiListModels({
        catalog,
        provider: "openai",
        search: "gpt-4o",
      });
      const model = await apiTryGetModelData({
        catalog,
        modelId: "gpt-4o",
        provider: "openai",
      });
      const missing = await apiTryGetModelData({
        catalog,
        modelId: "missing-model",
      });

      expect(providers.map((provider) => provider.id)).toContain("openai");
      expect(allModels.map((model) => model.id)).toContain("openai/gpt-4o");
      expect(models.map((model) => model.id)).toContain("openai/gpt-4o");
      expect(model?.id).toBe("openai/gpt-4o");
      expect(missing).toBeUndefined();
      expect(fetchOpenrouterSpy).not.toHaveBeenCalled();
    });

    it("forwards standalone helper options into ad hoc clients", async () => {
      const catalog = createOpenrouterProvidersFixture();
      const cache: CacheAdapter = {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
      };
      const fetchImpl = vi.fn() as unknown as typeof globalThis.fetch;
      const signal = new AbortController().signal;

      const metadata = await apiGetModelData({
        cache,
        cacheKey: "test-helper-options",
        catalog,
        fetch: fetchImpl,
        modelId: "openai/gpt-4o",
        overrides: {
          openai: {
            id: "openai",
            models: {
              "openai/gpt-4o": {
                id: "openai/gpt-4o",
                canonical_id: "openai/gpt-4o",
                name: "Overridden GPT-4o",
              },
            },
          },
        },
        signal,
        staleIfError: false,
        timeoutMs: 500,
        tokenizer: () => 0,
        ttlMs: 0,
      });

      expect(metadata.name).toBe("Overridden GPT-4o");
      expect(fetchOpenrouterSpy).not.toHaveBeenCalled();
    });

    it("does not globally cache standalone helpers with DI options", async () => {
      const catalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(catalog);
      const fetchImpl = vi.fn() as unknown as typeof globalThis.fetch;

      await apiGetModelData({
        catalog: "openrouter",
        fetch: fetchImpl,
        modelId: "openai/gpt-4o",
      });
      await apiGetModelData({
        catalog: "openrouter",
        fetch: fetchImpl,
        modelId: "openai/gpt-4o",
      });

      expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(2);
      expect(fetchOpenrouterSpy).toHaveBeenCalledWith({ fetch: fetchImpl });
    });

    it("reuses primitive standalone clients when Tokenlens cache is disabled", async () => {
      fetchOpenrouterSpy.mockResolvedValue(createOpenrouterProvidersFixture());

      await apiGetModelData({
        cache: false,
        catalog: "openrouter",
        modelId: "openai/gpt-4o",
      });
      await apiGetModelData({
        cache: false,
        catalog: "openrouter",
        modelId: "openai/gpt-4o",
      });

      expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(2);
    });
  });
});

describe("Tokenlens.computeCostUSD()", () => {
  let fetchOpenrouterSpy: Mock;

  beforeEach(async () => {
    const fetchMocks = await resetFetchMocks();
    fetchOpenrouterSpy = fetchMocks.fetchOpenrouter;
  });

  afterEach(() => {
    vi.clearAllMocks();
    setSharedTokenlens(undefined);
  });

  describe("instance method", () => {
    it("calculates token costs correctly", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const client = new Tokenlens({
        catalog: "openrouter",
        cacheKey: "test-costs",
      });

      const usage = makeUsage();
      const costs = await client.computeCostUSD({
        modelId: "openai/gpt-4o",
        usage,
      });

      expect(costs.totalTokenCostUSD).toBeCloseTo(0.0948, 6);
      expect(costs.inputTokenCostUSD).toBeCloseTo(0.0585, 6);
      expect(costs.outputTokenCostUSD).toBeCloseTo(0.024, 6);
      expect(costs.reasoningTokenCostUSD).toBeCloseTo(0.012, 6);
      expect(costs.cacheReadTokenCostUSD).toBeCloseTo(0.0003, 6);
    });

    it("handles minimal usage (input only)", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const client = new Tokenlens({
        catalog: "openrouter",
        cacheKey: "test-minimal",
      });

      const costs = await client.computeCostUSD({
        modelId: "openai/gpt-4o",
        usage: { input_tokens: 1000 },
      });

      expect(costs.inputTokenCostUSD).toBeCloseTo(0.03, 6);
      expect(costs.outputTokenCostUSD).toBe(0);
    });

    it("throws error for unknown model", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const client = new Tokenlens({
        catalog: "openrouter",
        cacheKey: "test-costs-error",
      });

      const usage = makeUsage();

      const result = client.computeCostUSD({ modelId: "unknown/model", usage });

      await expect(result).rejects.toThrow(TokenlensError.ModelNotFound);
      await expect(result).rejects.toMatchObject({
        code: TokenlensError.ModelNotFound.code,
      });
    });
  });

  describe("standalone function", () => {
    it("uses shared instance", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const tokenlens = createTokenlens({
        catalog: "openrouter",
        cacheKey: "test-shared-cost",
      });
      setSharedTokenlens(tokenlens);
      await tokenlens.getModelData({ modelId: "openai/gpt-4o" });

      const usage = makeUsage();
      const costs = await apiComputeCostUSD({
        modelId: "openai/gpt-4o",
        usage,
      });

      expect(costs.totalTokenCostUSD).toBeCloseTo(0.0948, 6);
    });

    it("works with different catalogs", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const costs = await apiComputeCostUSD({
        modelId: "openai/gpt-4o",
        usage: makeUsage(),
        catalog: "openrouter",
      });

      expect(costs.totalTokenCostUSD).toBeCloseTo(0.0948, 6);
      expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(1);
    });

    it("forwards provider arguments to configured standalone clients", async () => {
      const tokenlens = {
        computeCostUSD: vi.fn(async () => ({
          inputTokenCostUSD: 0,
          outputTokenCostUSD: 0,
          totalTokenCostUSD: 0,
          ratesUsed: {},
        })),
        estimateCostUSD: vi.fn(async () => ({
          inputTokenCostUSD: 0,
          outputTokenCostUSD: 0,
          totalTokenCostUSD: 0,
          inputTokens: 1,
          ratesUsed: {},
        })),
        getContextHealth: vi.fn(async () => ({
          remainingPercentage: 99,
          remainingTokens: 99,
          status: "healthy",
          totalTokens: 1,
          usedPercentage: 1,
          usedTokens: 1,
        })),
        getContextLimits: vi.fn(async () => ({ context: 128_000 })),
        getModelData: vi.fn(async () => ({
          id: "openai/gpt-4o",
          canonical_id: "openai/gpt-4o",
          name: "GPT-4o",
        })),
      } as unknown as Tokenlens;

      await apiComputeCostUSD({
        modelId: "gpt-4o",
        provider: "openai",
        tokenlens,
        usage: makeUsage(),
      });
      await apiEstimateCostUSD({
        data: "hello",
        modelId: "gpt-4o",
        provider: "openai",
        tokenlens,
      });
      await apiGetContextHealth({
        modelId: "gpt-4o",
        provider: "openai",
        tokenlens,
        usage: makeUsage(),
      });
      await apiGetContextLimits({
        modelId: "gpt-4o",
        provider: "openai",
        tokenlens,
      });
      await apiGetModelData({
        modelId: "gpt-4o",
        provider: "openai",
        tokenlens,
      });

      expect(tokenlens.computeCostUSD).toHaveBeenCalledWith({
        modelId: "gpt-4o",
        provider: "openai",
        usage: makeUsage(),
      });
      expect(tokenlens.estimateCostUSD).toHaveBeenCalledWith({
        data: "hello",
        modelId: "gpt-4o",
        provider: "openai",
      });
      expect(tokenlens.getContextHealth).toHaveBeenCalledWith({
        modelId: "gpt-4o",
        provider: "openai",
        usage: makeUsage(),
      });
      expect(tokenlens.getContextLimits).toHaveBeenCalledWith({
        modelId: "gpt-4o",
        provider: "openai",
      });
      expect(tokenlens.getModelData).toHaveBeenCalledWith({
        modelId: "gpt-4o",
        provider: "openai",
      });
    });
  });
});

describe("Tokenlens.getContextLimits()", () => {
  let fetchOpenrouterSpy: Mock;

  beforeEach(async () => {
    const fetchMocks = await resetFetchMocks();
    fetchOpenrouterSpy = fetchMocks.fetchOpenrouter;
  });

  afterEach(() => {
    vi.clearAllMocks();
    setSharedTokenlens(undefined);
  });

  describe("instance method", () => {
    it("returns limit information", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const client = new Tokenlens({
        catalog: "openrouter",
        cacheKey: "test-limits",
      });

      const limits = await client.getContextLimits({
        modelId: "openai/gpt-4o",
      });

      expect(limits?.context).toBe(128_000);
      expect(limits?.output).toBe(4_096);
    });

    it("throws error for unknown model", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const client = new Tokenlens({
        catalog: "openrouter",
        cacheKey: "test-limits-error",
      });

      const result = client.getContextLimits({ modelId: "unknown/model" });

      await expect(result).rejects.toThrow(TokenlensError.ModelNotFound);
      await expect(result).rejects.toMatchObject({
        code: TokenlensError.ModelNotFound.code,
      });
    });
  });

  describe("standalone function", () => {
    it("uses shared instance", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const tokenlens = createTokenlens({
        catalog: "openrouter",
        cacheKey: "test-shared-limits",
      });
      setSharedTokenlens(tokenlens);
      await tokenlens.getModelData({ modelId: "openai/gpt-4o" });

      const limits = await apiGetContextLimits({ modelId: "openai/gpt-4o" });

      expect(limits?.context).toBe(128_000);
    });
  });
});

describe("Tokenlens.estimateCostUSD()", () => {
  let fetchOpenrouterSpy: Mock;

  beforeEach(async () => {
    const fetchMocks = await resetFetchMocks();
    fetchOpenrouterSpy = fetchMocks.fetchOpenrouter;
  });

  afterEach(() => {
    vi.clearAllMocks();
    setSharedTokenlens(undefined);
  });

  describe("instance method", () => {
    it("estimates costs for input text only", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const tokenlens = new Tokenlens({
        catalog: "openrouter",
        cacheKey: "test-estimate-input",
      });

      const result = await tokenlens.estimateCostUSD({
        modelId: "openai/gpt-4o",
        data: "Write a short story about a robot learning to paint.",
      });

      expect(result.inputTokens).toBeGreaterThan(0);
      expect(result.inputTokenCostUSD).toBeGreaterThan(0);
      expect(result.totalTokenCostUSD).toBe(result.inputTokenCostUSD);
    });

    it("compares estimated costs between models", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const tokenlens = new Tokenlens({
        catalog: "openrouter",
        cacheKey: "test-estimate-compare",
      });

      const testInput =
        "Generate a detailed analysis of renewable energy trends.";

      const gpt4o = await tokenlens.estimateCostUSD({
        modelId: "openai/gpt-4o",
        data: testInput,
      });

      // Use same model to compare with different input
      const shortInput = await tokenlens.estimateCostUSD({
        modelId: "openai/gpt-4o",
        data: "Hi",
      });

      // Longer input costs more
      expect(gpt4o.inputTokens).toBeGreaterThan(shortInput.inputTokens);
      expect(gpt4o.totalTokenCostUSD).toBeGreaterThan(
        shortInput.totalTokenCostUSD,
      );
    });

    it("estimates with JSON compaction savings", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const tokenlens = new Tokenlens({
        catalog: "openrouter",
        cacheKey: "test-estimate-json",
      });

      // Create sample JSON data
      const data = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: i * 100,
      }));

      const jsonFormat = JSON.stringify(data);
      const compactFormat = compactJson(data);

      const jsonCost = await tokenlens.estimateCostUSD({
        modelId: "openai/gpt-4o",
        data: jsonFormat,
      });

      const compactCost = await tokenlens.estimateCostUSD({
        modelId: "openai/gpt-4o",
        data: compactFormat,
      });

      expect(compactCost.inputTokens).toBeLessThan(jsonCost.inputTokens);
      expect(compactCost.totalTokenCostUSD).toBeLessThan(
        jsonCost.totalTokenCostUSD,
      );

      const costSavings =
        jsonCost.totalTokenCostUSD - compactCost.totalTokenCostUSD;
      const costSavingsPercent =
        (costSavings / jsonCost.totalTokenCostUSD) * 100;

      expect(costSavingsPercent).toBeGreaterThan(15);
    });

    it("passes explicit providers when estimating costs", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);
      const tokenlens = new Tokenlens({
        catalog: "openrouter",
        cacheKey: "test-estimate-provider",
      });

      const result = await tokenlens.estimateCostUSD({
        modelId: "gpt-4o",
        provider: "openai",
        data: "Hello",
      });

      expect(result.inputTokens).toBeGreaterThan(0);
      expect(result.totalTokenCostUSD).toBeGreaterThan(0);
    });

    it("treats undefined tokenizer counts as zero for estimates", async () => {
      const tokenlens = new Tokenlens({
        catalog: createOpenrouterProvidersFixture(),
        tokenizer: () => undefined,
      });

      const result = await tokenlens.estimateCostUSD({
        modelId: "openai/gpt-4o",
        data: "Hello",
      });

      expect(result.inputTokens).toBe(0);
      expect(result.totalTokenCostUSD).toBe(0);
    });
  });

  describe("standalone function", () => {
    it("works with default catalog", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const result = await apiEstimateCostUSD({
        modelId: "openai/gpt-4o",
        data: "What is the capital of France?",
      });

      expect(result.inputTokens).toBeGreaterThan(0);
      expect(result.inputTokenCostUSD).toBeGreaterThan(0);
    });
  });
});

describe("Tokenlens.countTokens()", () => {
  let fetchOpenrouterSpy: Mock;

  beforeEach(async () => {
    const fetchMocks = await resetFetchMocks();
    fetchOpenrouterSpy = fetchMocks.fetchOpenrouter;
  });

  afterEach(() => {
    vi.clearAllMocks();
    setSharedTokenlens(undefined);
  });

  describe("instance method", () => {
    it("counts tokens for OpenAI models", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const tokenlens = new Tokenlens({
        catalog: "openrouter",
        cacheKey: "test-count-tokens",
      });

      const count = await tokenlens.countTokens({
        modelId: "gpt-4o",
        data: "Hello world",
      });

      expect(count).toBeGreaterThan(0);
    });

    it("counts tokens with different text lengths", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const tokenlens = new Tokenlens({
        catalog: "openrouter",
        cacheKey: "test-count-lengths",
      });

      const shortText = await tokenlens.countTokens({
        modelId: "gpt-4o",
        data: "Hi",
      });

      const longText = await tokenlens.countTokens({
        modelId: "gpt-4o",
        data: "This is a much longer piece of text that should result in more tokens being counted.",
      });

      expect(longText).toBeGreaterThan(shortText ?? 0);
    });
  });

  describe("standalone function", () => {
    it("counts tokens using shared instance", async () => {
      const mockCatalog = createOpenrouterProvidersFixture();
      fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

      const tokenlens = createTokenlens({
        catalog: "openrouter",
        cacheKey: "test-shared-count",
      });

      setSharedTokenlens(tokenlens);

      const count = await apiCountTokens({
        modelId: "gpt-4o",
        data: "Hello world",
      });

      expect(count).toBeGreaterThan(0);
    });
  });
});

describe("Tokenlens - Catalog Management", () => {
  let fetchOpenrouterSpy: Mock;
  let fetchModelsDevSpy: Mock;

  beforeEach(async () => {
    const fetchMocks = await resetFetchMocks();
    fetchOpenrouterSpy = fetchMocks.fetchOpenrouter;
    fetchModelsDevSpy = fetchMocks.fetchModelsDev;
  });

  afterEach(() => {
    vi.clearAllMocks();
    setSharedTokenlens(undefined);
  });

  it("creates separate instances for different catalogs", async () => {
    const openrouterCatalog = createOpenrouterProvidersFixture();
    const modelsDevCatalog = createModelsDevProvidersFixture();

    fetchOpenrouterSpy.mockResolvedValue(openrouterCatalog);
    fetchModelsDevSpy.mockResolvedValue(modelsDevCatalog);

    // Call with openrouter catalog
    await apiComputeCostUSD({
      modelId: "openai/gpt-4o",
      usage: makeUsage(),
      catalog: "openrouter",
    });

    // Call with models.dev catalog
    await apiComputeCostUSD({
      modelId: "anthropic/claude-3.5",
      usage: makeUsage(),
      catalog: "models.dev",
    });

    // Both fetchers should have been called once each
    expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(1);
    expect(fetchModelsDevSpy).toHaveBeenCalledTimes(1);
  });

  it("reuses instance for same catalog", async () => {
    const openrouterCatalog = createOpenrouterProvidersFixture();
    fetchOpenrouterSpy.mockResolvedValue(openrouterCatalog);

    // First call with openrouter
    await apiComputeCostUSD({
      modelId: "openai/gpt-4o",
      usage: makeUsage(),
      catalog: "openrouter",
    });

    // Second call with same catalog
    await apiGetContextLimits({
      modelId: "openai/gpt-4o",
      catalog: "openrouter",
    });

    // Fetcher should only be called once (instance reused)
    expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(1);
  });

  it("defaults to the default catalog when not specified", async () => {
    const mockCatalog = createOpenrouterProvidersFixture();
    fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

    // Call without specifying catalog
    await apiComputeCostUSD({
      modelId: "openai/gpt-4o",
      usage: makeUsage(),
    });

    // Should use 'auto' which defaults to OpenRouter
    expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(1);
  });

  it("setSharedTokenlens clears all catalog instances", async () => {
    const openrouterCatalog = createOpenrouterProvidersFixture();
    fetchOpenrouterSpy.mockResolvedValue(openrouterCatalog);

    // Create instances for different catalogs
    await apiComputeCostUSD({
      modelId: "openai/gpt-4o",
      usage: makeUsage(),
      catalog: "openrouter",
    });

    expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(1);

    // Clear all instances
    setSharedTokenlens(undefined);

    // Next call should fetch again (new instance created)
    await apiComputeCostUSD({
      modelId: "openai/gpt-4o",
      usage: makeUsage(),
      catalog: "openrouter",
    });

    expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(2);
  });
});
