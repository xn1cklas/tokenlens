import type { ModelCatalog } from "@tokenlens/core";
import { describe, expect, it } from "vitest";
import { estimateCost, normalizeUsage, remainingContext } from "../src/context";

describe("helpers basic", () => {
  it("normalizes usage shapes", () => {
    const n = normalizeUsage({ prompt_tokens: 10, completion_tokens: 5 });
    expect(n).toEqual({ input: 10, output: 5, total: 15 });
  });

  it("computes remaining context without throwing", () => {
    const catalog: ModelCatalog = {
      test: {
        id: "test",
        models: {
          foo: { id: "foo", name: "Foo", limit: { context: 1000 } },
        },
      },
    } as unknown as ModelCatalog;
    const rc = remainingContext({
      modelId: "test:foo",
      usage: { input_tokens: 100 },
      catalog,
    });
    expect(typeof rc.percentUsed).toBe("number");
  });

  it("estimates cost when pricing is present (may be undefined)", () => {
    const catalog: ModelCatalog = {
      test: {
        id: "test",
        models: {
          bar: {
            id: "bar",
            name: "Bar",
            limit: { context: 1000 },
            cost: { input: 1, output: 2 },
          },
        },
      },
    } as unknown as ModelCatalog;
    const c = estimateCost({
      modelId: "test:bar",
      usage: { input_tokens: 1000, output_tokens: 500 },
      catalog,
    });
    expect(typeof c).toBe("object");
  });
});
