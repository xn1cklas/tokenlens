import { writeFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { fetchModelsDev, fetchOpenrouter, fetchVercel } from "../src/index.ts";

describe("live fetchers", () => {
  it("fetchOpenrouter returns catalog with providers and models", async () => {
    const providers = await fetchOpenrouter();

    const providerIds = Object.keys(providers);
    expect(providerIds.length).toBeGreaterThan(0);

    const providerId = providerIds[0] as string;
    const provider = providers[providerId];
    expect(providerId).toBeTruthy();
    expect(provider.id).toBe(providerId);
    expect(provider.source).toBe("openrouter");
    expect(provider.env).toContain("OPENROUTER_API_KEY");

    const modelIds = Object.keys(provider.models);
    expect(modelIds.length).toBeGreaterThan(0);

    const modelId = modelIds[0] as string;
    const model = provider.models[modelId];
    expect(modelId).toBeTruthy();
    expect(model.id).toBe(modelId);
    expect(typeof model.name).toBe("string");
  }, 30000);

  it("fetchModelsDev returns providers and models", async () => {
    const providers = await fetchModelsDev();

    const providerIds = Object.keys(providers);
    expect(providerIds.length).toBeGreaterThan(0);

    const providerId = providerIds[0] as string;
    const provider = providers[providerId];
    expect(providerId).toBeTruthy();
    expect(provider.id).toBe(providerId);
    expect(provider.source).toBe("models.dev");

    const modelIds = Object.keys(provider.models);
    expect(modelIds.length).toBeGreaterThan(0);

    const modelId = modelIds[0] as string;
    const model = provider.models[modelId];
    expect(modelId).toBeTruthy();
    expect(model.id).toBe(modelId);
    expect(typeof model.name).toBe("string");
  }, 30000);

  it("fetchVercel returns catalog with providers and models", async () => {
    const providers = await fetchVercel();

    const providerIds = Object.keys(providers);
    expect(providerIds.length).toBeGreaterThan(0);

    const providerId = providerIds[0] as string;
    const provider = providers[providerId];
    expect(providerId).toBeTruthy();
    expect(provider.id).toBe(providerId);
    expect(provider.source).toBe("vercel");
    expect(provider.env).toContain("VERCEL_AI_API_KEY");

    const modelIds = Object.keys(provider.models);
    expect(modelIds.length).toBeGreaterThan(0);

    const modelId = modelIds[0] as string;
    const model = provider.models[modelId];
    expect(modelId).toBeTruthy();
    expect(model.id).toBe(modelId);
    expect(typeof model.name).toBe("string");
  }, 30000);

  it.skip("live parity snapshot and overlap checks", async () => {
    const [openrouter, modelsdev] = await Promise.all([
      fetchOpenrouter(),
      fetchModelsDev(),
    ]);

    // Dump snapshots to project temp dir for manual inspection
    await writeFile(
      new URL("./out-openrouter.json", import.meta.url),
      JSON.stringify(openrouter, null, 2),
      "utf8",
    );
    await writeFile(
      new URL("./out-modelsdev.json", import.meta.url),
      JSON.stringify(modelsdev, null, 2),
      "utf8",
    );

    // Compute overlap by canonical id
    const orIds = new Set(
      Object.values(openrouter).flatMap((p) => Object.keys(p.models)),
    );
    const mdIds = new Set(
      Object.values(modelsdev).flatMap((p) => Object.keys(p.models)),
    );
    const overlap = [...orIds].filter((id) => mdIds.has(id));

    // We expect at least some overlap; skip if dynamic data fails
    expect(overlap.length).toBeGreaterThan(0);

    // Spot-check a few overlapping ids for presence and typed fields
    function findModel(
      catalog: Record<string, { models: Record<string, unknown> }>,
      id: string,
    ) {
      for (const prov of Object.keys(catalog)) {
        const model = catalog[prov]?.models[id];
        if (model)
          return model as {
            id?: string;
            name?: string;
            cost?: { input?: number };
            limit?: { context?: number };
          };
      }
      return undefined;
    }

    for (const id of overlap.slice(0, 5)) {
      const orModel = findModel(openrouter, id);
      const mdModel = findModel(modelsdev, id);
      expect(orModel?.id).toBe(id);
      expect(mdModel?.id).toBe(id);
      expect(typeof orModel?.name).toBe("string");
      expect(typeof mdModel?.name).toBe("string");
      // Costs may differ; just assert numeric if present
      if (orModel?.cost?.input !== undefined) {
        expect(typeof orModel.cost.input).toBe("number");
      }
      if (mdModel?.cost?.input !== undefined) {
        expect(typeof mdModel.cost.input).toBe("number");
      }
      // Context limit presence check
      if (orModel?.limit?.context !== undefined) {
        expect(typeof orModel.limit.context).toBe("number");
      }
      if (mdModel?.limit?.context !== undefined) {
        expect(typeof mdModel.limit.context).toBe("number");
      }
    }
  }, 60000);
});
