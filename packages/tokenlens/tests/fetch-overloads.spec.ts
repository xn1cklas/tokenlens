import { describe, it, expect } from "vitest";
import type { FetchLike } from "../src/index.js";
import { fetchModels } from "../src/index.js";

const mockCatalog = {
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    models: {
      "deepseek-chat": { id: "deepseek-chat", name: "DeepSeek Chat" },
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

describe("tokenlens fetchModels overloads", () => {
  it("accepts provider as string", async () => {
    const res = await withMockedFetch(okFetch(), async () =>
      fetchModels("deepseek"),
    );
    expect(res).toEqual(mockCatalog.deepseek as unknown);
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
