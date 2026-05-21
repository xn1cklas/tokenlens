import { describe, expect, it } from "vitest";
import { getModels } from "../src/index.ts";

describe("@tokenlens/models getModels", () => {
  it("returns a non-empty providers catalog", () => {
    const catalog = getModels();
    expect(typeof catalog).toBe("object");
    expect(catalog).not.toBeNull();
    const providerKeys = Object.keys(catalog);
    expect(providerKeys.length).toBeGreaterThan(0);

    const firstKey = providerKeys[0] as keyof typeof catalog;
    const prov = catalog[firstKey];
    expect(typeof prov).toBe("object");
    expect(prov).not.toBeNull();
    expect(typeof (prov as { id?: string }).id).toBe("string");
    expect(typeof (prov as { models?: unknown }).models).toBe("object");
  });

  it("includes NEAR AI Cloud provider metadata", () => {
    const catalog = getModels();
    const nearai = catalog.nearai;

    expect(nearai.id).toBe("nearai");
    expect(nearai.name).toBe("NEAR AI Cloud");
    expect(nearai.api).toBe("https://cloud-api.near.ai/v1");
    expect(nearai.npm).toBe("@ai-sdk/openai-compatible");
    expect(nearai.env).toContain("NEARAI_API_KEY");
    expect(Object.keys(nearai.models).length).toBeGreaterThan(0);
    expect(nearai.models["openai/gpt-oss-120b"]?.limit.context).toBeGreaterThan(
      0,
    );
  });
});
