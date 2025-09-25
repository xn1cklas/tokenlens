import "dotenv/config";

import OpenAI from "openai";
import { createTokenlens } from "tokenlens";

async function main(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Missing OPENAI_API_KEY environment variable.");
    process.exitCode = 1;
    return;
  }

  const client = new OpenAI({ apiKey });
  const tokenlens = createTokenlens();

  const completion = await client.responses.create({
    model: "gpt-4o-mini",
    input:
      "Explain how Tokenlens can help manage AI usage costs in two sentences.",
  });

  const outputText = completion.output_text;
  if (outputText) {
    console.log(
      "Model response:\n",
      Array.isArray(outputText) ? outputText.join("\n") : outputText,
    );
  }

  const { usage } = completion;
  if (!usage) {
    console.error("No usage information returned by OpenAI Responses API.");
    return;
  }

  const costs = await tokenlens.computeCostUSD({
    modelId: "openai:gpt-4o-mini",
    usage: {
      input_tokens: usage.input_tokens,
      completion_tokens: usage.output_tokens,
      total_tokens: usage.total_tokens,
      reasoning_tokens: usage.output_tokens_details?.reasoning_tokens,
      cache_read_tokens: usage.input_tokens_details?.cached_tokens,
    },
  });

  const limit = await tokenlens.getContextLimits({
    modelId: "openai:gpt-4o-mini",
  });
  const combinedMax = limit?.context;
  const remainingContext =
    typeof combinedMax === "number" && typeof usage.total_tokens === "number"
      ? Math.max(combinedMax - usage.total_tokens, 0)
      : undefined;

  console.log("\nUsage from OpenAI Responses API:", usage);
  console.log("\nEstimated costs (USD):", costs);
  console.log("\nContext window (tokens):", limit);
  console.log("Remaining context tokens:", remainingContext);
}
void main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
