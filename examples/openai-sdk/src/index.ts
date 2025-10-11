import "dotenv/config";
import OpenAI from "openai";
import {
  computeCostUSD,
  countTokens,
  createTokenlens,
  estimateCostUSD,
  getContextHealth,
} from "tokenlens";

async function main(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("❌ Missing OPENAI_API_KEY environment variable.");
    process.exitCode = 1;
    return;
  }

  const client = new OpenAI({ apiKey });
  const tokenlens = createTokenlens();

  console.log("🎯 TokenLens OpenAI SDK Example\n");
  console.log("=".repeat(60));

  // Example 1: Estimate cost BEFORE making API call
  console.log("\n📊 Example 1: Pre-flight Cost Estimation");
  console.log("-".repeat(60));

  const prompt = "Explain how token usage affects AI application costs.";

  const estimate = await estimateCostUSD({
    modelId: "gpt-4o",
    data: prompt,
  });

  console.log(`Prompt: "${prompt}"`);
  console.log(`Estimated input tokens: ${estimate.inputTokens}`);
  console.log(`Estimated cost: $${estimate.totalTokenCostUSD.toFixed(6)}`);

  // Example 2: Count tokens with local tokenizer (no API call)
  console.log("\n🔢 Example 2: Local Token Counting");
  console.log("-".repeat(60));

  const tokenCount = await countTokens({ modelId: "gpt-4o", data: prompt });
  console.log(`Tokens (local): ${tokenCount}`);

  // Example 3: Make actual API call and track costs
  console.log("\n💬 Example 3: Actual API Call with Cost Tracking");
  console.log("-".repeat(60));

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 150,
  });

  const response = completion.choices[0]?.message?.content || "";
  console.log(`Response: "${response.substring(0, 100)}..."`);

  const { usage } = completion;
  if (usage) {
    const costs = await computeCostUSD({
      modelId: "gpt-4o-mini",
      usage: {
        input_tokens: usage.prompt_tokens,
        output_tokens: usage.completion_tokens,
      },
    });

    console.log(`\nActual usage:`);
    console.log(`  Input tokens:  ${usage.prompt_tokens}`);
    console.log(`  Output tokens: ${usage.completion_tokens}`);
    console.log(`  Total tokens:  ${usage.total_tokens}`);
    console.log(`\nCost breakdown:`);
    console.log(`  Input cost:  $${costs.inputTokenCostUSD?.toFixed(6)}`);
    console.log(`  Output cost: $${costs.outputTokenCostUSD?.toFixed(6)}`);
    console.log(`  Total cost:  $${costs.totalTokenCostUSD?.toFixed(6)}`);
  }

  // Example 4: Monitor context health
  console.log("\n🏥 Example 4: Context Health Monitoring");
  console.log("-".repeat(60));

  const model = await tokenlens.getModelData({ modelId: "gpt-4o-mini" });

  if (usage && model) {
    const health = await getContextHealth({
      modelId: "gpt-4o",
      usage: {
        input_tokens: usage.prompt_tokens,
        output_tokens: usage.completion_tokens,
      },
    });

    if (health) {
      console.log(
        `Context window: ${health.totalTokens.toLocaleString()} tokens`,
      );
      console.log(
        `Used: ${health.usedTokens.toLocaleString()} tokens (${health.usedPercentage.toFixed(1)}%)`,
      );
      console.log(
        `Remaining: ${health.remainingTokens.toLocaleString()} tokens (${health.remainingPercentage.toFixed(1)}%)`,
      );
      console.log(
        `Status: ${health.status.toUpperCase()} ${getHealthEmoji(health.status)}`,
      );
    }
  }

  // Example 5: Multi-turn conversation tracking
  console.log("\n💬 Example 5: Multi-turn Conversation Tracking");
  console.log("-".repeat(60));

  const conversation = [
    { role: "user" as const, content: "What is machine learning?" },
    {
      role: "assistant" as const,
      content: "Machine learning is a subset of AI...",
    },
    { role: "user" as const, content: "Can you give an example?" },
  ];

  let totalCost = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  for (const msg of conversation) {
    const tokens = await countTokens({ modelId: "gpt-4o", data: msg.content });
    if (tokens) {
      if (msg.role === "user") {
        totalInputTokens += tokens;
      } else {
        totalOutputTokens += tokens;
      }
    }
  }

  const conversationCost = await computeCostUSD({
    modelId: "gpt-4o",
    usage: {
      input_tokens: totalInputTokens,
      output_tokens: totalOutputTokens,
    },
  });

  totalCost = conversationCost.totalTokenCostUSD || 0;

  console.log(`Conversation turns: ${conversation.length}`);
  console.log(`Total input tokens: ${totalInputTokens}`);
  console.log(`Total output tokens: ${totalOutputTokens}`);
  console.log(`Estimated cost: $${totalCost.toFixed(6)}`);

  console.log("\n" + "=".repeat(60));
  console.log("✅ Example completed successfully!");
}

function getHealthEmoji(status: string): string {
  switch (status) {
    case "healthy":
      return "💚";
    case "warning":
      return "⚠️";
    case "critical":
      return "🔴";
    default:
      return "";
  }
}

void main().catch((err) => {
  console.error("❌ Error:", err);
  process.exitCode = 1;
});
