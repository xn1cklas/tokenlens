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
    });
  });

  it("defaults missing numeric fields to zero", () => {
    const normalized = normalizeUsage({});

    expect(normalized.input).toBe(0);
    expect(normalized.output).toBe(0);
    expect(normalized.total).toBeUndefined();
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
    expect(round6(Math.PI)).toBeCloseTo(3.141593, 6);
  });
});
