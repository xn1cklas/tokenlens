import { describe, it, expect } from "vitest";
import { getContext, getTokenCosts, getUsage } from "../src/context.js";

const catalog = {
  prov: {
    id: "prov",
    name: "Provider",
    models: {
      basic: {
        id: "basic",
        name: "Basic Model",
        modalities: { input: ["text"], output: ["text"] },
        limit: { context: 2000, input: 1500, output: 500 },
        cost: { input: 1.0, output: 3.0 },
      },
      priced: {
        id: "priced",
        name: "Priced Model",
        limit: { context: 100000 },
        cost: {
          input: 1.0,
          output: 3.0,
          reasoning: 10.0,
          cache_read: 0.5,
          cache_write: 0.25,
        },
      },
    },
  },
} as const;

describe("helpers overloads: getContext", () => {
  it("supports object form", () => {
    const ctx = getContext({
      modelId: "prov/basic",
      providers: catalog as any,
    });
    expect(ctx.combinedMax).toBe(2000);
    expect(ctx.inputMax).toBe(1500);
    expect(ctx.outputMax).toBe(500);
    expect(ctx.totalMax).toBe(2000);
    // alias fields
    expect(ctx.maxInput).toBe(1500);
    expect(ctx.maxOutput).toBe(500);
    expect(ctx.maxTotal).toBe(2000);
  });

  it("supports positional form", () => {
    const ctx = getContext("prov/basic", catalog as any);
    expect(ctx.combinedMax).toBe(2000);
    expect(ctx.totalMax).toBe(2000);
  });
});

describe("helpers overloads: getTokenCosts", () => {
  it("computes input/output totals for usage-like shapes", () => {
    const cost = getTokenCosts({
      modelId: "prov/basic",
      usage: { input_tokens: 1_000_000, output_tokens: 1_000_000 },
      providers: catalog as any,
    });
    // 1.0 + 3.0 per 1M tokens
    expect(cost.inputUSD).toBeCloseTo(1.0, 6);
    expect(cost.outputUSD).toBeCloseTo(3.0, 6);
    expect(cost.totalUSD).toBeCloseTo(4.0, 6);
    // alias fields
    expect(cost.inputTokenUSD).toBeCloseTo(1.0, 6);
    expect(cost.outputTokenUSD).toBeCloseTo(3.0, 6);
  });

  it("supports positional overload and TokenBreakdown fields", () => {
    const cost = getTokenCosts(
      "prov/priced",
      {
        input_tokens: 500_000,
        output_tokens: 250_000,
        reasoningTokens: 100_000,
        cacheReads: 200_000,
        cacheWrites: 300_000,
      } as any,
      catalog as any,
    );
    // Per-million pricing: input 1.0, output 3.0, reasoning 10.0, reads 0.5, writes 0.25
    expect(cost.inputUSD).toBeCloseTo(0.5, 6);
    expect(cost.outputUSD).toBeCloseTo(0.75, 6);
    expect(cost.reasoningUSD).toBeCloseTo(1.0, 6);
    expect(cost.cacheReadUSD).toBeCloseTo(0.1, 6);
    expect(cost.cacheWriteUSD).toBeCloseTo(0.075, 6);
    expect(cost.totalUSD).toBeCloseTo(0.5 + 0.75 + 1.0 + 0.1 + 0.075, 6);
    // alias fields
    expect(cost.reasoningTokenUSD).toBeCloseTo(1.0, 6);
    expect(cost.cacheReadsUSD).toBeCloseTo(0.1, 6);
    expect(cost.cacheWritesUSD).toBeCloseTo(0.075, 6);
  });
});

describe("helpers overloads: getUsage", () => {
  it("returns context and cost (object form)", () => {
    const res = getUsage({
      modelId: "prov/basic",
      usage: { input_tokens: 1_000_000, output_tokens: 1_000_000 },
      providers: catalog as any,
    });
    expect(res.context?.combinedMax).toBe(2000);
    expect(res.costUSD?.totalUSD).toBeCloseTo(4.0, 6);
  });

  it("returns context and cost (positional)", () => {
    const res = getUsage(
      "prov/priced",
      { input_tokens: 1_000_000, output_tokens: 0 },
      catalog as any,
    );
    expect(res.context?.combinedMax).toBe(100000);
    expect(res.costUSD?.inputUSD).toBeCloseTo(1.0, 6);
  });
});
