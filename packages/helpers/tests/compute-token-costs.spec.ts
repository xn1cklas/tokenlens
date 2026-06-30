import type { SourceModel, Usage } from "@tokenlens/core";
import { describe, expect, it } from "vitest";
import { computeTokenCostsForModel } from "../src/index.js";

const usageWithSynonyms: Usage = {
  promptTokens: 500_000,
  completion_tokens: 250_000,
  reasoningTokens: 100_000,
  cache_read_tokens: 200_000,
  cacheWrites: 100_000,
};

describe("computeTokenCostsForModel", () => {
  it("returns zeros when pricing data is missing", () => {
    const result = computeTokenCostsForModel({
      usage: { prompt_tokens: 10, completion_tokens: 5 },
    });

    expect(result).toEqual({
      inputTokenCostUSD: 0,
      outputTokenCostUSD: 0,
      reasoningTokenCostUSD: undefined,
      cacheReadTokenCostUSD: undefined,
      cacheWriteTokenCostUSD: undefined,
      totalTokenCostUSD: 0,
      ratesUsed: {
        inputPerMTokens: undefined,
        outputPerMTokens: undefined,
        reasoningPerMTokens: undefined,
        cacheReadPerMTokens: undefined,
        cacheWritePerMTokens: undefined,
      },
    });
  });

  it("computes costs for all token categories and preserves provider rates", () => {
    const model = {
      cost: {
        input: 3,
        output: 7,
        reasoning: 10,
        cache_read: 0.5,
        cache_write: 0.25,
      },
    } as unknown as SourceModel;

    const result = computeTokenCostsForModel({
      model,
      usage: usageWithSynonyms,
    });

    expect(result).toEqual({
      inputTokenCostUSD: 1.5,
      outputTokenCostUSD: 1.75,
      reasoningTokenCostUSD: 1,
      cacheReadTokenCostUSD: 0.1,
      cacheWriteTokenCostUSD: 0.025,
      totalTokenCostUSD: 4.375,
      ratesUsed: {
        inputPerMTokens: 3,
        outputPerMTokens: 7,
        reasoningPerMTokens: 10,
        cacheReadPerMTokens: 0.5,
        cacheWritePerMTokens: 0.25,
      },
    });
  });

  it("rounds output to six decimal places", () => {
    const model = {
      cost: {
        input: 3.141592,
        output: 2.718281,
      },
    } as unknown as SourceModel;

    const result = computeTokenCostsForModel({
      model,
      usage: {
        prompt_tokens: 123,
        completion_tokens: 456,
      },
    });

    expect(Number.isInteger(result.inputTokenCostUSD * 1_000_000)).toBe(true);
    expect(Number.isInteger(result.outputTokenCostUSD * 1_000_000)).toBe(true);
    expect(Number.isInteger(result.totalTokenCostUSD * 1_000_000)).toBe(true);
  });
});
