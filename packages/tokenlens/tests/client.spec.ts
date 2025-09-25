import { afterEach, describe, expect, it, vi } from "vitest";

type TestModel = {
  id: string;
  name: string;
  reasoning?: boolean;
  tool_call?: boolean;
  attachment?: boolean;
  open_weights?: boolean;
  knowledge?: string;
  limit?: {
    context?: number;
    input?: number;
    output?: number;
  };
  cost?: {
    input?: number;
    output?: number;
    reasoning?: number;
    cache_read?: number;
    cache_write?: number;
  };
};

type Providers = Record<
  string,
  {
    id: string;
    name?: string;
    api?: string;
    doc?: string;
    env?: readonly string[];
    source?: string;
    schemaVersion?: number;
    models: Record<string, TestModel>;
    [extra: string]: unknown;
  }
>;

type Usage = {
  input_tokens?: number;
  output_tokens?: number;
  reasoning_tokens?: number;
  cache_read_tokens?: number;
};

import {
  createClient,
  getContextLimits as apiGetContextLimits,
  estimateCostUSD as apiEstimateCostUSD,
  describeModel as apiDescribeModel,
} from "../src/index.ts";
import { Tokenlens } from "../src/client.ts";
import type { FetchLike, SourceLoader } from "../src/types.ts";
import * as clientModule from "../src/client.ts";

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

function makeOpenrouterCatalog(): Providers {
  return {
    openai: {
      id: "openai",
      name: "OpenAI",
      api: "https://openrouter.ai/api/v1",
      doc: "https://openrouter.ai/models",
      env: ["OPENROUTER_API_KEY"],
      source: "openrouter",
      schemaVersion: 1,
      models: {
        "openai/gpt-4o": {
          id: "openai/gpt-4o",
          name: "GPT-4o",
          reasoning: true,
          tool_call: true,
          attachment: false,
          open_weights: false,
          knowledge: "2024-06",
          limit: { context: 128_000, output: 4096 },
          cost: {
            input: 30,
            output: 60,
            reasoning: 120,
            cache_read: 6,
          },
        },
      },
    },
  } satisfies Providers;
}

function makeModelsDevCatalog(): Providers {
  return {
    anthropic: {
      id: "anthropic",
      name: "Anthropic",
      source: "models.dev",
      schemaVersion: 1,
      models: {
        "anthropic/claude-3.5": {
          id: "anthropic/claude-3.5",
          name: "Claude 3.5",
          reasoning: true,
          tool_call: false,
          attachment: true,
          open_weights: false,
          knowledge: "2024-03",
          limit: { context: 200_000, output: 4096 },
          cost: {
            input: 15,
            output: 75,
          },
        },
      },
    },
  } satisfies Providers;
}

function makePackageCatalog(): Providers {
  return {
    local: {
      id: "local",
      name: "Local Catalog",
      source: "package",
      schemaVersion: 1,
      models: {
        "local/demo": {
          id: "local/demo",
          name: "Local Demo",
          open_weights: true,
        },
      },
    },
  } satisfies Providers;
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
    const openrouterCtrl = makeLoader(makeOpenrouterCatalog());
    const modelsDevCtrl = makeLoader(makeModelsDevCatalog());
    const packageCtrl = makeLoader(makePackageCatalog());

    const client = new Tokenlens({
      sources: ["openrouter", "models.dev", "package"],
      fetch: noopFetch,
      ttlMs: 60_000,
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
    const openrouterCtrl = makeLoader(makeOpenrouterCatalog());
    const modelsDevCtrl = makeLoader(makeModelsDevCatalog());
    const packageCtrl = makeLoader(makePackageCatalog());

    const client = new Tokenlens({
      sources: ["openrouter", "models.dev", "package"],
      fetch: noopFetch,
      ttlMs: 60_000,
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
    expect(openrouterCtrl.getCalls()).toBe(1);
    expect(modelsDevCtrl.getCalls()).toBe(1);
  });

  it("refresh(true) reloads providers and updates cache", async () => {
    const openrouterCtrl = makeLoader(makeOpenrouterCatalog());
    const modelsDevCtrl = makeLoader(makeModelsDevCatalog());
    const packageCtrl = makeLoader(makePackageCatalog());

    const client = new Tokenlens({
      sources: ["openrouter", "models.dev", "package"],
      fetch: noopFetch,
      ttlMs: 60_000,
      loaders: {
        openrouter: openrouterCtrl.loader,
        "models.dev": modelsDevCtrl.loader,
        package: packageCtrl.loader,
      },
    });

    await client.getProviders();

    const updatedOpenrouter = makeOpenrouterCatalog();
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
    const openrouterCtrl = makeLoader(makeOpenrouterCatalog());
    const modelsDevCtrl = makeLoader(makeModelsDevCatalog());
    const packageCtrl = makeLoader(makePackageCatalog());

    const client = new Tokenlens({
      sources: ["openrouter", "models.dev", "package"],
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

    const updatedPackage = makePackageCatalog();
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

  it("returns detailed model info with limits, costs, and hints", async () => {
    const openrouterCtrl = makeLoader(makeOpenrouterCatalog());
    const modelsDevCtrl = makeLoader(makeModelsDevCatalog());
    const packageCtrl = makeLoader(makePackageCatalog());

    const client = new Tokenlens({
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
    const details = await client.describeModel({
      modelId: "openai/gpt-4o",
      usage,
    });

    expect(details.providerId).toBe("openai");
    expect(details.limit?.context).toBe(128_000);
    expect(details.costs?.totalTokenCostUSD).toBeCloseTo(0.1023, 6);
    expect(details.hints?.supportsReasoning).toBe(true);
    expect(details.hints?.supportsToolCall).toBe(true);
    expect(details.hints?.supportsAttachments).toBe(false);
    expect(details.hints?.openWeights).toBe(false);
  });

  it("computes token costs via helper", async () => {
    const openrouterCtrl = makeLoader(makeOpenrouterCatalog());
    const modelsDevCtrl = makeLoader(makeModelsDevCatalog());
    const packageCtrl = makeLoader(makePackageCatalog());

    const client = new Tokenlens({
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
    const costs = await client.estimateCostUSD({
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
    const openrouterCtrl = makeLoader(makeOpenrouterCatalog());
    const modelsDevCtrl = makeLoader(makeModelsDevCatalog());
    const packageCtrl = makeLoader(makePackageCatalog());

    const client = new Tokenlens({
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

  it("createClient wires loader overrides and uses provided fetch", async () => {
    const openrouterCtrl = makeLoader(makeOpenrouterCatalog());
    const modelsDevCtrl = makeLoader(makeModelsDevCatalog());
    const packageCtrl = makeLoader(makePackageCatalog());

    const client = createClient({
      fetch: noopFetch,
      loaders: {
        openrouter: openrouterCtrl.loader,
        "models.dev": modelsDevCtrl.loader,
        package: packageCtrl.loader,
      },
      sources: ["openrouter", "models.dev"],
      ttlMs: 10,
    });

    await client.getProviders();
    expect(openrouterCtrl.getCalls()).toBe(1);
    expect(modelsDevCtrl.getCalls()).toBe(1);
    expect(openrouterCtrl.getLastFetch()).toBe(noopFetch);
  });
});

describe("module-level helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function setupSharedInstance() {
    const openrouterCtrl = makeLoader(makeOpenrouterCatalog());
    const modelsDevCtrl = makeLoader(makeModelsDevCatalog());
    const packageCtrl = makeLoader(makePackageCatalog());

    const client = new Tokenlens({
      fetch: noopFetch,
      ttlMs: 60_000,
      loaders: {
        openrouter: openrouterCtrl.loader,
        "models.dev": modelsDevCtrl.loader,
        package: packageCtrl.loader,
      },
    });

    return {
      client,
      openrouterCtrl,
      modelsDevCtrl,
      packageCtrl,
    };
  }

  it("getContextLimits delegates to shared instance", async () => {
    const { client } = setupSharedInstance();
    await client.getProviders();
    const spy = vi.spyOn(clientModule, "getShared").mockReturnValue(client);

    const limit = await apiGetContextLimits({ modelId: "openai/gpt-4o" });
    expect(limit?.context).toBe(128_000);
    expect(spy).toHaveBeenCalled();
  });

  it("estimateCostUSD delegates to shared instance", async () => {
    const { client } = setupSharedInstance();
    await client.getProviders();
    const spy = vi.spyOn(clientModule, "getShared").mockReturnValue(client);

    const usage = makeUsage();
    const costs = await apiEstimateCostUSD({
      modelId: "openai/gpt-4o",
      usage,
    });
    expect(costs.totalTokenCostUSD).toBeCloseTo(0.1023, 6);
    expect(spy).toHaveBeenCalled();
  });

  it("describeModel returns composed metadata", async () => {
    const { client } = setupSharedInstance();
    await client.getProviders();
    const spy = vi.spyOn(clientModule, "getShared").mockReturnValue(client);

    const usage = makeUsage();
    const metadata = await apiDescribeModel({
      modelId: "openai/gpt-4o",
      usage,
    });

    expect(metadata.providerId).toBe("openai");
    expect(metadata.model?.id).toBe("openai/gpt-4o");
    expect(metadata.costs?.totalTokenCostUSD).toBeCloseTo(0.1023, 6);
    expect(metadata.limit?.context).toBe(128_000);
    expect(metadata.hints?.supportsReasoning).toBe(true);
    expect(spy).toHaveBeenCalled();
  });
});
