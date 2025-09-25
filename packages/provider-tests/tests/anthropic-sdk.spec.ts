import type { Usage as TokenUsage } from "tokenlens/core";
import { describe, expect, it } from "vitest";

import { createTestClient } from "./test-catalog.js";

import type { Usage as AnthropicUsage } from "@anthropic-ai/sdk/resources/messages/messages";

function toUsage(usage: AnthropicUsage): TokenUsage {
  const total = usage.input_tokens + usage.output_tokens;
  return {
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    total_tokens: Number.isFinite(total) ? total : undefined,
    cache_read_tokens: usage.cache_read_input_tokens ?? undefined,
    cache_write_tokens: usage.cache_creation_input_tokens ?? undefined,
  } satisfies TokenUsage;
}

describe("Anthropic SDK integration", () => {
  it("estimates costs from Messages API usage", async () => {
    const client = createTestClient();
    const usage: AnthropicUsage = {
      cache_creation: null,
      cache_creation_input_tokens: 250,
      cache_read_input_tokens: 400,
      input_tokens: 3_000,
      output_tokens: 500,
      server_tool_use: null,
      service_tier: null,
    };

    const costs = await client.computeCostUSD({
      modelId: "anthropic/claude-3-5-sonnet-20241022",
      usage: toUsage(usage),
    });

    expect(costs.inputTokenCostUSD).toBeCloseTo(0.009, 6);
    expect(costs.outputTokenCostUSD).toBeCloseTo(0.0075, 6);
    expect(costs.cacheReadTokenCostUSD).toBeCloseTo(0.0006, 6);
    expect(costs.cacheWriteTokenCostUSD).toBeCloseTo(0.00025, 6);
    expect(costs.totalTokenCostUSD).toBeCloseTo(0.01735, 6);
  });

  it("returns model limits for Anthropic usage", async () => {
    const client = createTestClient();
    const usage: AnthropicUsage = {
      cache_creation: null,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      input_tokens: 4_000,
      output_tokens: 800,
      server_tool_use: null,
      service_tier: null,
    };

    const meta = await client.describeModel({
      modelId: "anthropic/claude-3-5-sonnet-20241022",
    });

    expect(meta?.id).toBe("anthropic/claude-3-5-sonnet-20241022");
    expect(meta?.limit?.context).toBe(200_000);
  });
});
