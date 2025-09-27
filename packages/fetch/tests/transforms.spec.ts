import { describe, expect, it } from "vitest";

import type { FetchLike } from "../src/index.ts";
import { fetchModelsDev, fetchOpenrouter } from "../src/index.ts";

type JsonShape = Record<string, unknown> | Array<unknown> | null;

function createFetchMock(json: JsonShape): FetchLike {
  return async () => ({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => json,
    text: async () => JSON.stringify(json),
  });
}

describe("fetchModelsDev DTO normalization", () => {
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
            name: "Foo Bar",
            description: "Test model",
          },
        },
      },
    } satisfies JsonShape;

    const catalog = await fetchModelsDev({ fetch: createFetchMock(raw) });

    expect(Object.keys(catalog)).toEqual(["foo"]);
    const provider = catalog.foo;
    expect(provider?.id).toBe("foo");
    expect(provider?.source).toBe("models.dev");
    expect(provider?.schemaVersion).toBe(1);
    expect(provider?.env).toEqual(["FOO_API_KEY"]);
    expect(Object.keys(provider?.models ?? {})).toEqual(["foo/bar"]);
    expect(provider?.models["foo/bar"]).toMatchObject({
      id: "foo/bar",
      name: "Foo Bar",
      description: "Test model",
    });
  });

  it("filters by provider and model substring", async () => {
    const raw = {
      foo: {
        models: {
          "foo/alpha": { id: "foo/alpha" },
          "foo/beta": { id: "foo/beta" },
        },
      },
      bar: {
        models: {
          "bar/gamma": { id: "bar/gamma" },
        },
      },
    } satisfies JsonShape;

    const providerFiltered = await fetchModelsDev({
      provider: "foo",
      fetch: createFetchMock(raw),
    });

    expect(Object.keys(providerFiltered)).toEqual(["foo"]);

    const modelFiltered = await fetchModelsDev({
      provider: "foo",
      model: "beta",
      fetch: createFetchMock(raw),
    });

    expect(Object.keys(modelFiltered)).toEqual(["foo"]);
    const fooProvider = modelFiltered.foo;
    expect(Object.keys(fooProvider?.models ?? {})).toEqual(["foo/beta"]);
  });
});

describe("fetchOpenrouter DTO mapping", () => {
  it("splits provider namespace and maps advanced fields", async () => {
    const raw = {
      data: [
        {
          id: "test-provider/test-model",
          name: "Test Model",
          description: "A model for testing",
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
          },
          limit: {
            context: 8192,
            input: 4096,
            output: 2048,
          },
          top_provider: {
            max_completion_tokens: 1024,
            context_length: 16384,
            is_moderated: true,
          },
          attachment: true,
          reasoning: true,
          tool_call: true,
          knowledge: "2024-06",
          release_date: "2024-01-01",
          last_updated: "2024-06-01",
        },
      ],
    } satisfies JsonShape;

    const catalog = await fetchOpenrouter({ fetch: createFetchMock(raw) });

    expect(Object.keys(catalog)).toEqual(["test-provider"]);
    const provider = catalog["test-provider"];
    expect(provider?.source).toBe("openrouter");
    expect(provider?.env).toContain("OPENROUTER_API_KEY");

    const model = provider?.models["test-provider/test-model"];
    expect(model).toMatchObject({
      id: "test-provider/test-model",
      name: "Test Model",
      description: "A model for testing",
      knowledge: "2024-06",
      reasoning: true,
      attachment: true,
      tool_call: true,
      cost: {
        input: 1.5,
        output: 2.5,
        reasoning: 4.5,
        cache_read: 0.5,
      },
      limit: {
        context: 8192,
        input: 4096,
        output: 2048,
      },
    });

    expect(model?.extras).toMatchObject({
      architecture: {
        input_modalities: ["text"],
        output_modalities: ["text"],
        tokenizer: "test-tokenizer",
      },
      top_provider: {
        max_completion_tokens: 1024,
        context_length: 16384,
        is_moderated: true,
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

    const providerFiltered = await fetchOpenrouter({
      provider: "foo",
      fetch: createFetchMock(raw),
    });

    expect(Object.keys(providerFiltered)).toEqual(["foo"]);

    const modelFiltered = await fetchOpenrouter({
      provider: "foo",
      model: "b",
      fetch: createFetchMock(raw),
    });

    expect(Object.keys(modelFiltered)).toEqual(["foo"]);
    const fooProvider = modelFiltered.foo;
    expect(Object.keys(fooProvider?.models ?? {})).toEqual(["foo/b"]);
  });
});
