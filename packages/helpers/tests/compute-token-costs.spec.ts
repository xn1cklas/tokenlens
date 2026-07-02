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
      inputTokenCostUSD: 0.6,
      outputTokenCostUSD: 1.05,
      reasoningTokenCostUSD: 1,
      cacheReadTokenCostUSD: 0.1,
      cacheWriteTokenCostUSD: 0.025,
      totalTokenCostUSD: 2.775,
      ratesUsed: {
        inputPerMTokens: 3,
        outputPerMTokens: 7,
        reasoningPerMTokens: 10,
        cacheReadPerMTokens: 0.5,
        cacheWritePerMTokens: 0.25,
      },
    });
  });

  it("keeps cache tokens billed as input when cache-specific rates are missing", () => {
    const model = {
      cost: {
        input: 3,
        output: 7,
      },
    } as unknown as SourceModel;

    const result = computeTokenCostsForModel({
      model,
      usage: {
        input_tokens: 1_000_000,
        output_tokens: 0,
        cache_read_tokens: 250_000,
        cache_write_tokens: 100_000,
      },
    });

    expect(result).toMatchObject({
      inputTokenCostUSD: 3,
      outputTokenCostUSD: 0,
      totalTokenCostUSD: 3,
      ratesUsed: {
        inputPerMTokens: 3,
        outputPerMTokens: 7,
      },
    });
    expect(result.cacheReadTokenCostUSD).toBeUndefined();
    expect(result.cacheWriteTokenCostUSD).toBeUndefined();
  });

  it("bills raw Anthropic cache tokens outside input tokens", () => {
    const model = {
      cost: {
        input: 3,
        output: 15,
        cache_read: 1.5,
        cache_write: 1,
      },
    } as unknown as SourceModel;

    const result = computeTokenCostsForModel({
      model,
      usage: {
        input_tokens: 3_000,
        output_tokens: 500,
        cache_read_input_tokens: 400,
        cache_creation_input_tokens: 250,
      },
    });

    expect(result).toMatchObject({
      inputTokenCostUSD: 0.009,
      outputTokenCostUSD: 0.0075,
      cacheReadTokenCostUSD: 0.0006,
      cacheWriteTokenCostUSD: 0.00025,
      totalTokenCostUSD: 0.01735,
    });
  });

  it("subtracts included reasoning tokens from output before applying output rates", () => {
    const model = {
      cost: {
        output: 60,
        reasoning: 120,
      },
    } as unknown as SourceModel;

    const result = computeTokenCostsForModel({
      model,
      usage: {
        completion_tokens: 600,
        completion_tokens_details: {
          reasoning_tokens: 120,
        },
      },
    });

    expect(result.outputTokenCostUSD).toBeCloseTo(0.0288, 6);
    expect(result.reasoningTokenCostUSD).toBeCloseTo(0.0144, 6);
    expect(result.totalTokenCostUSD).toBeCloseTo(0.0432, 6);
  });

  it("rounds output to six decimal places", () => {
    const model = {
      cost: {
        input: Math.PI,
        output: Math.E,
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

  it("ignores negative sentinel rates from custom catalogs", () => {
    const model = {
      cost: {
        input: -1,
        output: -1,
      },
    } as unknown as SourceModel;

    const result = computeTokenCostsForModel({
      model,
      usage: {
        prompt_tokens: 1_000,
        completion_tokens: 1_000,
      },
    });

    expect(result.totalTokenCostUSD).toBe(0);
    expect(result.ratesUsed).toEqual({});
  });
});
