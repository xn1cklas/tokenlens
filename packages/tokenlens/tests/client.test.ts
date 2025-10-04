import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTokenlens,
  getContextLimits as apiGetContextLimits,
  computeCostUSD as apiComputeCostUSD,
  describeModel as apiDescribeModel,
  setSharedTokenlens,
} from "../src/index.js";
import { Tokenlens } from "../src/client.js";
import { TokenLensError } from "../src/error/index.js";
import { BASE_ERROR_CODES } from "../src/error/codes.js";
import {
  createModelsDevProvidersFixture,
  createOpenrouterProvidersFixture,
} from "./fixtures/providers.js";

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

describe("Tokenlens with different catalogs", () => {
  let fetchModelsDevSpy: any;
  let fetchOpenrouterSpy: any;

  beforeEach(async () => {
    const fetchModule = await import("@tokenlens/fetch");
    fetchModelsDevSpy = vi.spyOn(fetchModule, "fetchModelsDev");
    fetchOpenrouterSpy = vi.spyOn(fetchModule, "fetchOpenrouter");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses openrouter catalog and fetches model data", async () => {
    const mockCatalog = createOpenrouterProvidersFixture();
    fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens({
      catalog: "openrouter",
      ttlMs: 60_000,
      cacheKey: "test-openrouter",
    });

    const modelData = await client.getModelData({ modelId: "openai/gpt-4o" });

    expect(modelData?.id).toBe("openai/gpt-4o");
    expect(modelData?.limit?.context).toBe(128_000);
    expect(fetchOpenrouterSpy).toHaveBeenCalled();
  });

  it("uses models.dev catalog", async () => {
    const mockCatalog = createModelsDevProvidersFixture();
    fetchModelsDevSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens({
      catalog: "models.dev",
      ttlMs: 60_000,
      cacheKey: "test-modelsdev",
    });

    const modelData = await client.getModelData({
      modelId: "anthropic/claude-3.5",
    });

    expect(modelData?.id).toBe("anthropic/claude-3.5");
    expect(modelData?.limit?.context).toBe(200_000);
    expect(fetchModelsDevSpy).toHaveBeenCalled();
  });

  it("uses custom catalog object without fetching", async () => {
    const customCatalog = createOpenrouterProvidersFixture();

    const client = new Tokenlens({
      catalog: customCatalog,
      ttlMs: 60_000,
      cacheKey: "test-custom",
    });

    const modelData = await client.getModelData({ modelId: "openai/gpt-4o" });

    expect(modelData?.id).toBe("openai/gpt-4o");
    expect(fetchModelsDevSpy).not.toHaveBeenCalled();
    expect(fetchOpenrouterSpy).not.toHaveBeenCalled();
  });

  it("defaults to 'openrouter' catalog when not specified", async () => {
    const mockCatalog = createOpenrouterProvidersFixture();
    fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens();

    await client.getModelData({ modelId: "openai/gpt-4o" });

    expect(fetchOpenrouterSpy).toHaveBeenCalled();
  });
});

describe("Tokenlens caching", () => {
  let fetchOpenrouterSpy: any;

  beforeEach(async () => {
    const fetchModule = await import("@tokenlens/fetch");
    fetchOpenrouterSpy = vi.spyOn(fetchModule, "fetchOpenrouter");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("caches catalog and reuses it", async () => {
    const mockCatalog = createOpenrouterProvidersFixture();
    fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens({
      catalog: "openrouter",
      ttlMs: 60_000,
      cacheKey: "test-cache-reuse",
    });

    await client.getModelData({ modelId: "openai/gpt-4o" });
    await client.getModelData({ modelId: "openai/gpt-4o" });

    expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(1);
  });

  it("refresh() updates cached catalog", async () => {
    const initialCatalog = createOpenrouterProvidersFixture();
    const updatedCatalog = createOpenrouterProvidersFixture();
    updatedCatalog.openai.models["openai/gpt-4o"].limit = {
      context: 256_000,
      output: 8_192,
    };

    fetchOpenrouterSpy
      .mockResolvedValueOnce(initialCatalog)
      .mockResolvedValueOnce(updatedCatalog);

    const client = new Tokenlens({
      catalog: "openrouter",
      ttlMs: 60_000,
      cacheKey: "test-refresh",
    });

    const initial = await client.getModelData({ modelId: "openai/gpt-4o" });
    expect(initial?.limit?.context).toBe(128_000);

    await client.refresh(true);

    const updated = await client.getModelData({ modelId: "openai/gpt-4o" });
    expect(updated?.limit?.context).toBe(256_000);
    expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(2);
  });

  it("refresh(false) uses cache if not expired", async () => {
    const mockCatalog = createOpenrouterProvidersFixture();
    fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens({
      catalog: "openrouter",
      ttlMs: 60_000,
      cacheKey: "test-refresh-cached",
    });

    await client.getModelData({ modelId: "openai/gpt-4o" });
    await client.refresh(false);

    expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(1);
  });

  it("invalidate() clears cache forcing new fetch", async () => {
    const mockCatalog = createOpenrouterProvidersFixture();
    fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens({
      catalog: "openrouter",
      ttlMs: 60_000,
      cacheKey: "test-invalidate",
    });

    await client.getModelData({ modelId: "openai/gpt-4o" });
    await client.invalidate();
    await client.getModelData({ modelId: "openai/gpt-4o" });

    expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(2);
  });

  it("does not cache when using custom catalog object", async () => {
    const customCatalog = createOpenrouterProvidersFixture();

    const client = new Tokenlens({
      catalog: customCatalog,
      ttlMs: 60_000,
      cacheKey: "test-no-cache",
    });

    const refreshed = await client.refresh(true);

    expect(refreshed).toBe(customCatalog);
    expect(fetchOpenrouterSpy).not.toHaveBeenCalled();
  });
});

describe("Tokenlens model operations", () => {
  let fetchOpenrouterSpy: any;

  beforeEach(async () => {
    const fetchModule = await import("@tokenlens/fetch");
    fetchOpenrouterSpy = vi.spyOn(fetchModule, "fetchOpenrouter");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getModelData returns model metadata", async () => {
    const mockCatalog = createOpenrouterProvidersFixture();
    fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens({
      catalog: "openrouter",
      cacheKey: "test-model-data",
    });

    const modelData = await client.getModelData({ modelId: "openai/gpt-4o" });

    expect(modelData?.id).toBe("openai/gpt-4o");
    expect(modelData?.name).toBe("GPT-4o");
    expect(modelData?.limit?.context).toBe(128_000);
    expect(modelData?.cost?.input).toBe(30);
  });

  it("getModelData throws error for unknown model", async () => {
    const mockCatalog = createOpenrouterProvidersFixture();
    fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens({
      catalog: "openrouter",
      cacheKey: "test-unknown-model",
    });

    await expect(
      client.getModelData({ modelId: "unknown/model" }),
    ).rejects.toThrow(TokenLensError);

    await expect(
      client.getModelData({ modelId: "unknown/model" }),
    ).rejects.toThrow(BASE_ERROR_CODES.MODEL_NOT_FOUND);
  });

  it("computeCostUSD calculates token costs", async () => {
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

    expect(costs.totalTokenCostUSD).toBeCloseTo(0.1023, 6);
    expect(costs.inputTokenCostUSD).toBeCloseTo(0.06, 6);
    expect(costs.outputTokenCostUSD).toBeCloseTo(0.03, 6);
    expect(costs.reasoningTokenCostUSD).toBeCloseTo(0.012, 6);
    expect(costs.cacheReadTokenCostUSD).toBeCloseTo(0.0003, 6);
  });

  it("computeCostUSD throws error for unknown model", async () => {
    const mockCatalog = createOpenrouterProvidersFixture();
    fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens({
      catalog: "openrouter",
      cacheKey: "test-costs-error",
    });

    const usage = makeUsage();

    await expect(
      client.computeCostUSD({ modelId: "unknown/model", usage }),
    ).rejects.toThrow(TokenLensError);
  });

  it("getContextLimits returns limit information", async () => {
    const mockCatalog = createOpenrouterProvidersFixture();
    fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens({
      catalog: "openrouter",
      cacheKey: "test-limits",
    });

    const limits = await client.getContextLimits({ modelId: "openai/gpt-4o" });

    expect(limits?.context).toBe(128_000);
    expect(limits?.output).toBe(4_096);
  });

  it("getContextLimits throws error for unknown model", async () => {
    const mockCatalog = createOpenrouterProvidersFixture();
    fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens({
      catalog: "openrouter",
      cacheKey: "test-limits-error",
    });

    await expect(
      client.getContextLimits({ modelId: "unknown/model" }),
    ).rejects.toThrow(TokenLensError);
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
});

describe("module-level helpers", () => {
  let fetchOpenrouterSpy: any;

  beforeEach(async () => {
    const fetchModule = await import("@tokenlens/fetch");
    fetchOpenrouterSpy = vi.spyOn(fetchModule, "fetchOpenrouter");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setSharedTokenlens(undefined);
  });

  function setupSharedInstance() {
    const mockCatalog = createOpenrouterProvidersFixture();
    fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

    const tokenlens = createTokenlens({
      catalog: "openrouter",
      ttlMs: 60_000,
      cacheKey: "test-shared",
    });

    setSharedTokenlens(tokenlens);

    return tokenlens;
  }

  it("getContextLimits uses shared instance", async () => {
    const tokenlens = setupSharedInstance();
    await tokenlens.getModelData({ modelId: "openai/gpt-4o" });

    const limits = await apiGetContextLimits({ modelId: "openai/gpt-4o" });

    expect(limits?.context).toBe(128_000);
  });

  it("computeCostUSD uses shared instance", async () => {
    const tokenlens = setupSharedInstance();
    await tokenlens.getModelData({ modelId: "openai/gpt-4o" });

    const usage = makeUsage();
    const costs = await apiComputeCostUSD({
      modelId: "openai/gpt-4o",
      usage,
    });

    expect(costs.totalTokenCostUSD).toBeCloseTo(0.1023, 6);
  });

  it("describeModel uses shared instance", async () => {
    const tokenlens = setupSharedInstance();
    await tokenlens.getModelData({ modelId: "openai/gpt-4o" });

    const metadata = await apiDescribeModel({
      modelId: "openai/gpt-4o",
    });

    expect(metadata?.id).toBe("openai/gpt-4o");
    expect(metadata?.limit?.context).toBe(128_000);
  });

  it("createTokenlens creates instance with options", () => {
    const customCatalog = createOpenrouterProvidersFixture();

    const tokenlens = createTokenlens({
      catalog: customCatalog,
      ttlMs: 10_000,
      cacheKey: "custom-key",
    });

    expect(tokenlens).toBeInstanceOf(Tokenlens);
  });
});
