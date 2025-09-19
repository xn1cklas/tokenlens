import { describe, expect, it } from "vitest";
import { getContext, getTokenCosts, getUsage } from "../src/context.js";

const catalog = {
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    models: {
      // note dash in 3-5; callers might pass 3.5
      "claude-3-5-haiku": {
        id: "claude-3-5-haiku",
        name: "Claude 3.5 Haiku",
        modalities: { input: ["text"], output: ["text"] },
        limit: { context: 200000, input: 200000, output: 8192 },
        cost: { input: 1.0, output: 3.0 },
      },
    },
  },
} as const;

describe("focused helpers", () => {
  it("resolves provider/model and dot versioning for context", () => {
    const ctx = getContext({
      modelId: "anthropic/claude-3.5-haiku",
      providers: catalog,
    });
    expect(ctx.combinedMax).toBe(200000);
    expect(ctx.totalMax).toBe(200000);
  });

  it("accepts providerless id with dot versioning when catalog is provided", () => {
    const ctx = getContext({
      modelId: "claude-3.5-haiku",
      providers: catalog,
    });
    expect(ctx.combinedMax).toBe(200000);
    expect(ctx.totalMax).toBe(200000);
  });

  it("accepts providerless id for costs when catalog is provided", () => {
    const cost = getTokenCosts({
      modelId: "claude-3.5-haiku",
      usage: { input_tokens: 1_000_000, output_tokens: 1_000_000 },
      providers: catalog,
    });
    expect(cost.totalUSD).toBeCloseTo(4.0, 6);
  });

  it("computes costs for usage", () => {
    const cost = getTokenCosts({
      modelId: "anthropic/claude-3.5-haiku",
      usage: { input_tokens: 1_000_000, output_tokens: 1_000_000 },
      providers: catalog,
    });
    // 1.0 + 3.0 per 1M tokens
    expect(cost.totalUSD).toBeCloseTo(4.0, 6);
  });

  it("aggregates context + cost", () => {
    const res = getUsage({
      modelId: "anthropic/claude-3.5-haiku",
      usage: { input_tokens: 1_000_000, output_tokens: 1_000_000 },
      providers: catalog,
    });
    expect(res.context?.combinedMax).toBe(200000);
    expect(res.costUSD?.totalUSD).toBeCloseTo(4.0, 6);
  });
});
