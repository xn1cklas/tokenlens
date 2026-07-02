import type { SourceProviders } from "@tokenlens/core";
import type { Mock } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tokenlens } from "../src/client.js";
import type { CacheAdapter } from "../src/types.js";
import { createOpenrouterProvidersFixture } from "./fixtures/providers.js";

vi.mock("@tokenlens/fetch", () => {
  const fetchOpenrouter = vi.fn();
  const fetchModelsDev = vi.fn();
  const fetchVercel = vi.fn();
  return {
    fetchOpenrouter,
    fetchModelsDev,
    fetchVercel,
    fetchCatalogSource: vi.fn(
      (
        source: "models.dev" | "openrouter" | "vercel",
        options?: { fetch?: typeof globalThis.fetch },
      ) => {
        if (source === "models.dev") return fetchModelsDev(options);
        if (source === "vercel") return fetchVercel(options);
        return fetchOpenrouter(options);
      },
    ),
  };
});

describe("Tokenlens - Client Caching", () => {
  let fetchOpenrouterSpy: Mock;

  beforeEach(async () => {
    const fetchModule = await import("@tokenlens/fetch");
    fetchOpenrouterSpy = fetchModule.fetchOpenrouter as Mock;
    fetchOpenrouterSpy.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("caches catalog and reuses it", async () => {
    const mockCatalog = createOpenrouterProvidersFixture();
    fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens({
      catalog: "openrouter",
      cacheKey: "test-cache-reuse",
    });

    await client.getModelData({ modelId: "openai/gpt-4o" });
    await client.getModelData({ modelId: "openai/gpt-4o" });

    expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(1);
  });

  it("coalesces concurrent catalog cache misses", async () => {
    const mockCatalog = createOpenrouterProvidersFixture();
    let resolveCatalog!: (catalog: SourceProviders) => void;
    fetchOpenrouterSpy.mockReturnValue(
      new Promise<SourceProviders>((resolve) => {
        resolveCatalog = resolve;
      }),
    );

    const client = new Tokenlens({
      catalog: "openrouter",
      cacheKey: "test-cache-concurrent",
    });

    const first = client.getModelData({ modelId: "openai/gpt-4o" });
    const second = client.computeCostUSD({
      modelId: "openai/gpt-4o",
      usage: { input_tokens: 1_000 },
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(1);
    resolveCatalog(mockCatalog);

    const [model, costs] = await Promise.all([first, second]);
    expect(model.id).toBe("openai/gpt-4o");
    expect(costs.inputTokenCostUSD).toBeCloseTo(0.03, 6);
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
      cacheKey: "test-refresh",
    });

    const initial = await client.getModelData({ modelId: "openai/gpt-4o" });
    expect(initial?.limit?.context).toBe(128_000);

    await client.refresh(true);

    const updated = await client.getModelData({ modelId: "openai/gpt-4o" });
    expect(updated?.limit?.context).toBe(256_000);
    expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(2);
  });

  it("does not let a slower stale request overwrite a forced refresh cache write", async () => {
    const staleCatalog = createOpenrouterProvidersFixture();
    const freshCatalog = createOpenrouterProvidersFixture();
    freshCatalog.openai.models["openai/gpt-4o"].limit = {
      context: 256_000,
      output: 8_192,
    };
    let resolveStale!: (catalog: SourceProviders) => void;
    let resolveFresh!: (catalog: SourceProviders) => void;
    fetchOpenrouterSpy
      .mockReturnValueOnce(
        new Promise<SourceProviders>((resolve) => {
          resolveStale = resolve;
        }),
      )
      .mockReturnValueOnce(
        new Promise<SourceProviders>((resolve) => {
          resolveFresh = resolve;
        }),
      );
    const cache: CacheAdapter = {
      get: vi.fn(() => undefined),
      set: vi.fn(),
    };

    const client = new Tokenlens({
      catalog: "openrouter",
      cache,
      cacheKey: "test-force-refresh-race",
    });

    const staleLookup = client.getModelData({ modelId: "openai/gpt-4o" });
    await Promise.resolve();
    await Promise.resolve();
    const refresh = client.refresh(true);
    await Promise.resolve();
    await Promise.resolve();

    resolveFresh(freshCatalog);
    await refresh;
    expect(cache.set).toHaveBeenCalledTimes(1);
    expect(vi.mocked(cache.set).mock.calls[0]?.[1].value).toBe(freshCatalog);

    resolveStale(staleCatalog);
    const staleModel = await staleLookup;

    expect(staleModel.limit?.context).toBe(128_000);
    expect(cache.set).toHaveBeenCalledTimes(1);
    expect(vi.mocked(cache.set).mock.calls[0]?.[1].value).toBe(freshCatalog);
  });

  it("refresh(false) uses cache if not expired", async () => {
    const mockCatalog = createOpenrouterProvidersFixture();
    fetchOpenrouterSpy.mockResolvedValue(mockCatalog);

    const client = new Tokenlens({
      catalog: "openrouter",
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
      cacheKey: "test-invalidate",
    });

    await client.getModelData({ modelId: "openai/gpt-4o" });
    await client.invalidate();
    await client.getModelData({ modelId: "openai/gpt-4o" });

    expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(2);
  });

  it("falls back to stale cache when fetching a fresh catalog fails", async () => {
    const staleCatalog = createOpenrouterProvidersFixture();
    const cache: CacheAdapter = {
      get: vi.fn(() => ({
        value: staleCatalog,
        expiresAt: Date.now() - 1,
      })),
      set: vi.fn(),
    };
    fetchOpenrouterSpy.mockRejectedValue(new Error("network failed"));

    const client = new Tokenlens({
      catalog: "openrouter",
      cache,
      cacheKey: "test-stale-fallback",
    });

    const modelData = await client.getModelData({ modelId: "openai/gpt-4o" });

    expect(modelData?.id).toBe("openai/gpt-4o");
    expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(1);
    expect(cache.set).not.toHaveBeenCalled();
  });

  it("does not fall back to stale cache during forced refresh", async () => {
    const staleCatalog = createOpenrouterProvidersFixture();
    const cache: CacheAdapter = {
      get: vi.fn(() => ({
        value: staleCatalog,
        expiresAt: Date.now() + 60_000,
      })),
      set: vi.fn(),
    };
    fetchOpenrouterSpy.mockRejectedValue(new Error("network failed"));

    const client = new Tokenlens({
      catalog: "openrouter",
      cache,
      cacheKey: "test-force-refresh-error",
    });

    await expect(client.refresh(true)).rejects.toThrow("network failed");
    expect(fetchOpenrouterSpy).toHaveBeenCalledTimes(1);
    expect(cache.set).not.toHaveBeenCalled();
  });

  it("rethrows fetch failures when no cached catalog is available", async () => {
    const cache: CacheAdapter = {
      get: vi.fn(() => undefined),
      set: vi.fn(),
    };
    fetchOpenrouterSpy.mockRejectedValue(new Error("network failed"));
    const client = new Tokenlens({
      catalog: "openrouter",
      cache,
      cacheKey: "test-no-cache-error",
    });

    await expect(client.refresh()).rejects.toThrow("network failed");
    expect(cache.set).not.toHaveBeenCalled();
  });
});
