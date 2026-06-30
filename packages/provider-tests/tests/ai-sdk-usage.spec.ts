import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import type { LanguageModelV2Usage as VercelUsage } from "@ai-sdk/provider";
import { xai } from "@ai-sdk/xai";
import { describe, expect, it } from "vitest";
import { createTestClient } from "./test-catalog.js";

describe("Vercel AI SDK - computeCostUSD()", () => {
  it("computes costs for OpenAI models via AI SDK", async () => {
    const tokenlens = createTestClient();
    const model = openai("gpt-5");

    // Simulate Vercel AI SDK usage
    const usage: VercelUsage = {
      inputTokens: 1_200,
      outputTokens: 800,
      totalTokens: 2_000,
    };

    // Integration pattern:
    // const response = await generateText({
    //   model: openai("gpt-5"),
    //   prompt: "..."
    // });
    // const usage = response.usage;

    const costs = await tokenlens.computeCostUSD({
      modelId: model.modelId,
      provider: "openai",
      usage: {
        input_tokens: usage.inputTokens,
        output_tokens: usage.outputTokens,
      },
    });

    expect(costs.inputTokenCostUSD).toBeCloseTo(0.036, 6); // 1200 * 30 / 1M
    expect(costs.outputTokenCostUSD).toBeCloseTo(0.048, 6); // 800 * 60 / 1M
    expect(costs.totalTokenCostUSD).toBeCloseTo(0.084, 6);
  });

  it("computes costs for Anthropic models via AI SDK", async () => {
    const tokenlens = createTestClient();
    const model = anthropic("claude-3-5-sonnet-20241022");

    const usage: VercelUsage = {
      inputTokens: 1_000,
      outputTokens: 500,
      totalTokens: 1_500,
    };

    const costs = await tokenlens.computeCostUSD({
      modelId: model.modelId,
      provider: "anthropic",
      usage: {
        input_tokens: usage.inputTokens,
        output_tokens: usage.outputTokens,
      },
    });

    expect(costs.inputTokenCostUSD).toBeCloseTo(0.003, 6);
    expect(costs.outputTokenCostUSD).toBeCloseTo(0.0075, 6);
    expect(costs.totalTokenCostUSD).toBeCloseTo(0.0105, 6);
  });

  it("computes costs for xAI models", async () => {
    const tokenlens = createTestClient();
    const model = xai("grok-4");

    const usage: VercelUsage = {
      inputTokens: 1_000,
      outputTokens: 500,
      totalTokens: 1_500,
    };

    const costs = await tokenlens.computeCostUSD({
      modelId: model.modelId,
      provider: "xai",
      usage: {
        input_tokens: usage.inputTokens,
        output_tokens: usage.outputTokens,
      },
    });

    expect(costs.inputTokenCostUSD).toBeCloseTo(0.02, 6); // 1000 * 20 / 1M
    expect(costs.outputTokenCostUSD).toBeCloseTo(0.01, 6); // 500 * 20 / 1M
    expect(costs.totalTokenCostUSD).toBeCloseTo(0.03, 6);
  });
});

describe("Vercel AI SDK - getModelData()", () => {
  it("retrieves model metadata for AI SDK models", async () => {
    const tokenlens = createTestClient();

    const model = await tokenlens.getModelData({
      modelId: "gpt-5",
      provider: "openai",
    });

    expect(model?.id).toBe("openai/gpt-5");
    expect(model?.limit?.context).toBe(200_000);
    expect(model?.cost?.input).toBe(30);
  });

  it("works with AI SDK model objects", async () => {
    const tokenlens = createTestClient();
    const aiModel = openai("gpt-5");

    const model = await tokenlens.getModelData({
      modelId: aiModel.modelId,
      provider: "openai",
    });

    expect(model?.id).toBe("openai/gpt-5");
  });
});

describe("Vercel AI SDK - getContextLimits()", () => {
  it("retrieves limits for AI SDK models", async () => {
    const tokenlens = createTestClient();

    const limits = await tokenlens.getContextLimits({
      modelId: "gpt-5",
      provider: "openai",
    });

    expect(limits?.context).toBe(200_000);
    expect(limits?.output).toBe(8_192);
  });
});
