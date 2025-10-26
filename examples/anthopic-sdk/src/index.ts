import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import {
  computeCostUSD,
  countTokens,
  createTokenlens,
  estimateCostUSD,
  getContextHealth,
} from "tokenlens";

async function main(): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("❌ Missing ANTHROPIC_API_KEY environment variable.");
    process.exitCode = 1;
    return;
  }

  const client = new Anthropic({ apiKey });
  const _tokenlens = createTokenlens();

  console.log("🎯 TokenLens Anthropic SDK Example\n");
  console.log("=".repeat(60));

  // Example 1: Estimate cost before API call
  console.log("\n📊 Example 1: Pre-flight Cost Estimation");
  console.log("-".repeat(60));

  const prompt = "List three benefits of using Tokenlens with AI applications.";

  const estimate = await estimateCostUSD({
    modelId: "claude-sonnet-4-5",
    data: prompt,
  });

  console.log(`Prompt: "${prompt}"`);
  console.log(`Estimated tokens: ${estimate.inputTokens}`);
  console.log(`Estimated cost: $${estimate.totalTokenCostUSD.toFixed(6)}`);

  // Example 2: Count tokens locally with Anthropic API
  console.log("\n🔢 Example 2: Anthropic Token Counting");
  console.log("-".repeat(60));

  const localCount = await countTokens({
    modelId: "claude-sonnet-4-5",
    data: prompt,
  });
  console.log(`Tokens (Anthropic API): ${localCount}`);

  // Example 3: Actual API call with full cost tracking
  console.log("\n💬 Example 3: API Call with Cost & Cache Tracking");
  console.log("-".repeat(60));

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 200,
    messages: [{ role: "user", content: prompt }],
  });

  const answer = response.content[0];
  if (answer?.type === "text") {
    console.log(`Response: "${answer.text.substring(0, 100)}..."`);
  }

  const { usage } = response;
  if (usage) {
    const costs = await computeCostUSD({
      modelId: "claude-3-5-sonnet-20241022",
      usage: {
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        cache_read_tokens: usage.cache_read_input_tokens || 0,
        cache_write_tokens: usage.cache_creation_input_tokens || 0,
      },
    });

    console.log(`\nActual usage:`);
    console.log(`  Input tokens:       ${usage.input_tokens}`);
    console.log(`  Output tokens:      ${usage.output_tokens}`);
    console.log(`  Cache reads:        ${usage.cache_read_input_tokens || 0}`);
    console.log(
      `  Cache writes:       ${usage.cache_creation_input_tokens || 0}`,
    );
    console.log(`\nCost breakdown:`);
    console.log(`  Input cost:       $${costs.inputTokenCostUSD?.toFixed(6)}`);
    console.log(`  Output cost:      $${costs.outputTokenCostUSD?.toFixed(6)}`);
    console.log(
      `  Cache read cost:  $${costs.cacheReadTokenCostUSD?.toFixed(6) || "0.000000"}`,
    );
    console.log(
      `  Cache write cost: $${costs.cacheWriteTokenCostUSD?.toFixed(6) || "0.000000"}`,
    );
    console.log(`  Total cost:       $${costs.totalTokenCostUSD?.toFixed(6)}`);
  }

  // Example 4: Context health monitoring
  console.log("\n🏥 Example 4: Context Health Monitoring");
  console.log("-".repeat(60));

  if (usage) {
    const health = await getContextHealth({
      modelId: "claude-3-5-sonnet-20241022",
      usage: {
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
      },
    });

    if (health) {
      console.log(
        `Context window: ${health.totalTokens.toLocaleString()} tokens`,
      );
      console.log(
        `Used: ${health.usedTokens.toLocaleString()} (${health.usedPercentage.toFixed(1)}%)`,
      );
      console.log(
        `Remaining: ${health.remainingTokens.toLocaleString()} (${health.remainingPercentage.toFixed(1)}%)`,
      );
      console.log(
        `Status: ${health.status.toUpperCase()} ${getHealthEmoji(health.status)}`,
      );
    }
  }

  // Example 5: Simulate long conversation
  console.log("\n📚 Example 5: Long Conversation Simulation");
  console.log("-".repeat(60));

  const conversation = Array.from({ length: 20 }, (_, i) => ({
    input: `User question ${i + 1}: Tell me about topic ${i + 1}`,
    output: `Assistant response ${i + 1}: Here is information about topic ${i + 1}...`,
  }));

  let conversationInputTokens = 0;
  let conversationOutputTokens = 0;

  for (const turn of conversation) {
    const inputTokens = await countTokens({
      modelId: "claude-sonnet-4-5",
      data: turn.input,
    });
    const outputTokens = await countTokens({
      modelId: "claude-sonnet-4-5",
      data: turn.output,
    });
    conversationInputTokens += inputTokens || 0;
    conversationOutputTokens += outputTokens || 0;
  }

  const conversationHealth = await getContextHealth({
    modelId: "claude-3-5-sonnet",
    usage: {
      input_tokens: conversationInputTokens,
      output_tokens: conversationOutputTokens,
    },
  });

  const conversationCost = await computeCostUSD({
    modelId: "claude-3-5-sonnet-20241022",
    usage: {
      input_tokens: conversationInputTokens,
      output_tokens: conversationOutputTokens,
    },
  });

  console.log(`Conversation turns: ${conversation.length}`);
  console.log(
    `Total input tokens: ${conversationInputTokens.toLocaleString()}`,
  );
  console.log(
    `Total output tokens: ${conversationOutputTokens.toLocaleString()}`,
  );
  console.log(`Total cost: $${conversationCost.totalTokenCostUSD?.toFixed(4)}`);

  if (conversationHealth) {
    console.log(
      `\nContext health: ${conversationHealth.status.toUpperCase()} ${getHealthEmoji(conversationHealth.status)}`,
    );
    console.log(
      `Remaining capacity: ${conversationHealth.remainingPercentage.toFixed(1)}%`,
    );
  }

  console.log(`\n${"=".repeat(60)}`);
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
