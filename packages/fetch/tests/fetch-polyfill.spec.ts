import { describe, expect, it, vi } from "vitest";

describe("fetch polyfill resolution", () => {
  it("allows installing fetch after module import", async () => {
    const originalFetch = globalThis.fetch;
    vi.resetModules();
    (globalThis as { fetch: typeof globalThis.fetch | undefined }).fetch =
      undefined;

    const { fetchModelsDev } = await import("../src/index.ts");

    const fakeJson = {
      demo: {
        id: "demo",
        name: "Demo Provider",
        models: {
          "demo/model": {
            id: "demo/model",
            name: "Demo Model",
          },
        },
      },
    };

    const fakeFetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => fakeJson,
    });
    const fakeFetch = fakeFetchMock as unknown as typeof globalThis.fetch;

    (globalThis as { fetch: typeof globalThis.fetch | undefined }).fetch =
      fakeFetch;

    try {
      const providers = await fetchModelsDev();
      expect(fakeFetchMock).toHaveBeenCalledTimes(1);
      expect(providers.demo?.models?.["demo/model"]?.id).toBe("demo/model");
    } finally {
      (globalThis as { fetch: typeof globalThis.fetch | undefined }).fetch =
        originalFetch;
      vi.resetModules();
    }
  });
});
