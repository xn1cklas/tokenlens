import { describe, expect, it } from "vitest";
import {
  normalizeUsage,
  perMTokensToUnitCostUSD,
  round6,
} from "../src/internal.js";

describe("normalizeUsage", () => {
  it("maps mixed key shapes to canonical fields", () => {
    const normalized = normalizeUsage({
      prompt_tokens: 10,
      completionTokens: 20,
      totalTokens: 40,
      reasoning_tokens: 5,
      cacheReads: 8,
      cache_write_tokens: 2,
    });

    expect(normalized).toEqual({
      input: 10,
      output: 20,
      total: 40,
      reasoningTokens: 5,
      cacheReads: 8,
      cacheWrites: 2,
      cacheTokensIncludedInInput: true,
      reasoningIncludedInOutput: true,
    });
  });

  it("defaults missing numeric fields to zero", () => {
    const normalized = normalizeUsage({});

    expect(normalized.input).toBe(0);
    expect(normalized.output).toBe(0);
    expect(normalized.total).toBeUndefined();
  });

  it("maps AI SDK inputTokens and outputTokens fields", () => {
    const normalized = normalizeUsage({
      inputTokens: 1200,
      outputTokens: 300,
    });

    expect(normalized.input).toBe(1200);
    expect(normalized.output).toBe(300);
  });

  it("maps OpenAI nested reasoning and cache details", () => {
    const normalized = normalizeUsage({
      prompt_tokens: 100,
      completion_tokens: 50,
      prompt_tokens_details: {
        cached_tokens: 20,
      },
      completion_tokens_details: {
        reasoning_tokens: 10,
      },
    });

    expect(normalized).toMatchObject({
      input: 100,
      output: 50,
      reasoningTokens: 10,
      cacheReads: 20,
      cacheTokensIncludedInInput: true,
      reasoningIncludedInOutput: true,
    });
  });

  it("maps Anthropic cache fields as outside input tokens", () => {
    const normalized = normalizeUsage({
      input_tokens: 100,
      output_tokens: 50,
      cache_read_input_tokens: 20,
      cache_creation_input_tokens: 10,
    });

    expect(normalized).toMatchObject({
      input: 100,
      output: 50,
      cacheReads: 20,
      cacheWrites: 10,
      cacheTokensIncludedInInput: false,
    });
  });
});

describe("perMTokensToUnitCostUSD", () => {
  it("returns zero when rate is undefined or invalid", () => {
    expect(perMTokensToUnitCostUSD(10, undefined)).toBe(0);
    expect(perMTokensToUnitCostUSD(10, -1)).toBe(0);
  });

  it("scales per-million costs to usage units", () => {
    expect(perMTokensToUnitCostUSD(500_000, 2)).toBe(1);
  });
});

describe("round6", () => {
  it("rounds to six decimal places", () => {
    expect(round6(Math.PI)).toBeCloseTo(Math.PI, 6);
  });
});
