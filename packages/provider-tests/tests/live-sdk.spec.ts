import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { describe, expect, it } from "vitest";
import { createTestClient } from "./test-catalog.js";

const describeLive =
  process.env["RUN_LIVE_TESTS"] === "1" ? describe : describe.skip;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required when RUN_LIVE_TESTS=1`);
  }
  return value;
}

describeLive("live provider SDK usage", () => {
  it("captures and costs live OpenAI SDK usage", async () => {
    const client = new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });
    const tokenlens = createTestClient();

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Reply with the word ok." }],
      max_tokens: 16,
    });

    expect(response.usage?.prompt_tokens).toBeGreaterThan(0);
    expect(response.usage?.completion_tokens).toBeGreaterThan(0);

    const costs = await tokenlens.computeCostUSD({
      modelId: "gpt-4o-mini",
      provider: "openai",
      usage: response.usage ?? {},
    });

    expect(costs.totalTokenCostUSD).toBeGreaterThan(0);
  }, 30_000);

  it("captures and costs live Anthropic SDK usage", async () => {
    const client = new Anthropic({ apiKey: requireEnv("ANTHROPIC_API_KEY") });
    const tokenlens = createTestClient();

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 16,
      messages: [{ role: "user", content: "Reply with the word ok." }],
    });

    expect(response.usage.input_tokens).toBeGreaterThan(0);
    expect(response.usage.output_tokens).toBeGreaterThan(0);

    const costs = await tokenlens.computeCostUSD({
      modelId: "claude-3-5-sonnet-20241022",
      usage: response.usage,
    });

    expect(costs.totalTokenCostUSD).toBeGreaterThan(0);
  }, 30_000);
});
