import { TokenlensError } from "@tokenlens/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  catalogInputCacheKey,
  fetchCatalogSource,
  fetchModelsDev,
  fetchOpenrouter,
  fetchVercel,
  fetchVercelModelEndpoints,
  isCatalogSource,
  isCatalogSourceId,
  normalizeCatalogId,
} from "../src/index.ts";
import { fetchWithControls } from "../src/utils.ts";

type JsonShape = Record<string, unknown> | Array<unknown> | null;

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe("catalog source registry", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("normalizes catalog aliases and validates source IDs", () => {
    expect(normalizeCatalogId("auto")).toBe("openrouter");
    expect(normalizeCatalogId("models.dev")).toBe("models.dev");
    expect(isCatalogSourceId("openrouter")).toBe(true);
    expect(isCatalogSourceId("models.dev")).toBe(true);
    expect(isCatalogSourceId("vercel")).toBe(true);
    expect(isCatalogSourceId("package")).toBe(false);
  });

  it("loads custom async catalog sources", async () => {
    const source = {
      id: "acme",
      cacheKey: "acme-cache",
      load: vi.fn(async () => ({
        acme: {
          id: "acme",
          models: {
            "acme/chat": {
              id: "acme/chat",
              canonical_id: "acme/chat",
              name: "Acme Chat",
            },
          },
        },
      })),
    };

    await expect(fetchCatalogSource(source)).resolves.toHaveProperty("acme");
    expect(source.load).toHaveBeenCalledWith(undefined);
    expect(isCatalogSource(source)).toBe(true);
    expect(catalogInputCacheKey(source)).toBe("acme-cache");
    expect(
      catalogInputCacheKey({
        id: "uncached-source",
        load: vi.fn(async () => ({})),
      }),
    ).toBe("uncached-source");
    expect(catalogInputCacheKey("openrouter")).toBe("openrouter");
  });

  it("rejects malformed custom async catalog sources", async () => {
    await expect(
      fetchCatalogSource({
        id: "broken",
        async load() {
          return {
            broken: {
              id: "broken",
              models: {
                "broken/chat": {
                  id: "broken/chat",
                  canonical_id: "broken/chat",
                },
              },
            },
          } as never;
        },
      }),
    ).rejects.toMatchObject({
      code: TokenlensError.InvalidCatalog.code,
      meta: {
        catalogId: "broken",
        reason: "INVALID_FIELD",
        field: "name",
        providerId: "broken",
        modelId: "broken/chat",
      },
    });
  });

  it("dispatches catalog source fetches through the selected adapter", async () => {
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("openrouter.ai")) {
        return {
          ok: true,
          json: async () => ({ data: [{ id: "openai/gpt-5" }] }),
        } as Response;
      }
      if (url.includes("models.dev")) {
        return {
          ok: true,
          json: async () => ({
            openai: { models: { "gpt-5": { name: "GPT-5" } } },
          }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ data: [{ id: "openai/gpt-5" }] }),
      } as Response;
    });

    await expect(fetchCatalogSource("auto")).resolves.toHaveProperty("openai");
    await expect(fetchCatalogSource("models.dev")).resolves.toHaveProperty(
      "openai",
    );
    await expect(fetchCatalogSource("vercel")).resolves.toHaveProperty(
      "openai",
    );
  });

  it("passes abort signals to fetch implementations", async () => {
    const controller = new AbortController();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    await fetchOpenrouter({ signal: controller.signal });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/models",
      { signal: expect.any(AbortSignal) },
    );
  });

  it("does not pass init when fetch controls are not configured", async () => {
    const fetchImpl = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response("{}", {
        headers: { "content-type": "application/json" },
      }),
    );

    await fetchWithControls("https://example.com/models.json", {
      fetch: fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith("https://example.com/models.json");
  });

  it("passes already-aborted parent signals to fetch implementations", async () => {
    const controller = new AbortController();
    controller.abort("stop");
    const fetchImpl = vi
      .fn<typeof globalThis.fetch>()
      .mockImplementation(async (_input, init) => {
        expect(init?.signal).toBeInstanceOf(AbortSignal);
        expect(init?.signal?.aborted).toBe(true);
        return new Response("{}");
      });

    await fetchWithControls("https://example.com/models.json", {
      fetch: fetchImpl,
      signal: controller.signal,
    });
  });

  it("wraps aborted fetches in Tokenlens fetch errors", async () => {
    const abortError = new DOMException(
      "The operation was aborted",
      "AbortError",
    );
    const fetchImpl = vi
      .fn<typeof globalThis.fetch>()
      .mockRejectedValue(abortError);

    await expect(
      fetchWithControls("https://example.com/models.json", {
        fetch: fetchImpl,
        signal: new AbortController().signal,
      }),
    ).rejects.toMatchObject({
      code: TokenlensError.FetchFailed.code,
      cause: abortError,
      meta: expect.objectContaining({ reason: "ABORTED" }),
    });
  });

  it("rethrows non-abort fetch failures", async () => {
    const failure = new Error("network down");
    const fetchImpl = vi
      .fn<typeof globalThis.fetch>()
      .mockRejectedValue(failure);

    await expect(
      fetchWithControls("https://example.com/models.json", {
        fetch: fetchImpl,
      }),
    ).rejects.toBe(failure);
  });

  it("aborts fetches that exceed timeoutMs", async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn<typeof globalThis.fetch>().mockImplementation(
      async (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted", "AbortError"));
          });
        }),
    );

    const request = fetchWithControls("https://example.com/models.json", {
      fetch: fetchImpl,
      timeoutMs: 10,
    });
    const assertion = expect(request).rejects.toMatchObject({
      code: TokenlensError.FetchFailed.code,
      meta: expect.objectContaining({ reason: "ABORTED" }),
    });
    await vi.advanceTimersByTimeAsync(10);

    await assertion;
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("fetchModelsDev DTO normalization", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("maps provider metadata and models into DTO shape", async () => {
    const raw = {
      foo: {
        id: "foo",
        name: "Foo Provider",
        api: "https://foo.dev/api",
        doc: "https://foo.dev/docs",
        env: ["FOO_API_KEY"],
        models: {
          "foo/bar": {
            id: "foo/bar",
            canonical_id: "foo/bar",
            name: "Foo Bar",
            created: 1640000000,
            cost: {
              input: 1.0,
              output: 2.0,
            },
            limit: {
              context: 8192,
            },
          },
        },
      },
    } satisfies JsonShape;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => raw,
    } as Response);

    const catalog = await fetchModelsDev({});

    expect(Object.keys(catalog)).toEqual(["foo"]);
    const provider = catalog.foo;
    expect(provider?.id).toBe("foo");
    expect(provider?.source).toBe("models.dev");
    expect(provider?.schemaVersion).toBe(1);
    expect(provider?.env).toEqual(["FOO_API_KEY"]);
    expect(Object.keys(provider?.models ?? {})).toEqual(["foo/bar"]);
    expect(provider?.models["foo/bar"]).toMatchObject({
      id: "foo/bar",
      canonical_id: "foo/bar",
      name: "Foo Bar",
      created: 1640000000,
      cost: {
        input: 1.0,
        output: 2.0,
      },
      limit: {
        context: 8192,
      },
    });
  });

  it("filters by provider and model substring", async () => {
    const raw = {
      foo: {
        models: {
          "foo/alpha": {
            id: "foo/alpha",
            canonical_id: "foo/alpha",
            name: "Alpha",
          },
          "foo/beta": {
            id: "foo/beta",
            canonical_id: "foo/beta",
            name: "Beta",
          },
        },
      },
      bar: {
        models: {
          "bar/gamma": {
            id: "bar/gamma",
            canonical_id: "bar/gamma",
            name: "Gamma",
          },
        },
      },
    } satisfies JsonShape;

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => raw,
    } as Response);

    const providerFiltered = await fetchModelsDev({
      provider: "foo",
    });

    expect(Object.keys(providerFiltered)).toEqual(["foo"]);

    const modelFiltered = await fetchModelsDev({
      provider: "foo",
      model: "beta",
    });

    expect(Object.keys(modelFiltered)).toEqual(["foo"]);
    const fooProvider = modelFiltered.foo;
    expect(Object.keys(fooProvider?.models ?? {})).toEqual(["foo/beta"]);
  });

  it("prefixes bare models.dev model IDs with the provider namespace", async () => {
    const raw = {
      openai: {
        id: "openai",
        name: "OpenAI",
        models: {
          "gpt-5": {
            id: "gpt-5",
            name: "GPT-5",
          },
        },
      },
    } satisfies JsonShape;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => raw,
    } as Response);

    const catalog = await fetchModelsDev({});

    expect(Object.keys(catalog.openai?.models ?? {})).toEqual(["openai/gpt-5"]);
    expect(catalog.openai?.models["openai/gpt-5"]).toMatchObject({
      id: "openai/gpt-5",
      canonical_id: "openai/gpt-5",
      name: "GPT-5",
    });
  });

  it("preserves tiered models.dev pricing outside scalar helper costs", async () => {
    const raw = {
      google: {
        id: "google",
        models: {
          "gemini-2.5-pro": {
            id: "gemini-2.5-pro",
            name: "Gemini 2.5 Pro",
            cost: {
              input: 1.25,
              output: 10,
              tiers: [
                {
                  input: 2.5,
                  output: 15,
                  tier: { type: "context", size: 200_000 },
                },
              ],
            },
          },
        },
      },
    } satisfies JsonShape;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => raw,
    } as Response);

    const catalog = await fetchModelsDev({});
    const model = catalog.google?.models["google/gemini-2.5-pro"];

    expect(model?.cost).toBeUndefined();
    expect(model?.extras?.sourceCost).toMatchObject({
      input: 1.25,
      output: 10,
      tiers: expect.any(Array),
    });
  });

  it("uses provider IDs, docs aliases, fallback names, and tier-over extras", async () => {
    const raw = {
      openai: {
        id: "openai.responses",
        docs: "https://platform.openai.com/docs",
        models: {
          "gpt-5": {
            cost: {
              input: 1,
              output: 2,
              input_over_200k: { input: 2 },
            },
            extras: {
              mode: "responses",
            },
          },
        },
      },
    } satisfies JsonShape;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => raw,
    } as Response);

    const catalog = await fetchModelsDev({});
    const provider = catalog.openai;
    const model = provider?.models["openai.responses/gpt-5"];

    expect(provider).toMatchObject({
      id: "openai.responses",
      name: "openai",
      doc: "https://platform.openai.com/docs",
      aliases: ["openai"],
    });
    expect(model).toMatchObject({
      id: "openai.responses/gpt-5",
      canonical_id: "openai.responses/gpt-5",
      name: "openai.responses/gpt-5",
      extras: {
        mode: "responses",
        sourceCost: expect.objectContaining({
          input_over_200k: { input: 2 },
        }),
      },
    });
    expect(model?.cost).toBeUndefined();
  });

  it("handles empty models.dev keys and no-match model filters", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        custom: {
          models: {
            "": {},
            "custom/free": {
              id: "custom/free",
              cost: {
                input: -1,
              },
            },
            "custom/other": {
              id: "custom/other",
              name: "Other",
            },
          },
        },
        emptyProvider: {},
      }),
    } as Response);

    const catalog = await fetchModelsDev({});

    expect(catalog.custom?.models.custom).toMatchObject({
      id: "custom",
      canonical_id: "custom/custom",
      name: "custom",
    });
    expect(catalog.custom?.models["custom/free"]?.cost).toBeUndefined();
    expect(catalog.emptyProvider?.models).toEqual({});
    await expect(fetchModelsDev({ model: "missing" })).resolves.toEqual({});
  });

  it("rejects non-object models.dev payloads", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    } as Response);

    await expect(fetchModelsDev({})).rejects.toMatchObject({
      code: "FETCH_FAILED",
      meta: { reason: "INVALID_JSON_SHAPE", target: "models.dev" },
    });
  });

  it("throws a fetch error for non-OK models.dev responses", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
    } as Response);

    await expect(fetchModelsDev({})).rejects.toMatchObject({
      code: "FETCH_FAILED",
      message: "Failed to fetch models.dev: 502 Bad Gateway",
      meta: { target: "models.dev", status: 502, statusText: "Bad Gateway" },
    });
  });
});

describe("fetchOpenrouter DTO mapping", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("splits provider namespace and maps DTO fields", async () => {
    const raw = {
      data: [
        {
          id: "test-provider/test-model",
          name: "Test Model",
          created: 1704067200,
          architecture: {
            input_modalities: ["text"],
            output_modalities: ["text"],
            tokenizer: "test-tokenizer",
          },
          pricing: {
            input: "0.0000015",
            output: "0.0000025",
            reasoning: "0.0000045",
            cache_read: "0.0000005",
            cache_write: "0.000001",
          },
          context_length: 8192,
          top_provider: {
            max_completion_tokens: 1024,
            context_length: 16384,
            is_moderated: true,
          },
          open_weights: true,
          release_date: "2024-01-01",
          last_updated: "2024-06-01",
        },
      ],
    } satisfies JsonShape;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => raw,
    } as Response);

    const catalog = await fetchOpenrouter({});

    expect(Object.keys(catalog)).toEqual(["test-provider"]);
    const provider = catalog["test-provider"];
    expect(provider?.source).toBe("openrouter");
    expect(provider?.env).toContain("OPENROUTER_API_KEY");
    expect(provider?.schemaVersion).toBe(1);

    const model = provider?.models["test-provider/test-model"];
    expect(model).toMatchObject({
      id: "test-provider/test-model",
      canonical_id: "test-provider/test-model",
      name: "Test Model",
      created: 1704067200,
      release_date: "2024-01-01",
      last_updated: "2024-06-01",
      cost: expect.objectContaining({
        input: expect.any(Number),
        output: expect.any(Number),
        reasoning: expect.any(Number),
        cache_read: expect.any(Number),
        cache_write: expect.any(Number),
      }),
      limit: {
        context: 8192,
        output: 1024,
      },
    });

    // Ensure costs converted per 1M from per-token
    const c = model?.cost as { input?: number; output?: number } | undefined;
    expect(c?.input).toBeCloseTo(1.5);
    expect(c?.output).toBeCloseTo(2.5);
  });

  it("filters by provider and model substring", async () => {
    const raw = {
      data: [
        { id: "foo/a", name: "A" },
        { id: "foo/b", name: "B" },
        { id: "bar/c", name: "C" },
      ],
    } satisfies JsonShape;

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => raw,
    } as Response);

    const providerFiltered = await fetchOpenrouter({
      provider: "foo",
    });

    expect(Object.keys(providerFiltered)).toEqual(["foo"]);

    const modelFiltered = await fetchOpenrouter({
      provider: "foo",
      model: "b",
    });

    expect(Object.keys(modelFiltered)).toEqual(["foo"]);
    const fooProvider = modelFiltered.foo;
    expect(Object.keys(fooProvider?.models ?? {})).toEqual(["foo/b"]);
  });

  it("maps OpenRouter internal reasoning pricing aliases", async () => {
    const raw = {
      data: [
        {
          id: "google/gemini-3-pro-image",
          name: "Gemini 3 Pro Image",
          pricing: {
            input: "0.000002",
            output: "0.000012",
            internal_reasoning: "0.000012",
          },
        },
      ],
    } satisfies JsonShape;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => raw,
    } as Response);

    const catalog = await fetchOpenrouter({});
    const model = catalog.google?.models["google/gemini-3-pro-image"];

    expect(model?.cost).toMatchObject({
      input: 2,
      output: 12,
      reasoning: 12,
    });
  });

  it("omits OpenRouter unknown-price sentinels from scalar costs", async () => {
    const raw = {
      data: [
        {
          id: "openrouter/auto",
          name: "OpenRouter Auto",
          pricing: {
            prompt: "-1",
            completion: "-1",
          },
        },
      ],
    } satisfies JsonShape;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => raw,
    } as Response);

    const catalog = await fetchOpenrouter({});
    const model = catalog.openrouter?.models["openrouter/auto"];

    expect(model?.cost).toBeUndefined();
  });

  it("omits OpenRouter unknown-limit sentinels from scalar limits", async () => {
    const raw = {
      data: [
        {
          id: "google/gemma-4-26b-a4b-it",
          name: "Gemma",
          context_length: 131_072,
          top_provider: {
            context_length: 65_536,
            max_completion_tokens: -1,
          },
        },
      ],
    } satisfies JsonShape;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => raw,
    } as Response);

    const catalog = await fetchOpenrouter({});
    const model = catalog.google?.models["google/gemma-4-26b-a4b-it"];

    expect(model?.limit).toEqual({
      context: 131_072,
    });
  });

  it("omits suspicious OpenRouter per-token prices from scalar costs", async () => {
    const raw = {
      data: [
        {
          id: "test-provider/test-model",
          name: "Test Model",
          pricing: {
            input: "1",
            output: "2",
            reasoning: "4",
            cache_read: "1",
            cache_write: "3",
          },
        },
      ],
    } satisfies JsonShape;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => raw,
    } as Response);

    const catalog = await fetchOpenrouter({});
    const model = catalog["test-provider"]?.models["test-provider/test-model"];

    expect(model?.cost).toBeUndefined();
  });

  it("rejects successful OpenRouter responses without a data array", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: {} }),
    } as Response);

    await expect(fetchOpenrouter({})).rejects.toMatchObject({
      code: "FETCH_FAILED",
      meta: {
        field: "data",
        reason: "INVALID_JSON_SHAPE",
      },
    });
  });

  it("handles OpenRouter providerless IDs, explicit limits, empty IDs, and fetch failures", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { id: "", name: "Skipped" },
          {
            id: "auto-model",
            name: "Auto Model",
            cost: {
              prompt: "0.000001",
              completion: "0.000002",
            },
            limit: {
              context: 123,
              input: 100,
              output: 23,
            },
          },
        ],
      }),
    } as Response);

    const catalog = await fetchOpenrouter({});

    expect(Object.keys(catalog)).toEqual(["openrouter"]);
    expect(catalog.openrouter?.models["auto-model"]).toMatchObject({
      id: "auto-model",
      canonical_id: "auto-model",
      name: "Auto Model",
      cost: { input: 1, output: 2 },
      limit: { context: 123, input: 100, output: 23 },
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    } as Response);

    await expect(fetchOpenrouter({})).rejects.toMatchObject({
      code: "FETCH_FAILED",
      message: "Failed to fetch OpenRouter: 401 Unauthorized",
    });
  });

  it("maps xAI OpenRouter aliases and rejects non-object OpenRouter payloads", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { id: "xai/grok-4", name: "Grok 4" },
          {
            id: "x-ai/grok-5",
            top_provider: {
              max_completion_tokens: 8192,
            },
            pricing: {
              cache_read: "0.0000001",
            },
          },
        ],
      }),
    } as Response);

    const catalog = await fetchOpenrouter({});

    expect(catalog.xai?.aliases).toEqual(["x-ai", "xai.chat"]);
    expect(catalog["x-ai"]?.aliases).toEqual(["xai", "xai.chat"]);
    expect(catalog["x-ai"]?.models["x-ai/grok-5"]).toMatchObject({
      id: "x-ai/grok-5",
      name: "x-ai/grok-5",
      limit: {
        output: 8192,
      },
    });
    expect(
      catalog["x-ai"]?.models["x-ai/grok-5"]?.cost?.cache_read,
    ).toBeCloseTo(0.1);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    await expect(fetchOpenrouter({})).rejects.toMatchObject({
      code: "FETCH_FAILED",
      meta: { reason: "INVALID_JSON_SHAPE", target: "OpenRouter" },
    });
  });
});

describe("fetchVercel DTO mapping", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("maps Gateway models into provider catalogs", async () => {
    const raw = {
      data: [
        {
          id: "anthropic/claude-sonnet-4",
          name: "Claude Sonnet 4",
          owned_by: "anthropic",
          created: 1755815280,
          context_window: 200000,
          max_tokens: 64000,
          pricing: {
            input: "0.000003",
            output: "0.000015",
            input_cache_read: "0.0000003",
            input_cache_write: "0.00000375",
          },
        },
        {
          id: "standalone-model",
          name: "Standalone",
          max_tokens: 4096,
        },
      ],
    } satisfies JsonShape;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => raw,
    } as Response);

    const catalog = await fetchVercel({});

    expect(Object.keys(catalog)).toEqual(["anthropic", "vercel"]);
    const provider = catalog.anthropic;
    expect(provider?.source).toBe("vercel");
    expect(provider?.api).toBe("https://ai-gateway.vercel.sh/v1");
    expect(provider?.env).toEqual(["VERCEL_AI_API_KEY"]);

    const model = provider?.models["anthropic/claude-sonnet-4"];
    expect(model).toMatchObject({
      id: "anthropic/claude-sonnet-4",
      canonical_id: "anthropic/claude-sonnet-4",
      name: "Claude Sonnet 4",
      created: 1755815280,
      limit: {
        context: 200000,
        output: 64000,
      },
      cost: {
        input: 3,
        output: 15,
        cache_read: 0.3,
        cache_write: 3.75,
      },
    });
    expect(catalog.vercel?.models["standalone-model"]).toMatchObject({
      id: "standalone-model",
      canonical_id: "standalone-model",
      name: "Standalone",
      limit: {
        output: 4096,
      },
    });
  });

  it("can enrich filtered Gateway models from endpoint details", async () => {
    const raw = {
      data: [
        {
          id: "anthropic/claude-sonnet-4",
          name: "Claude Sonnet 4",
          owned_by: "anthropic",
          context_window: 200000,
          max_tokens: 8192,
          pricing: {
            input: "0.000004",
            output: "0.00002",
          },
        },
        {
          id: "openai/gpt-4o-mini",
          name: "GPT-4o Mini",
          owned_by: "openai",
          context_window: 128000,
          max_tokens: 16384,
          pricing: {
            input: "0.00000015",
            output: "0.0000006",
          },
        },
      ],
    } satisfies JsonShape;
    const endpointRaw = {
      data: {
        endpoints: [
          {
            provider_name: "bedrock",
            context_length: 1000000,
            max_completion_tokens: 8192,
            pricing: {
              prompt: "0.000003",
              completion: "0.000015",
            },
          },
          {
            provider_name: "anthropic",
            context_length: 1000000,
            max_completion_tokens: 64000,
            pricing: {
              prompt: "0.000003",
              completion: "0.000015",
              input_cache_read: "0.0000003",
              input_cache_write: "0.00000375",
            },
          },
        ],
      },
    } satisfies JsonShape;

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => raw,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => endpointRaw,
      } as Response);

    const catalog = await fetchVercel({
      provider: "anthropic",
      model: "claude-sonnet-4",
      includeEndpointDetails: true,
      fetch: mockFetch as unknown as typeof fetch,
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenLastCalledWith(
      "https://ai-gateway.vercel.sh/v1/models/anthropic/claude-sonnet-4/endpoints",
    );

    expect(Object.keys(catalog)).toEqual(["anthropic"]);
    const model = catalog.anthropic?.models["anthropic/claude-sonnet-4"];
    expect(model?.limit).toEqual({
      context: 1000000,
      output: 64000,
    });
    expect(model?.cost).toEqual({
      input: 3,
      output: 15,
      cache_read: 0.3,
      cache_write: 3.75,
    });
  });

  it("keeps the base Vercel catalog when endpoint enrichment fails", async () => {
    const raw = {
      data: [
        {
          id: "openai/gpt-4o-mini",
          name: "GPT-4o Mini",
          owned_by: "openai",
          context_window: 128000,
          max_tokens: 16384,
          pricing: {
            input: "0.00000015",
            output: "0.0000006",
          },
        },
      ],
    } satisfies JsonShape;

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => raw,
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
      } as Response);

    const catalog = await fetchVercel({
      includeEndpointDetails: true,
      fetch: mockFetch as unknown as typeof fetch,
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(catalog.openai?.models["openai/gpt-4o-mini"]).toMatchObject({
      id: "openai/gpt-4o-mini",
      limit: {
        context: 128000,
        output: 16384,
      },
      cost: {
        input: 0.15,
        output: 0.6,
      },
    });
  });

  it("uses fallback provider IDs and endpoint defaults when provider ownership is absent", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "xai/grok-4",
              name: "Grok 4",
              context_window: "128000",
              max_tokens: "8192",
              pricing: {
                prompt: "0.000003",
                completion: "0.000015",
              },
            },
          ],
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            endpoints: [
              {
                provider_name: "fallback-provider",
                context_length: "256000",
                max_prompt_tokens: "200000",
                max_completion_tokens: "16000",
              },
            ],
          },
        }),
      } as Response);

    const catalog = await fetchVercel({
      includeEndpointDetails: true,
      fetch: mockFetch as unknown as typeof fetch,
    });

    expect(catalog.xai?.models["xai/grok-4"]).toMatchObject({
      limit: {
        context: 256000,
        input: 200000,
        output: 16000,
      },
      cost: {
        input: 3,
        output: 15,
      },
    });
  });

  it("skips empty Vercel model IDs and enriches through global fetch", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              name: "Skipped",
            },
            {
              id: "openai/gpt-5",
              name: "GPT-5",
              owned_by: "openai",
              context_window: 128000,
              max_tokens: 8192,
            },
          ],
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            endpoints: [
              {
                provider_name: "other",
                context_length: 256000,
                max_completion_tokens: 16000,
              },
            ],
          },
        }),
      } as Response);

    const catalog = await fetchVercel({ includeEndpointDetails: true });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(catalog.openai?.models).toEqual({
      "openai/gpt-5": expect.objectContaining({
        id: "openai/gpt-5",
        limit: {
          context: 256000,
          output: 16000,
        },
      }),
    });
  });

  it("selects matching endpoint tags and handles malformed endpoint payloads", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          endpoints: [
            { provider_name: "other", context_length: 1000 },
            { tag: "bedrock", context_length: 2000 },
          ],
        },
      }),
    } as Response);

    await expect(
      fetchVercelModelEndpoints("anthropic/claude 4", {
        fetch: mockFetch as unknown as typeof fetch,
      }),
    ).resolves.toEqual({
      endpoints: [
        { provider_name: "other", context_length: 1000 },
        { tag: "bedrock", context_length: 2000 },
      ],
    });
    expect(mockFetch).toHaveBeenLastCalledWith(
      "https://ai-gateway.vercel.sh/v1/models/anthropic/claude%204/endpoints",
    );

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    await expect(
      fetchVercelModelEndpoints("openai/gpt-5", {
        fetch: mockFetch as unknown as typeof fetch,
      }),
    ).resolves.toEqual({});

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { endpoints: [] } }),
    } as Response);

    await expect(fetchVercelModelEndpoints("openai/gpt-5")).resolves.toEqual({
      endpoints: [],
    });
  });

  it("throws a fetch error for non-OK Vercel Gateway responses", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    await expect(fetchVercel({})).rejects.toMatchObject({
      code: "FETCH_FAILED",
      message: "Failed to fetch Vercel AI Gateway: 500 Internal Server Error",
    });
  });

  it("rejects successful Vercel Gateway responses without a data array", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: {} }),
    } as Response);

    await expect(fetchVercel({})).rejects.toMatchObject({
      code: "FETCH_FAILED",
      meta: {
        field: "data",
        reason: "INVALID_JSON_SHAPE",
      },
    });
  });
});
