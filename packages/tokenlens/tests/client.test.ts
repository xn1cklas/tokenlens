import { afterEach, describe, expect, it, vi } from "vitest";
import type { SourceProviders } from "@tokenlens/core/dto";

type Usage = {
  input_tokens?: number;
  output_tokens?: number;
  reasoning_tokens?: number;
  cache_read_tokens?: number;
};

import {
  createTokenlens,
  getContextLimits as apiGetContextLimits,
  computeCostUSD as apiComputeCostUSD,
  describeModel as apiDescribeModel,
  setSharedTokenlens,
} from "../src/index.ts";
import { Tokenlens } from "../src/client.ts";
import type { FetchLike, SourceLoader } from "../src/types.ts";
import {
  createModelsDevProvidersFixture,
  createOpenrouterProvidersFixture,
  createPackageProvidersFixture,
} from "./fixtures/providers.ts";

type Providers = SourceProviders;

type LoaderController = {
  loader: SourceLoader;
  setData(next: Providers): void;
  setShouldFail(flag: boolean): void;
  getCalls(): number;
  getLastFetch(): FetchLike | undefined;
};

const noopFetch: FetchLike = async () => {
  throw new Error("Unexpected network call in tests");
};

function makeLoader(initialData: Providers): LoaderController {
  let data = initialData;
  let shouldFail = false;
  let calls = 0;
  let lastFetch: FetchLike | undefined;

  const loader: SourceLoader = async (fetchImpl) => {
    calls += 1;
    lastFetch = fetchImpl;
    if (shouldFail) {
      throw new Error("loader failure");
    }
    return data;
  };

  return {
    loader,
    setData(next) {
      data = next;
    },
    setShouldFail(flag) {
      shouldFail = flag;
    },
    getCalls() {
      return calls;
    },
    getLastFetch() {
      return lastFetch;
    },
  };
}

function makeUsage(): Usage {
  return {
    input_tokens: 2000,
    output_tokens: 500,
    reasoning_tokens: 100,
    cache_read_tokens: 50,
  } satisfies Usage;
}

describe("Tokenlens core", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("merges provider sets, caches results, and reuses cache", async () => {
    const openrouterCtrl = makeLoader(createOpenrouterProvidersFixture());
    const modelsDevCtrl = makeLoader(createModelsDevProvidersFixture());
    const packageCtrl = makeLoader(createPackageProvidersFixture());

    const client = new Tokenlens({
      sources: ["openrouter", "models.dev", "package"],
      fetch: noopFetch,
      ttlMs: 60_000,
      cacheKey: "tests-core",
      loaders: {
        openrouter: openrouterCtrl.loader,
        "models.dev": modelsDevCtrl.loader,
        package: packageCtrl.loader,
      },
    });

    const first = await client.getProviders();
    expect(Object.keys(first)).toEqual(["openai", "anthropic", "local"]);
    expect(openrouterCtrl.getCalls()).toBe(1);
    expect(modelsDevCtrl.getCalls()).toBe(1);

    const second = await client.getProviders();
    expect(second).toBe(first);
    expect(openrouterCtrl.getCalls()).toBe(1);
    expect(modelsDevCtrl.getCalls()).toBe(1);
  });

  it("falls back to cached providers when loaders fail", async () => {
    const openrouterCtrl = makeLoader(createOpenrouterProvidersFixture());
    const modelsDevCtrl = makeLoader(createModelsDevProvidersFixture());
    const packageCtrl = makeLoader(createPackageProvidersFixture());

    const client = new Tokenlens({
      sources: ["openrouter", "models.dev", "package"],
      fetch: noopFetch,
      ttlMs: 0,
      cacheKey: "tests-fallback",
      loaders: {
        openrouter: openrouterCtrl.loader,
        "models.dev": modelsDevCtrl.loader,
        package: packageCtrl.loader,
      },
    });

    const baseline = await client.getProviders();
    openrouterCtrl.setShouldFail(true);
    modelsDevCtrl.setShouldFail(true);

    const fallback = await client.getProviders();
    expect(fallback).toBe(baseline);
    expect(openrouterCtrl.getCalls()).toBe(2);
    expect(modelsDevCtrl.getCalls()).toBe(2);
  });

  it("refresh(true) reloads providers and updates cache", async () => {
    const openrouterCtrl = makeLoader(createOpenrouterProvidersFixture());
    const modelsDevCtrl = makeLoader(createModelsDevProvidersFixture());
    const packageCtrl = makeLoader(createPackageProvidersFixture());

    const client = new Tokenlens({
      sources: ["openrouter", "models.dev", "package"],
      cacheKey: "tests-refresh",
      fetch: noopFetch,
      ttlMs: 60_000,
      loaders: {
        openrouter: openrouterCtrl.loader,
        "models.dev": modelsDevCtrl.loader,
        package: packageCtrl.loader,
      },
    });

    await client.getProviders();

    const updatedOpenrouter = createOpenrouterProvidersFixture();
    updatedOpenrouter.openai.models["openai/gpt-4o-mini"] = {
      id: "openai/gpt-4o-mini",
      name: "GPT-4o Mini",
      limit: { context: 128_000, output: 2048 },
    };
    openrouterCtrl.setData(updatedOpenrouter);

    const refreshed = await client.refresh(true);
    expect(refreshed.openai.models["openai/gpt-4o-mini"]).toBeTruthy();
    expect(openrouterCtrl.getCalls()).toBe(2);
    expect(modelsDevCtrl.getCalls()).toBe(2);

    const cached = await client.getProviders();
    expect(cached).toBe(refreshed);
  });

  it("invalidate clears cache forcing loaders to run again", async () => {
    const openrouterCtrl = makeLoader(createOpenrouterProvidersFixture());
    const modelsDevCtrl = makeLoader(createModelsDevProvidersFixture());
    const packageCtrl = makeLoader(createPackageProvidersFixture());

    const client = new Tokenlens({
      sources: ["openrouter", "models.dev", "package"],
      cacheKey: "tests-invalidate",
      fetch: noopFetch,
      ttlMs: 60_000,
      loaders: {
        openrouter: openrouterCtrl.loader,
        "models.dev": modelsDevCtrl.loader,
        package: packageCtrl.loader,
      },
    });

    const initial = await client.getProviders();
    await client.invalidate();

    const updatedPackage = createPackageProvidersFixture();
    updatedPackage.local.models["local/second"] = {
      id: "local/second",
      name: "Local Second",
      open_weights: true,
    };
    packageCtrl.setData(updatedPackage);

    const next = await client.getProviders();
    expect(next).not.toBe(initial);
    expect(packageCtrl.getCalls()).toBe(2);
    expect(next.local.models["local/second"]).toBeTruthy();
  });

  it("returns the resolved source model", async () => {
    const openrouterCtrl = makeLoader(createOpenrouterProvidersFixture());
    const modelsDevCtrl = makeLoader(createModelsDevProvidersFixture());
    const packageCtrl = makeLoader(createPackageProvidersFixture());

    const client = new Tokenlens({
      sources: ["openrouter", "models.dev", "package"],
      cacheKey: "tests-details",
      fetch: noopFetch,
      ttlMs: 60_000,
      loaders: {
        openrouter: openrouterCtrl.loader,
        "models.dev": modelsDevCtrl.loader,
        package: packageCtrl.loader,
      },
    });

    await client.getProviders();

    const details = await client.describeModel({
      modelId: "openai/gpt-4o",
    });

    expect(details?.id).toBe("openai/gpt-4o");
    expect(details?.limit?.context).toBe(128_000);
    expect(details?.cost?.input).toBe(30);
  });

  it("computes token costs via helper", async () => {
    const openrouterCtrl = makeLoader(createOpenrouterProvidersFixture());
    const modelsDevCtrl = makeLoader(createModelsDevProvidersFixture());
    const packageCtrl = makeLoader(createPackageProvidersFixture());

    const client = new Tokenlens({
      sources: ["openrouter", "models.dev", "package"],
      cacheKey: "tests-costs",
      fetch: noopFetch,
      ttlMs: 60_000,
      loaders: {
        openrouter: openrouterCtrl.loader,
        "models.dev": modelsDevCtrl.loader,
        package: packageCtrl.loader,
      },
    });

    await client.getProviders();

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

  it("returns limit information when available", async () => {
    const openrouterCtrl = makeLoader(createOpenrouterProvidersFixture());
    const modelsDevCtrl = makeLoader(createModelsDevProvidersFixture());
    const packageCtrl = makeLoader(createPackageProvidersFixture());

    const client = new Tokenlens({
      sources: ["openrouter", "models.dev", "package"],
      cacheKey: "tests-limit",
      fetch: noopFetch,
      ttlMs: 60_000,
      loaders: {
        openrouter: openrouterCtrl.loader,
        "models.dev": modelsDevCtrl.loader,
        package: packageCtrl.loader,
      },
    });

    await client.getProviders();

    const limit = await client.getContextLimits({
      modelId: "openai/gpt-4o",
    });
    expect(limit?.context).toBe(128_000);
    expect(limit?.output).toBe(4096);

    const missing = await client.getContextLimits({
      modelId: "does-not-exist",
    });
    expect(missing).toBeUndefined();
  });

  it("createTokenlens wires loader overrides and uses provided fetch", async () => {
    const openrouterCtrl = makeLoader(createOpenrouterProvidersFixture());

    const tokenlens = createTokenlens({
      fetch: noopFetch,
      loaders: {
        openrouter: openrouterCtrl.loader,
      },
      sources: ["openrouter"],
      ttlMs: 10,
    });

    await tokenlens.getProviders();
    expect(openrouterCtrl.getCalls()).toBe(1);
    expect(openrouterCtrl.getLastFetch()).toBe(noopFetch);
  });
});

describe("module-level helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setSharedTokenlens(undefined);
  });

  function setupSharedInstance() {
    const openrouterCtrl = makeLoader(createOpenrouterProvidersFixture());
    const modelsDevCtrl = makeLoader(createModelsDevProvidersFixture());
    const packageCtrl = makeLoader(createPackageProvidersFixture());

    const tokenlens = createTokenlens({
      sources: ["openrouter", "models.dev", "package"],
      fetch: noopFetch,
      ttlMs: 60_000,
      loaders: {
        openrouter: openrouterCtrl.loader,
        "models.dev": modelsDevCtrl.loader,
        package: packageCtrl.loader,
      },
    });

    setSharedTokenlens(tokenlens);

    return {
      tokenlens,
      openrouterCtrl,
      modelsDevCtrl,
      packageCtrl,
    };
  }

  it("getContextLimits returns cached context information", async () => {
    const { tokenlens } = setupSharedInstance();
    await tokenlens.getProviders();

    const limit = await apiGetContextLimits({ modelId: "openai/gpt-4o" });
    expect(limit?.context).toBe(128_000);
  });

  it("computeCostUSD reuses cached providers", async () => {
    const { tokenlens } = setupSharedInstance();
    await tokenlens.getProviders();

    const usage = makeUsage();
    const costs = await apiComputeCostUSD({
      modelId: "openai/gpt-4o",
      usage,
    });
    expect(costs.totalTokenCostUSD).toBeCloseTo(0.1023, 6);
  });

  it("describeModel reuses cached providers", async () => {
    const { tokenlens } = setupSharedInstance();
    await tokenlens.getProviders();

    const metadata = await apiDescribeModel({
      modelId: "openai/gpt-4o",
    });

    expect(metadata?.id).toBe("openai/gpt-4o");
    expect(metadata?.limit?.context).toBe(128_000);
  });
});
