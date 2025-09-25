import type { LanguageModelV2Usage as VercelUsage } from "@ai-sdk/provider";
import { describe, expect, it } from "vitest";

import { createTestClient } from "./test-catalog.js";
import type { Usage } from "tokenlens/core";

function toUsage(usage: VercelUsage): Usage {
  const input = usage.inputTokens ?? 0;
  const output = usage.outputTokens ?? 0;
  const total =
    usage.totalTokens ??
    (Number.isFinite(input + output) ? input + output : undefined);
  return {
    input_tokens: input,
    output_tokens: output,
    total_tokens: total,
    reasoning_tokens: usage.reasoningTokens,
  } satisfies Usage;
}

describe("AI SDK usage integration", () => {
  it("computes costs for AI SDK usage payloads", async () => {
    const client = createTestClient();
    const usage: VercelUsage = {
      inputTokens: 150,
      outputTokens: 50,
      totalTokens: 200,
      reasoningTokens: 100,
      cachedInputTokens: 100,
    };

    const details = await client.describeModel({
      modelId: "openai/gpt-5",
      usage: toUsage(usage),
    });

    expect(details.providerId).toBe("openai");
    expect(details.limit?.context).toBe(200_000);
    expect(details.costs?.totalTokenCostUSD).toBeCloseTo(0.0195, 6);
    expect(details.costs?.inputTokenCostUSD).toBeCloseTo(0.0045, 6);
    expect(details.costs?.outputTokenCostUSD).toBeCloseTo(0.003, 6);
    expect(details.costs?.reasoningTokenCostUSD).toBeCloseTo(0.012, 6);
    expect(details.costs?.cacheReadTokenCostUSD).toBeUndefined();
  });

  it("ignores reasoning costs when the model lacks reasoning pricing", async () => {
    const client = createTestClient();
    const usage: VercelUsage = {
      inputTokens: 1_000,
      outputTokens: 500,
      reasoningTokens: 200,
      totalTokens: 1_500,
      cachedInputTokens: 0,
    };

    const costs = await client.estimateCostUSD({
      modelId: "openai/o1",
      usage: toUsage(usage),
    });

    expect(costs.reasoningTokenCostUSD).toBeUndefined();
    expect(costs.inputTokenCostUSD).toBeCloseTo(0.015, 6);
    expect(costs.outputTokenCostUSD).toBeCloseTo(0.03, 6);
    expect(costs.totalTokenCostUSD).toBeCloseTo(0.045, 6);
  });

  it("returns contextual hints for AI SDK model ids", async () => {
    const client = createTestClient();
    const usage: VercelUsage = {
      inputTokens: 3_200,
      outputTokens: 400,
      totalTokens: 3_600,
      cachedInputTokens: 0,
    };

    const details = await client.describeModel({
      modelId: "openai/gpt-5",
      usage: toUsage(usage),
    });

    expect(details.model?.id).toBe("openai/gpt-5");
    expect(details.limit?.context).toBe(200_000);
    expect(details.hints?.supportsReasoning).toBe(false);
  });
});
