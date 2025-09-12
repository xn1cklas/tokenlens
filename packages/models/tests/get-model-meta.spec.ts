import { describe, expect, it } from "vitest";
import { getModelMeta } from "../src/api.ts";
import { getModels } from "../src/index.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function expectProviderModelShape(
  value: unknown,
): asserts value is Record<string, unknown> {
  expect(isRecord(value)).toBe(true);
  // Required fields
  expect(typeof (value as { id?: unknown }).id).toBe("string");
  expect(typeof (value as { name?: unknown }).name).toBe("string");

  // modalities: { input?: string[]; output?: string[] }
  const modalities = (value as { modalities?: unknown }).modalities;
  if (modalities !== undefined) {
    expect(isRecord(modalities)).toBe(true);
    const input = (modalities as { input?: unknown }).input;
    const output = (modalities as { output?: unknown }).output;
    if (input !== undefined) {
      expect(Array.isArray(input)).toBe(true);
      for (const s of input as unknown[]) expect(typeof s).toBe("string");
    }
    if (output !== undefined) {
      expect(Array.isArray(output)).toBe(true);
      for (const s of output as unknown[]) expect(typeof s).toBe("string");
    }
  }

  // limit: { context?: number; input?: number; output?: number }
  const limit = (value as { limit?: unknown }).limit;
  if (limit !== undefined) {
    expect(isRecord(limit)).toBe(true);
    const ctx = (limit as { context?: unknown }).context;
    const inp = (limit as { input?: unknown }).input;
    const out = (limit as { output?: unknown }).output;
    if (ctx !== undefined) expect(typeof ctx).toBe("number");
    if (inp !== undefined) expect(typeof inp).toBe("number");
    if (out !== undefined) expect(typeof out).toBe("number");
  }

  // cost?: { input?: number; output?: number; reasoning?: number; cache_read?: number; cache_write?: number }
  const cost = (value as { cost?: unknown }).cost;
  if (cost !== undefined) {
    expect(isRecord(cost)).toBe(true);
    const numOrUndef = (v: unknown) => v === undefined || typeof v === "number";
    expect(numOrUndef((cost as { input?: unknown }).input)).toBe(true);
    expect(numOrUndef((cost as { output?: unknown }).output)).toBe(true);
    expect(numOrUndef((cost as { reasoning?: unknown }).reasoning)).toBe(true);
    expect(numOrUndef((cost as { cache_read?: unknown }).cache_read)).toBe(
      true,
    );
    expect(numOrUndef((cost as { cache_write?: unknown }).cache_write)).toBe(
      true,
    );
  }
}

function expectProviderInfoShape(
  value: unknown,
): asserts value is Record<string, unknown> {
  expect(isRecord(value)).toBe(true);
  expect(typeof (value as { id?: unknown }).id).toBe("string");
  const models = (value as { models?: unknown }).models;
  expect(isRecord(models)).toBe(true);
  // Spot-check at least one model entry conforms
  const firstModel = Object.values(models as Record<string, unknown>)[0];
  if (firstModel) expectProviderModelShape(firstModel);
}

describe("@tokenlens/models getModelMeta (object overloads)", () => {
  it("returns ProviderInfo when only provider is supplied", () => {
    const providers = getModels();
    const prov = getModelMeta({ providers, provider: "openai" });
    expectProviderInfoShape(prov);
    expect((prov as { id?: string }).id).toBe("openai");
    const models = (prov as { models: Record<string, unknown> }).models;
    expect(Object.hasOwn(models, "gpt-4o")).toBe(true);
    expect(Object.hasOwn(models, "o3-mini")).toBe(true);
  });

  it("returns ProviderModel when provider+model are supplied", () => {
    const providers = getModels();
    const m = getModelMeta({ providers, provider: "openai", model: "gpt-4o" });
    expectProviderModelShape(m);
    expect((m as { id?: string }).id).toBe("gpt-4o");
  });

  it("returns undefined for unknown provider or model", () => {
    const providers = getModels();
    expect(getModelMeta({ providers, provider: "__nope__" })).toBeUndefined();
    expect(
      getModelMeta({ providers, provider: "openai", model: "__nope__" }),
    ).toBeUndefined();
  });

  it("returns a map of found models when models[] is supplied", () => {
    const providers = getModels();
    const res = getModelMeta({
      providers,
      provider: "openai",
      models: ["gpt-4o", "__nope__", "o3-mini"],
    });
    expect(isRecord(res)).toBe(true);
    const keys = Object.keys(res as Record<string, unknown>);
    expect(keys).toEqual(expect.arrayContaining(["gpt-4o", "o3-mini"]));
    expect(keys).not.toContain("__nope__");
    for (const m of Object.values(res as Record<string, unknown>)) {
      expectProviderModelShape(m);
    }
  });

  it("accepts canonical or gateway ids via { id }", () => {
    const providers = getModels();
    const a = getModelMeta({ providers, id: "openai:gpt-4o" });
    const b = getModelMeta({ providers, id: "openai/gpt-4o" });
    expectProviderModelShape(a);
    expectProviderModelShape(b);
    expect((a as { id?: string }).id).toBe("gpt-4o");
    expect((b as { id?: string }).id).toBe("gpt-4o");
  });
});
