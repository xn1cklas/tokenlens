import type { Usage as AnthropicUsage } from "@anthropic-ai/sdk/resources/messages/messages";
import { describe, expect, it } from "vitest";
import { createTestClient } from "./test-catalog.js";

describe("Anthropic SDK - computeCostUSD()", () => {
  it("computes costs from Messages API with prompt caching", async () => {
    const tokenlens = createTestClient();

    // Simulate Anthropic SDK response with prompt caching
    const usage: AnthropicUsage = {
      input_tokens: 3_000,
      output_tokens: 500,
      cache_creation_input_tokens: 250,
      cache_read_input_tokens: 400,
      cache_creation: null,
      server_tool_use: null,
      service_tier: null,
    };

    const costs = await tokenlens.computeCostUSD({
      modelId: "claude-3-5-sonnet-20241022",
      usage: {
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        cache_read_tokens: usage.cache_read_input_tokens ?? undefined,
        cache_write_tokens: usage.cache_creation_input_tokens ?? undefined,
      },
    });

    expect(costs.inputTokenCostUSD).toBeCloseTo(0.009, 6); // 3000 * 3 / 1M
    expect(costs.outputTokenCostUSD).toBeCloseTo(0.0075, 6); // 500 * 15 / 1M
    expect(costs.cacheReadTokenCostUSD).toBeCloseTo(0.0006, 6); // 400 * 1.5 / 1M
    expect(costs.cacheWriteTokenCostUSD).toBeCloseTo(0.00025, 6); // 250 * 1 / 1M
    expect(costs.totalTokenCostUSD).toBeCloseTo(0.01735, 6);
  });

  it("handles usage without caching", async () => {
    const tokenlens = createTestClient();

    const usage: AnthropicUsage = {
      input_tokens: 4_000,
      output_tokens: 800,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      cache_creation: null,
      server_tool_use: null,
      service_tier: null,
    };

    const costs = await tokenlens.computeCostUSD({
      modelId: "claude-3-5-sonnet-20241022",
      usage: {
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
      },
    });

    expect(costs.inputTokenCostUSD).toBeCloseTo(0.012, 6); // 4000 * 3 / 1M
    expect(costs.outputTokenCostUSD).toBeCloseTo(0.012, 6); // 800 * 15 / 1M
    expect(costs.cacheReadTokenCostUSD).toBeUndefined();
    expect(costs.cacheWriteTokenCostUSD).toBeUndefined();
  });
});

// Note: estimateCostUSD for Anthropic requires ANTHROPIC_API_KEY
// This is tested in integration tests instead

describe("Anthropic SDK - getModelData()", () => {
  it("retrieves full model metadata", async () => {
    const tokenlens = createTestClient();

    const model = await tokenlens.getModelData({
      modelId: "claude-3-5-sonnet-20241022",
    });

    expect(model?.id).toBe("anthropic/claude-3-5-sonnet-20241022");
    expect(model?.name).toBe("Claude 3.5 Sonnet (2024-10-22)");
    expect(model?.limit?.context).toBe(200_000);
    expect(model?.cost?.input).toBe(3);
    expect(model?.cost?.output).toBe(15);
    expect(model?.cost?.cache_read).toBe(1.5);
    expect(model?.cost?.cache_write).toBe(1);
  });
});

describe("Anthropic SDK - getContextLimits()", () => {
  it("retrieves context window limits", async () => {
    const tokenlens = createTestClient();

    const limits = await tokenlens.getContextLimits({
      modelId: "claude-3-5-sonnet-20241022",
    });

    expect(limits?.context).toBe(200_000);
    expect(limits?.input).toBe(200_000);
    expect(limits?.output).toBe(8_192);
  });
});

describe("Anthropic SDK - Context Health", () => {
  it("monitors large context conversations", async () => {
    const tokenlens = createTestClient();

    // Simulate accumulated usage from long conversation
    const usage: AnthropicUsage = {
      input_tokens: 150_000,
      output_tokens: 20_000,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      cache_creation: null,
      server_tool_use: null,
      service_tier: null,
    };

    const health = await tokenlens.getContextHealth({
      modelId: "claude-3-5-sonnet-20241022",
      usage: {
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
      },
    });

    expect(health).toBeDefined();
    expect(health?.totalTokens).toBe(200_000);
    expect(health?.usedTokens).toBe(170_000);
    expect(health?.usedPercentage).toBe(85);
    expect(health?.status).toBe("warning"); // Over 70%
  });
});
