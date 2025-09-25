import "dotenv/config";

import Anthropic from "@anthropic-ai/sdk";
import { createTokenlens } from "tokenlens";

async function main(): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Missing ANTHROPIC_API_KEY environment variable.");
    process.exitCode = 1;
    return;
  }

  const client = new Anthropic({ apiKey });
  const tokenlens = createTokenlens();

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content:
          "List three benefits of using Tokenlens with multiple AI providers.",
      },
    ],
  });

  const answer = response.content?.[0];
  if (answer?.type === "text") {
    console.log("Model response:\n", answer.text);
  }

  const { usage } = response;
  if (!usage) {
    console.error("No usage payload returned by Anthropic.");
    return;
  }

  const totalTokens = usage.input_tokens + usage.output_tokens;

  const costs = await tokenlens.computeCostUSD({
    modelId: "anthropic:claude-3-5-sonnet-20241022",
    usage: {
      input_tokens: usage.input_tokens,
      completion_tokens: usage.output_tokens,
      total_tokens: Number.isFinite(totalTokens) ? totalTokens : undefined,
      cache_read_tokens: usage.cache_read_input_tokens,
      cache_write_tokens: usage.cache_read_input_tokens,
    },
  });

  const limit = await tokenlens.getContextLimits({
    modelId: "anthropic:claude-3-5-sonnet-20241022",
  });
  const remainingContext =
    typeof limit?.context === "number" && Number.isFinite(totalTokens)
      ? Math.max(limit.context - totalTokens, 0)
      : undefined;

  console.log("\nUsage from Anthropic:", usage);
  console.log("\nEstimated costs (USD):", costs);
  console.log("\nContext window (tokens):", limit);
  console.log("Remaining context tokens:", remainingContext);
}

void main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
