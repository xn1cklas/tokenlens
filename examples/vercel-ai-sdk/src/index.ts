import "dotenv/config";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import {
  compactJson,
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

  const _tokenlens = createTokenlens();

  console.log("🎯 TokenLens + Vercel AI SDK Example\n");
  console.log("=".repeat(60));

  // Example 1: Simple completion with cost tracking
  console.log("\n💬 Example 1: Simple Completion");
  console.log("-".repeat(60));

  const prompt = "What are the key features of TokenLens?";

  const response = await generateText({
    model: openai("gpt-4o-mini"),
    prompt,
  });

  console.log(`Prompt: "${prompt}"`);
  console.log(`Response: "${response.text.substring(0, 80)}..."`);

  if (response.usage) {
    const costs = await computeCostUSD({
      modelId: "openai/gpt-4o-mini",
      usage: response.usage,
    });

    console.log(
      `\nUsage: ${response.usage.inputTokens} in + ${response.usage.outputTokens} out`,
    );
    console.log(`Cost: $${costs.totalTokenCostUSD?.toFixed(6)}`);
  }

  // Example 3: JSON mode with compaction savings
  console.log("\n📦 Example 3: JSON Mode with Compaction");
  console.log("-".repeat(60));

  const jsonResponse = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: "Generate a list of 5 programming languages with their types",
  });

  const jsonData = JSON.parse(jsonResponse.text);
  const compactData = compactJson(jsonData);

  const jsonTokens = await countTokens({
    modelId: "openai/gpt-4o-mini",
    data: jsonResponse.text,
  });
  const compactTokens = await countTokens({
    modelId: "openai/gpt-4o-mini",
    data: compactData,
  });
  const savings =
    (((jsonTokens || 0) - (compactTokens || 0)) / (jsonTokens || 1)) * 100;

  console.log(`JSON format: ${jsonTokens} tokens`);
  console.log(`Compact format: ${compactTokens} tokens`);
  console.log(`Savings: ${savings.toFixed(1)}% fewer tokens`);

  // Example 4: Multi-turn conversation with health monitoring
  console.log("\n🗣️ Example 4: Multi-turn Conversation");
  console.log("-".repeat(60));

  const conversation = [
    { role: "user" as const, content: "What is machine learning?" },
    {
      role: "assistant" as const,
      content: "ML is a type of AI that learns from data...",
    },
    { role: "user" as const, content: "Give me an example" },
    {
      role: "assistant" as const,
      content: "Image recognition is a common ML example...",
    },
  ];

  let totalInput = 0;
  let totalOutput = 0;

  for (const msg of conversation) {
    const tokens = await countTokens({
      modelId: "openai/gpt-4o",
      data: msg.content,
    });
    if (msg.role === "user") {
      totalInput += tokens || 0;
    } else {
      totalOutput += tokens || 0;
    }
  }

  const health = await getContextHealth({
    modelId: "openai/gpt-4o",
    usage: {
      input_tokens: totalInput,
      output_tokens: totalOutput,
    },
  });

  console.log(`Turns: ${conversation.length}`);
  console.log(`Total tokens: ${totalInput + totalOutput}`);
  if (health) {
    console.log(
      `Context used: ${health.usedPercentage.toFixed(1)}% ${getHealthEmoji(health.status)}`,
    );
    console.log(`Remaining: ${health.remainingTokens.toLocaleString()} tokens`);
  }

  // Example 5: Pre-flight cost estimation
  console.log("\n✈️ Example 5: Pre-flight Estimation");
  console.log("-".repeat(60));

  const largePrompt = `
    Analyze the following customer feedback and provide insights:
    ${Array.from({ length: 10 }, (_, i) => `"Customer ${i + 1}: Great product!"`).join("\n")}
  `;

  const estimate = await estimateCostUSD({
    modelId: "openai/gpt-4o",
    data: largePrompt,
  });

  console.log(`Estimated input tokens: ${estimate.inputTokens}`);
  console.log(`Estimated cost: $${estimate.totalTokenCostUSD.toFixed(6)}`);
  console.log(
    `Decision: ${estimate.totalTokenCostUSD > 0.01 ? "⚠️ High cost" : "✅ Proceed"}`,
  );

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
