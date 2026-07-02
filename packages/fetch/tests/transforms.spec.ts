import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchModelsDev, fetchOpenrouter, fetchVercel } from "../src/index.ts";

type JsonShape = Record<string, unknown> | Array<unknown> | null;

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

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
      ],
    } satisfies JsonShape;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => raw,
    } as Response);

    const catalog = await fetchVercel({});

    expect(Object.keys(catalog)).toEqual(["anthropic"]);
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
