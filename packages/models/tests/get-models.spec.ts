import { describe, it, expect } from "vitest";
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
});
