import { describe, expect, it } from "vitest";
import type OpenAI from "openai";
import { createTestClient } from "./test-catalog.js";
import { getContextHealth, countTokens } from "tokenlens";

type CompletionUsage = OpenAI.CompletionUsage;

describe("OpenAI SDK - computeCostUSD()", () => {
  it("computes costs from chat completion with reasoning tokens", async () => {
    const tokenlens = createTestClient();

    // Simulate OpenAI SDK response usage
    const usage: CompletionUsage = {
      prompt_tokens: 1_200,
      completion_tokens: 600,
      total_tokens: 1_800,
      completion_tokens_details: {
        reasoning_tokens: 120,
        accepted_prediction_tokens: 0,
        rejected_prediction_tokens: 0,
      },
    };

    // Integration pattern:
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // const response = await openai.chat.completions.create({ model: "gpt-5", ... });
    // const usage = response.usage;

    const costs = await tokenlens.computeCostUSD({
      modelId: "gpt-5",
      usage: {
        input_tokens: usage.prompt_tokens,
        output_tokens: usage.completion_tokens,
        reasoning_tokens: usage.completion_tokens_details?.reasoning_tokens,
      },
    });

    expect(costs.inputTokenCostUSD).toBeCloseTo(0.036, 6); // 1200 * 30 / 1M
    expect(costs.outputTokenCostUSD).toBeCloseTo(0.036, 6); // 600 * 60 / 1M
    expect(costs.reasoningTokenCostUSD).toBeCloseTo(0.0144, 6); // 120 * 120 / 1M
    expect(costs.totalTokenCostUSD).toBeCloseTo(0.0864, 6);
  });

  it("computes costs with prompt caching", async () => {
    const tokenlens = createTestClient();

    const usage: CompletionUsage = {
      prompt_tokens: 1_000,
      completion_tokens: 500,
      total_tokens: 1_500,
      prompt_tokens_details: {
        cached_tokens: 300,
        audio_tokens: 0,
      },
    };

    const costs = await tokenlens.computeCostUSD({
      modelId: "gpt-5",
      usage: {
        input_tokens: usage.prompt_tokens,
        output_tokens: usage.completion_tokens,
        cache_read_tokens: usage.prompt_tokens_details?.cached_tokens,
      },
    });

    expect(costs.inputTokenCostUSD).toBeCloseTo(0.03, 6);
    expect(costs.outputTokenCostUSD).toBeCloseTo(0.03, 6);
    expect(costs.cacheReadTokenCostUSD).toBeCloseTo(0.0018, 6);
  });
});

describe("OpenAI SDK - estimateCostUSD()", () => {
  it("estimates costs before making API call", async () => {
    const tokenlens = createTestClient();
    const prompt = "Write a comprehensive analysis of AI token economics";

    const estimate = await tokenlens.estimateCostUSD({
      modelId: "gpt-5",
      data: prompt,
    });

    expect(estimate.inputTokens).toBeGreaterThan(0);
    expect(estimate.inputTokenCostUSD).toBeGreaterThan(0);
    expect(estimate.totalTokenCostUSD).toBe(estimate.inputTokenCostUSD);
  });
});

describe("OpenAI SDK - countTokens()", () => {
  it("counts tokens for prompt text", async () => {
    const tokenlens = createTestClient();
    const text = "Hello, world! This is a test message.";

    const tokens = await tokenlens.countTokens({
      modelId: "gpt-5",
      data: text,
    });

    expect(tokens).toBeGreaterThan(0);
    expect(tokens).toBeLessThan(20);
  });

  it("works with standalone function", async () => {
    const text = "Count these tokens";
    const tokens = await countTokens({
      modelId: "gpt-5",
      data: text,
    });

    expect(tokens).toBeGreaterThan(0);
  });
});

describe("OpenAI SDK - getModelData()", () => {
  it("retrieves full model metadata", async () => {
    const tokenlens = createTestClient();

    const model = await tokenlens.getModelData({
      modelId: "gpt-5",
    });

    expect(model?.id).toBe("openai/gpt-5");
    expect(model?.name).toBe("GPT-5");
    expect(model?.limit?.context).toBe(200_000);
    expect(model?.cost?.input).toBe(30);
    expect(model?.cost?.output).toBe(60);
    expect(model?.cost?.reasoning).toBe(120);
  });

  it("works with prefixed model ID", async () => {
    const tokenlens = createTestClient();

    const model = await tokenlens.getModelData({
      modelId: "openai/gpt-5",
    });

    expect(model?.id).toBe("openai/gpt-5");
  });
});

describe("OpenAI SDK - getContextLimits()", () => {
  it("retrieves context window limits", async () => {
    const tokenlens = createTestClient();

    const limits = await tokenlens.getContextLimits({
      modelId: "gpt-5",
    });

    expect(limits?.context).toBe(200_000);
    expect(limits?.input).toBe(200_000);
    expect(limits?.output).toBe(8_192);
  });
});

describe("OpenAI SDK - Context Health Monitoring", () => {
  it("monitors healthy context usage", async () => {
    const tokenlens = createTestClient();
    const model = await tokenlens.getModelData({ modelId: "gpt-5" });

    if (!model) throw new Error("Model not found");

    const health = await getContextHealth({
      modelId: model.id,
      usage: {
        input_tokens: 50_000,
        output_tokens: 10_000,
      },
    });

    expect(health).toBeDefined();
    expect(health?.totalTokens).toBe(200_000);
    expect(health?.usedTokens).toBe(60_000);
    expect(health?.remainingTokens).toBe(140_000);
    expect(health?.usedPercentage).toBe(30);
    expect(health?.status).toBe("healthy");
  });

  it("detects warning status at 75% usage", async () => {
    const tokenlens = createTestClient();
    const model = await tokenlens.getModelData({ modelId: "gpt-5" });

    if (!model) throw new Error("Model not found");

    const health = await getContextHealth({
      modelId: model.id,
      usage: {
        input_tokens: 140_000,
        output_tokens: 10_000,
      },
    });

    expect(health?.usedPercentage).toBe(75);
    expect(health?.status).toBe("warning");
  });

  it("detects critical status at 95% usage", async () => {
    const tokenlens = createTestClient();
    const model = await tokenlens.getModelData({ modelId: "gpt-5" });

    if (!model) throw new Error("Model not found");

    const health = await getContextHealth({
      modelId: model.id,
      usage: {
        input_tokens: 180_000,
        output_tokens: 10_000,
      },
    });

    expect(health?.usedPercentage).toBe(95);
    expect(health?.status).toBe("critical");
  });
});

describe("OpenAI SDK - Cache Management", () => {
  it("caches catalog data", async () => {
    const tokenlens = createTestClient();

    await tokenlens.getModelData({ modelId: "gpt-5" });
    await tokenlens.getModelData({ modelId: "gpt-5" });

    // Should reuse cached catalog
    const model = await tokenlens.getModelData({ modelId: "gpt-5" });
    expect(model?.id).toBe("openai/gpt-5");
  });

  it("invalidates cache when requested", async () => {
    const tokenlens = createTestClient();

    await tokenlens.getModelData({ modelId: "gpt-5" });
    await tokenlens.invalidate();
    const model = await tokenlens.getModelData({ modelId: "gpt-5" });

    expect(model?.id).toBe("openai/gpt-5");
  });

  it("refreshes catalog data", async () => {
    const tokenlens = createTestClient();

    await tokenlens.getModelData({ modelId: "gpt-5" });
    const refreshedCatalog = await tokenlens.refresh(true);

    expect(refreshedCatalog).toBeDefined();
    expect(refreshedCatalog["openai"]).toBeDefined();
  });
});
