import { describe, expect, it } from "vitest";
import type { FetchLike, ModelsDevApi } from "../src/index.ts";
import { fetchModels } from "../src/index.ts";

const mockCatalog = {
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    api: "https://api.deepseek.com",
    doc: "https://platform.deepseek.com/api-docs/pricing",
    models: {
      "deepseek-chat": {
        id: "deepseek-chat",
        name: "DeepSeek Chat",
        cost: { input: 1, output: 2 },
        limit: { context: 128000 },
      },
    },
  },
} as const;

function okFetch(): FetchLike {
  return async () => ({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => mockCatalog as unknown,
    text: async () => JSON.stringify(mockCatalog),
  });
}

function httpErrorFetch(): FetchLike {
  return async () => ({
    ok: false,
    status: 500,
    statusText: "Internal Server Error",
    json: async () => ({}) as unknown,
    text: async () => "boom",
  });
}

function parseErrorFetch(): FetchLike {
  return async () => ({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => {
      throw new Error("invalid json");
    },
    text: async () => "invalid",
  });
}

function networkErrorFetch(): FetchLike {
  return async () => {
    throw new Error("boom");
  };
}

describe("fetchModels (@tokenlens/fetch)", () => {
  it("returns the full catalog with no filters", async () => {
    const res = await withMockedFetch(okFetch(), async () => fetchModels());
    expect(res).toEqual(mockCatalog as unknown);
  });

  it("filters by provider", async () => {
    const res = await withMockedFetch(okFetch(), async () =>
      fetchModels({ provider: "deepseek" }),
    );
    const expected = (mockCatalog as unknown as ModelsDevApi).deepseek;
    expect(res).toEqual(expected);
  });

  it("filters by provider and model", async () => {
    const res = await withMockedFetch(okFetch(), async () =>
      fetchModels({ provider: "deepseek", model: "deepseek-chat" }),
    );
    const expectedProv = (mockCatalog as unknown as ModelsDevApi).deepseek;
    const expected = expectedProv.models["deepseek-chat"];
    expect(res).toEqual(expected);
  });

  it("searches by model across providers", async () => {
    const res = await withMockedFetch(okFetch(), async () =>
      fetchModels({ model: "deepseek-chat" }),
    );
    expect(Array.isArray(res)).toBe(true);
    const arr = res as Array<{ provider: string; model: unknown }>;
    expect(arr.length).toBe(1);
    expect(arr[0]?.provider).toBe("deepseek");
  });

  it("propagates HTTP errors with details", async () => {
    await expect(
      withMockedFetch(httpErrorFetch(), async () => fetchModels()),
    ).rejects.toMatchObject({ code: "HTTP", status: 500 });
  });

  it("propagates parse errors", async () => {
    await expect(
      withMockedFetch(parseErrorFetch(), async () => fetchModels()),
    ).rejects.toMatchObject({ code: "PARSE" });
  });

  it("propagates network errors", async () => {
    await expect(
      withMockedFetch(networkErrorFetch(), async () => fetchModels()),
    ).rejects.toMatchObject({ code: "NETWORK" });
  });
});

async function withMockedFetch<T>(
  mock: FetchLike,
  run: () => Promise<T>,
): Promise<T> {
  const original = (globalThis as { fetch?: FetchLike }).fetch;
  (globalThis as { fetch?: FetchLike }).fetch = mock;
  try {
    return await run();
  } finally {
    (globalThis as { fetch?: FetchLike }).fetch = original;
  }
}
