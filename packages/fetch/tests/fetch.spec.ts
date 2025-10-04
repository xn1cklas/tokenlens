import { describe, expect, it } from "vitest";

import { fetchModelsDev, fetchOpenrouter } from "../src/index.ts";

describe("live fetchers", () => {
  it("fetchOpenrouter returns catalog with providers and models", async () => {
    const providers = await fetchOpenrouter();

    const providerIds = Object.keys(providers);
    expect(providerIds.length).toBeGreaterThan(0);

    const providerId = providerIds[0]!;
    const provider = providers[providerId];
    expect(providerId).toBeTruthy();
    expect(provider.id).toBe(providerId);
    expect(provider.source).toBe("openrouter");
    expect(provider.env).toContain("OPENROUTER_API_KEY");

    const modelIds = Object.keys(provider.models);
    expect(modelIds.length).toBeGreaterThan(0);

    const modelId = modelIds[0]!;
    const model = provider.models[modelId];
    expect(modelId).toBeTruthy();
    expect(model.id).toBe(modelId);
    expect(typeof model.name).toBe("string");
  }, 30000);

  it("fetchModelsDev returns providers and models", async () => {
    const providers = await fetchModelsDev();

    const providerIds = Object.keys(providers);
    expect(providerIds.length).toBeGreaterThan(0);

    const providerId = providerIds[0]!;
    const provider = providers[providerId];
    expect(providerId).toBeTruthy();
    expect(provider.id).toBe(providerId);
    expect(provider.source).toBe("models.dev");

    const modelIds = Object.keys(provider.models);
    expect(modelIds.length).toBeGreaterThan(0);

    const modelId = modelIds[0]!;
    const model = provider.models[modelId];
    expect(modelId).toBeTruthy();
    expect(model.id).toBe(modelId);
    expect(typeof model.name).toBe("string");
  }, 30000);
});
