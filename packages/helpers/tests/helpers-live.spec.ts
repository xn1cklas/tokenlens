import type { ModelCatalog } from "@tokenlens/core";
import { describe, expect, it } from "vitest";
import { estimateCost, remainingContext } from "../src/context";

const mockCatalog: ModelCatalog = {
  testprov: {
    id: "testprov",
    name: "Test Provider",
    models: {
      foo: {
        id: "foo",
        name: "Foo Model",
        limit: { context: 1000, output: 200 },
        cost: { input: 1, output: 2 },
      },
    },
  },
};

describe("helpers with live catalog", () => {
  it("remainingContext uses catalog caps", () => {
    const rc = remainingContext({
      modelId: "testprov:foo",
      usage: { input_tokens: 100 },
      catalog: mockCatalog,
    });
    expect(rc.remainingCombined).toBe(1000 - 100);
    expect(rc.percentUsed).toBeCloseTo(100 / 1000);
  });

  it("estimateCost uses catalog pricing", () => {
    const c = estimateCost({
      modelId: "testprov:foo",
      usage: { input_tokens: 1000, output_tokens: 500 },
      catalog: mockCatalog,
    });
    // input: 1000 / 1e6 * 1 = 0.001 ; output: 500 / 1e6 * 2 = 0.001
    expect(c.totalUSD).toBeCloseTo(0.002);
  });
});
