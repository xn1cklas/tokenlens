import { describe, it, expect } from "vitest";

import {
  MODEL_IDS,
  models,
  aliases,
  resolveModel,
  getModelRaw,
  isModelId,
  assertModelId,
  listModels,
} from "../dist/registry.js";

describe("registry basics", () => {
  it("MODEL_IDS is non-empty and unique", () => {
    expect(Array.isArray(MODEL_IDS)).toBe(true);
    expect(MODEL_IDS.length).toBeGreaterThan(0);
    const set = new Set(MODEL_IDS);
    expect(set.size).toBe(MODEL_IDS.length);
  });

  it("models map contains all MODEL_IDS", () => {
    for (const id of MODEL_IDS) {
      expect(models[id]).toBeTruthy();
    }
  });
});

describe("resolution and aliases", () => {
  it("resolveModel matches canonical ids and providerless aliases", () => {
    const knownCanonicals = [
      "openai:gpt-4o",
      "anthropic:claude-3-5-sonnet-20240620",
      "alibaba:qwen3-coder-plus",
    ].filter((id) => (models as Record<string, unknown>)[id]);

    expect(knownCanonicals.length).toBeGreaterThan(0);

    for (const id of knownCanonicals) {
      const m1 = resolveModel(id);
      expect(m1?.id).toBe(id);

      const idx = id.indexOf(":");
      if (idx > 0) {
        const short = id.slice(idx + 1);
        const m2 = resolveModel(short);
        // Alias should resolve to some canonical model id (may differ if multiple map to same alias)
        expect(typeof m2?.id).toBe("string");
      }
    }
  });

  it("vendorId or family-like aliases resolve (e.g., qwen3-coder-plus)", () => {
    const canonical = "alibaba:qwen3-coder-plus";
    if ((models as Record<string, unknown>)[canonical]) {
      for (const alias of ["qwen3-coder-plus"]) {
        const m = resolveModel(alias);
        expect(m?.id).toBe(canonical);
      }
    }
  });
});

describe("raw accessors and type guards", () => {
  it("getModelRaw only returns canonical ids, not aliases", () => {
    const canonical = MODEL_IDS.find(
      (id) => (models as Record<string, unknown>)[id],
    );
    expect(typeof canonical).toBe("string");
    const idx = (canonical as string).indexOf(":");
    const short =
      idx > 0 ? (canonical as string).slice(idx + 1) : (canonical as string);

    expect(getModelRaw(canonical as string)).toBeTruthy();
    if (short !== canonical) {
      expect(getModelRaw(short)).toBeUndefined();
    }
  });

  it("isModelId and assertModelId behavior", () => {
    const canonical = MODEL_IDS[0];
    const idx = canonical.indexOf(":");
    const short = idx > 0 ? canonical.slice(idx + 1) : canonical;

    expect(isModelId(canonical)).toBe(true);
    if (short !== canonical) expect(isModelId(short)).toBe(false);
    expect(() => assertModelId(canonical)).not.toThrow();
    expect(() => assertModelId("definitely-not-a-model")).toThrow(
      /Unknown model id/,
    );
  });
});

describe("listModels filtering", () => {
  it("filters by provider and status", () => {
    const any = MODEL_IDS[0];
    const provider = any.split(":")[0];
    const providerList = listModels({ provider });
    expect(providerList.length).toBeGreaterThan(0);
    for (const m of providerList) expect(m.provider).toBe(provider);

    const hasStable = providerList.some((m) => m.status === "stable");
    if (hasStable) {
      const stable = listModels({ provider, status: "stable" });
      expect(stable.length).toBeGreaterThan(0);
      for (const m of stable) expect(m.status).toBe("stable");
    }
  });
});
