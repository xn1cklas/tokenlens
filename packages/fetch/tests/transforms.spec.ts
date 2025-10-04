import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchModelsDev, fetchOpenrouter } from "../src/index.ts";

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
            input: 1.5,
            output: 2.5,
            reasoning: 4.5,
            cache_read: 0.5,
            cache_write: 1.0,
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
      modalities: {
        input: ["text"],
        output: ["text"],
      },
      open_weights: true,
      cost: {
        input: 1.5,
        output: 2.5,
        reasoning: 4.5,
        cache_read: 0.5,
        cache_write: 1.0,
      },
      limit: {
        context: 8192,
        output: 1024,
      },
    });
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
});
