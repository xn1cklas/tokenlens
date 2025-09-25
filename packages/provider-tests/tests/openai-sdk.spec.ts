import { describe, expect, it } from "vitest";
import type { ResponseUsage } from "openai/resources/responses/responses";

import { createTestClient } from "./test-catalog.js";
import type { Usage } from "tokenlens/core";

function toUsage(usage: ResponseUsage): Usage {
  return {
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    total_tokens: usage.total_tokens,
    reasoning_tokens: usage.output_tokens_details?.reasoning_tokens,
  } satisfies Usage;
}

describe("OpenAI SDK integration", () => {
  it("estimates costs using Responses API usage numbers", async () => {
    const client = createTestClient();
    const usage: ResponseUsage = {
      input_tokens: 1_200,
      output_tokens: 600,
      total_tokens: 1_800,
      output_tokens_details: {
        reasoning_tokens: 120,
      },
      input_tokens_details: {
        cached_tokens: 300,
      },
    };

    const costs = await client.estimateCostUSD({
      modelId: "openai/gpt-4o-mini",
      usage: toUsage(usage),
    });

    expect(costs.inputTokenCostUSD).toBeCloseTo(0.018, 6);
    expect(costs.outputTokenCostUSD).toBeCloseTo(0.036, 6);
    expect(costs.totalTokenCostUSD).toBeCloseTo(0.054, 6);
    expect(costs.cacheReadTokenCostUSD).toBeUndefined();
  });

  it("provides limit information and metadata", async () => {
    const client = createTestClient();
    const usage: ResponseUsage = {
      input_tokens: 2_000,
      output_tokens: 400,
      total_tokens: 2_400,
      output_tokens_details: {
        reasoning_tokens: 120,
      },
      input_tokens_details: {
        cached_tokens: 300,
      },
    };

    const meta = await client.describeModel({
      modelId: "openai/gpt-4o-mini",
      usage: toUsage(usage),
    });

    expect(meta.model?.id).toBe("openai/gpt-4o-mini");
    expect(meta.limit?.context).toBe(128_000);
    expect(meta.costs?.totalTokenCostUSD).toBeCloseTo(0.054, 6);
  });
});
