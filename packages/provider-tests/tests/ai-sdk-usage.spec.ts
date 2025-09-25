import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { xai } from "@ai-sdk/xai";
import type { LanguageModelV2Usage as VercelUsage } from "@ai-sdk/provider";
import { describe, expect, it } from "vitest";

import { createTestClient } from "./test-catalog.js";

describe("AI SDK usage integration", () => {
  const client = createTestClient();
  const usage: VercelUsage = {
    inputTokens: 150,
    outputTokens: 50,
    totalTokens: 200,
    reasoningTokens: 100,
    cachedInputTokens: 100,
  };

  it("computes costs for AI SDK usage payloads", async () => {
    const details = await client.describeModel({
      modelId: "openai/gpt-5",
      usage: usage,
    });

    expect(details.providerId).toBe("openai");
    expect(details.limit?.context).toBe(200_000);
    expect(details.costs?.totalTokenCostUSD).toBeCloseTo(0.0195, 5);
    expect(details.costs?.inputTokenCostUSD).toBeCloseTo(0.0045, 6);
    expect(details.costs?.outputTokenCostUSD).toBeCloseTo(0.003, 6);
    expect(details.costs?.reasoningTokenCostUSD).toBeCloseTo(0.012, 6);
    expect(details.costs?.cacheReadTokenCostUSD).toBeUndefined();
  });

  it("accepts OpenAI LanguageModelV2 metadata", async () => {
    const model = openai("gpt-5");
    const usage: VercelUsage = {
      inputTokens: 120,
      outputTokens: 80,
      totalTokens: 200,
    };

    const costs = await client.estimateCostUSD({
      modelId: model.modelId,
      provider: model.provider,
      usage: usage,
    });

    expect(model.provider).toBe("openai.responses");
    expect(costs.inputTokenCostUSD).toBeCloseTo(0.0036, 5);
    expect(costs.outputTokenCostUSD).toBeCloseTo(0.0048, 6);
    expect(costs.totalTokenCostUSD).toBeCloseTo(0.0084, 6);
  });

  it("accepts Anthropic LanguageModelV2 metadata", async () => {
    const model = anthropic("claude-3-5-sonnet-20241022");
    const usage: VercelUsage = {
      inputTokens: 1_000,
      outputTokens: 500,
      totalTokens: 1_500,
    };

    const costs = await client.estimateCostUSD({
      modelId: model.modelId,
      provider: model.provider,
      usage: usage,
    });

    expect(model.provider.startsWith("anthropic")).toBeTruthy();
    expect(costs.inputTokenCostUSD).toBeCloseTo(0.003, 6);
    expect(costs.outputTokenCostUSD).toBeCloseTo(0.0075, 6);
    expect(costs.totalTokenCostUSD).toBeCloseTo(0.0105, 6);
  });

  it("accepts xAI LanguageModelV2 metadata", async () => {
    const model = xai("grok-4");
    const usage: VercelUsage = {
      inputTokens: 1_000,
      outputTokens: 500,
      totalTokens: 1_500,
    };

    const costs = await client.estimateCostUSD({
      modelId: model.modelId,
      provider: model.provider,
      usage: usage,
    });

    expect(model.provider.startsWith("xai")).toBeTruthy();
    expect(costs.inputTokenCostUSD).toBeCloseTo(0.02, 6);
    expect(costs.outputTokenCostUSD).toBeCloseTo(0.01, 6);
    expect(costs.totalTokenCostUSD).toBeCloseTo(0.03, 6);
  });

  it("ignores reasoning costs when the model lacks reasoning pricing", async () => {
    const usage: VercelUsage = {
      inputTokens: 1_000,
      outputTokens: 500,
      reasoningTokens: 200,
      totalTokens: 1_500,
      cachedInputTokens: 0,
    };

    const costs = await client.estimateCostUSD({
      modelId: "openai/o1",
      usage: usage,
    });

    expect(costs.reasoningTokenCostUSD).toBeUndefined();
    expect(costs.inputTokenCostUSD).toBeCloseTo(0.015, 6);
    expect(costs.outputTokenCostUSD).toBeCloseTo(0.03, 6);
    expect(costs.totalTokenCostUSD).toBeCloseTo(0.045, 6);
  });

  it("returns contextual hints for AI SDK model ids", async () => {
    const usage: VercelUsage = {
      inputTokens: 3_200,
      outputTokens: 400,
      totalTokens: 3_600,
      cachedInputTokens: 0,
    };

    const details = await client.describeModel({
      modelId: "openai/gpt-5",
      usage: usage,
    });

    expect(details.model?.id).toBe("openai/gpt-5");
    expect(details.limit?.context).toBe(200_000);
    expect(details.hints?.supportsReasoning).toBe(false);
  });
});
