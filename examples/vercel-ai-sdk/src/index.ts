import "dotenv/config";

import { generateText } from "ai";
import { createClient } from "tokenlens";
import { openai } from "@ai-sdk/openai";

async function main(): Promise<void> {
  const apiKey = process.env.AI_SDK_OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Missing AI_SDK_OPENAI_API_KEY environment variable.");
    process.exitCode = 1;
    return;
  }

  const tokenlens = createClient();

  const response = await generateText({
    model: openai("gpt-5"),
    system: "You are a helpful assistant.",
    prompt: "Summarize why token usage tracking matters for AI apps.",
  });

  const { usage } = response;
  if (!usage) {
    console.error("No usage information returned by AI SDK.");
    return;
  }

  const inputTokens = usage.inputTokens ?? 0;
  const outputTokens = usage.outputTokens ?? 0;
  const totalTokens =
    usage.totalTokens ??
    (Number.isFinite(inputTokens + outputTokens)
      ? inputTokens + outputTokens
      : undefined);

  const costs = await tokenlens.getTokenCosts({
    modelId: "openai:gpt-5",
    usage: {
      input_tokens: inputTokens,
      completion_tokens: outputTokens,
      total_tokens: totalTokens,
      reasoning_tokens: usage.reasoningTokens,
    },
  });

  const limit = await tokenlens.getLimit({ modelId: "openai:gpt-4o-mini" });
  const remainingContext =
    typeof limit?.context === "number" && typeof totalTokens === "number"
      ? Math.max(limit.context - totalTokens, 0)
      : undefined;

  console.log("Model response:\n", response.text);
  console.log("\nUsage from AI SDK:", usage);
  console.log("\nEstimated costs (USD):", costs);
  console.log("\nContext window (tokens):", limit);
  console.log("Remaining context tokens:", remainingContext);
}

void main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
