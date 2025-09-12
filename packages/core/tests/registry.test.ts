import { describe, expect, it } from "vitest";
import { createRegistry } from "../src/registry.js";
import type { Model } from "../src/types.js";

const FIXTURE: Model[] = [
  {
    id: "openai:gpt-4o",
    provider: "openai",
    status: "stable",
    context: { combinedMax: 128000 },
    pricing: { inputPerMTokens: 1, outputPerMTokens: 2 },
    aliases: ["gpt-4o"],
    source: "test",
  },
  {
    id: "anthropic:claude-3-5-sonnet-20240620",
    provider: "anthropic",
    status: "stable",
    context: { combinedMax: 200000 },
    aliases: ["claude-3-5-sonnet-20240620"],
    source: "test",
  },
  {
    id: "alibaba:qwen3-coder-plus",
    provider: "alibaba",
    status: "stable",
    context: { combinedMax: 1048576 },
    aliases: ["qwen3-coder-plus"],
    source: "test",
  },
];

const reg = createRegistry(FIXTURE);
const {
  MODEL_IDS,
  models,
  resolveModel,
  resolveModels,
  getModelRaw,
  isModelId,
  assertModelId,
  listModels,
} = reg;

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
        expect(typeof m2?.id).toBe("string");
      }
    }
  });

  it("resolveModels returns multiple matches for shared aliases across providers", () => {
    const localReg = createRegistry([
      {
        id: "anthropic:claude-3-5-sonnet-20240620",
        provider: "anthropic",
        status: "stable",
        context: { combinedMax: 200000 },
        aliases: ["claude-3-5-sonnet-20240620", "claude-3-5-sonnet"],
        source: "test",
      },
      {
        id: "openrouter:anthropic/claude-3-5-sonnet-20240620",
        provider: "openrouter",
        status: "stable",
        context: { combinedMax: 200000 },
        aliases: ["anthropic/claude-3-5-sonnet-20240620", "claude-3-5-sonnet"],
        source: "test",
      },
    ] satisfies Model[]);

    const { resolveModels: rm } = localReg;

    const matches1 = rm("claude-3-5-sonnet");
    expect(matches1.length).toBe(2);
    expect(matches1.map((m) => m.id).sort()).toEqual(
      [
        "anthropic:claude-3-5-sonnet-20240620",
        "openrouter:anthropic/claude-3-5-sonnet-20240620",
      ].sort(),
    );

    const matches2 = rm("anthropic/claude-3.5-sonnet-20240620");
    // Input should normalize via toModelId and return the Anthropic canonical
    expect(matches2.map((m) => m.id)).toContain(
      "anthropic:claude-3-5-sonnet-20240620",
    );
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
