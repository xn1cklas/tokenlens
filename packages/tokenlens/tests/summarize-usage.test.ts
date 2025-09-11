import { describe, expect, it } from "vitest";
import { summarizeUsage, toModelId } from "../src/index.ts";

describe("summarizeUsage", () => {
  it("aggregates usage and resolves canonical model id", () => {
    const usage = { input_tokens: 1000, output_tokens: 200 } as const;
    const summary = summarizeUsage({ modelId: "xai/grok-3-mini", usage });
    expect(typeof summary.modelId).toBe("string");
    expect(summary.modelId!.includes(":")).toBe(true);
    expect(summary.modelId!.includes("grok-3-mini")).toBe(true);
    expect(summary.normalized).toEqual({
      input: 1000,
      output: 200,
      total: 1200,
    });
    expect(summary.breakdown.input).toBe(1000);
    expect(summary.breakdown.output).toBe(200);
    expect(summary.breakdown.total).toBe(1200);
    expect(summary.context).toBeDefined();
    expect(typeof summary.percentUsed).toBe("number");
    if (summary.costUSD) {
      expect(
        typeof summary.costUSD.totalUSD === "number" ||
          summary.costUSD.totalUSD === undefined,
      ).toBe(true);
    }
  });
});

describe("toModelId", () => {
  it("converts provider/model to provider:id", () => {
    expect(toModelId("openai/gpt-4o-mini")).toBe("openai:gpt-4o-mini");
    expect(toModelId("xai/grok-3-mini")).toBe("xai:grok-3-mini");
    expect(toModelId("anthropic:claude-3-5-sonnet-20240620")).toBe(
      "anthropic:claude-3-5-sonnet-20240620",
    );
    expect(toModelId(undefined)).toBeUndefined();
  });
});
