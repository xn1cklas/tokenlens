import { describe, expect, it } from "vitest";
import { getContextHealth } from "../src/context.js";
import type { SourceModel, Usage } from "@tokenlens/core";

describe("getContextHealth", () => {
  it("returns healthy status for low usage", () => {
    const model: SourceModel = {
      id: "gpt-4o",
      canonical_id: "openai/gpt-4o",
      name: "GPT-4o",
      limit: { context: 128000 },
    };

    const usage: Usage = {
      input_tokens: 30000,
      output_tokens: 10000,
    };

    const health = getContextHealth({ model, usage });

    expect(health).toBeDefined();
    expect(health?.totalTokens).toBe(128000);
    expect(health?.usedTokens).toBe(40000);
    expect(health?.remainingTokens).toBe(88000);
    expect(health?.usedPercentage).toBeCloseTo(31.25, 2);
    expect(health?.remainingPercentage).toBeCloseTo(68.75, 2);
    expect(health?.status).toBe("healthy");
  });

  it("returns warning status for moderate usage (70-90%)", () => {
    const model: SourceModel = {
      id: "gpt-4o",
      canonical_id: "openai/gpt-4o",
      name: "GPT-4o",
      limit: { context: 100000 },
    };

    const usage: Usage = {
      input_tokens: 70000,
      output_tokens: 5000,
    };

    const health = getContextHealth({ model, usage });

    expect(health?.usedPercentage).toBe(75);
    expect(health?.remainingPercentage).toBe(25);
    expect(health?.status).toBe("warning");
  });

  it("returns critical status for high usage (>90%)", () => {
    const model: SourceModel = {
      id: "gpt-4o",
      canonical_id: "openai/gpt-4o",
      name: "GPT-4o",
      limit: { context: 100000 },
    };

    const usage: Usage = {
      input_tokens: 85000,
      output_tokens: 10000,
    };

    const health = getContextHealth({ model, usage });

    expect(health?.usedPercentage).toBe(95);
    expect(health?.remainingPercentage).toBe(5);
    expect(health?.status).toBe("critical");
  });

  it("handles usage at exactly 70% threshold", () => {
    const model: SourceModel = {
      id: "gpt-4o",
      canonical_id: "openai/gpt-4o",
      name: "GPT-4o",
      limit: { context: 100000 },
    };

    const usage: Usage = {
      input_tokens: 70000,
      output_tokens: 0,
    };

    const health = getContextHealth({ model, usage });

    expect(health?.usedPercentage).toBe(70);
    expect(health?.status).toBe("warning");
  });

  it("handles usage at exactly 90% threshold", () => {
    const model: SourceModel = {
      id: "gpt-4o",
      canonical_id: "openai/gpt-4o",
      name: "GPT-4o",
      limit: { context: 100000 },
    };

    const usage: Usage = {
      input_tokens: 90000,
      output_tokens: 0,
    };

    const health = getContextHealth({ model, usage });

    expect(health?.usedPercentage).toBe(90);
    expect(health?.status).toBe("critical");
  });

  it("handles zero usage", () => {
    const model: SourceModel = {
      id: "gpt-4o",
      canonical_id: "openai/gpt-4o",
      name: "GPT-4o",
      limit: { context: 128000 },
    };

    const usage: Usage = {
      input_tokens: 0,
      output_tokens: 0,
    };

    const health = getContextHealth({ model, usage });

    expect(health?.usedTokens).toBe(0);
    expect(health?.remainingTokens).toBe(128000);
    expect(health?.usedPercentage).toBe(0);
    expect(health?.remainingPercentage).toBe(100);
    expect(health?.status).toBe("healthy");
  });

  it("handles usage exceeding context limit", () => {
    const model: SourceModel = {
      id: "gpt-4o",
      canonical_id: "openai/gpt-4o",
      name: "GPT-4o",
      limit: { context: 100000 },
    };

    const usage: Usage = {
      input_tokens: 90000,
      output_tokens: 20000,
    };

    const health = getContextHealth({ model, usage });

    expect(health?.usedTokens).toBe(110000);
    expect(health?.remainingTokens).toBe(0); // Clamped to 0
    expect(health?.usedPercentage).toBeCloseTo(110, 1);
    expect(health?.status).toBe("critical");
  });

  it("handles undefined/missing token values", () => {
    const model: SourceModel = {
      id: "gpt-4o",
      canonical_id: "openai/gpt-4o",
      name: "GPT-4o",
      limit: { context: 100000 },
    };

    const usage: Usage = {
      // No input_tokens or output_tokens
    };

    const health = getContextHealth({ model, usage });

    expect(health?.usedTokens).toBe(0);
    expect(health?.remainingTokens).toBe(100000);
  });

  it("returns undefined when context limit is missing", () => {
    const model: SourceModel = {
      id: "gpt-4o",
      canonical_id: "openai/gpt-4o",
      name: "GPT-4o",
      limit: {}, // No context limit
    };

    const usage: Usage = {
      input_tokens: 1000,
      output_tokens: 500,
    };

    const health = getContextHealth({ model, usage });

    expect(health).toBeUndefined();
  });

  it("returns undefined when context limit is zero", () => {
    const model: SourceModel = {
      id: "gpt-4o",
      canonical_id: "openai/gpt-4o",
      name: "GPT-4o",
      limit: { context: 0 },
    };

    const usage: Usage = {
      input_tokens: 1000,
      output_tokens: 500,
    };

    const health = getContextHealth({ model, usage });

    expect(health).toBeUndefined();
  });

  it("returns undefined when context limit is negative", () => {
    const model: SourceModel = {
      id: "gpt-4o",
      canonical_id: "openai/gpt-4o",
      name: "GPT-4o",
      limit: { context: -1000 },
    };

    const usage: Usage = {
      input_tokens: 1000,
      output_tokens: 500,
    };

    const health = getContextHealth({ model, usage });

    expect(health).toBeUndefined();
  });
});

describe("Real-world scenarios", () => {
  it("tracks conversation progress", () => {
    const model: SourceModel = {
      id: "claude-sonnet-4-5",
      canonical_id: "anthropic/claude-sonnet-4-5",
      name: "Claude Sonnet 4.5",
      limit: { context: 200000 },
    };

    // Initial message
    let usage: Usage = { input_tokens: 1000, output_tokens: 500 };
    let health = getContextHealth({ model, usage });
    expect(health?.status).toBe("healthy");
    expect(health?.usedPercentage).toBeLessThan(1);

    // After 10 exchanges
    usage = { input_tokens: 80000, output_tokens: 20000 };
    health = getContextHealth({ model, usage });
    expect(health?.status).toBe("healthy");
    expect(health?.usedPercentage).toBe(50);

    // Approaching limit
    usage = { input_tokens: 160000, output_tokens: 20000 };
    health = getContextHealth({ model, usage });
    expect(health?.status).toBe("critical");
    expect(health?.remainingTokens).toBe(20000);
  });

  it("provides percentage for UI display", () => {
    const model: SourceModel = {
      id: "gpt-4o",
      canonical_id: "openai/gpt-4o",
      name: "GPT-4o",
      limit: { context: 128000 },
    };

    const usage: Usage = {
      input_tokens: 32000, // 25%
      output_tokens: 32000, // 25%
      // Total: 50%
    };

    const health = getContextHealth({ model, usage });

    expect(health?.usedPercentage).toBe(50);
    expect(health?.remainingPercentage).toBe(50);

    // This could be used to show a progress bar
    // <ProgressBar value={health.usedPercentage} />
  });
});
