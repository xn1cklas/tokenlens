---
title: Quick Start
description: Common usage patterns and examples
---

# Quick Start

## Basic cost estimation

```ts
import { computeCostUSD } from "tokenlens";

const cost = await computeCostUSD({
  modelId: "openai/gpt-4o-mini",
  usage: { inputTokens: 3_200, outputTokens: 400 },
});

console.log(`Total cost: $${cost.totalTokenCostUSD.toFixed(4)}`);
// Total cost: $0.0008
```

## Check context limits

```ts
import { getContextLimits } from "tokenlens";

const limits = await getContextLimits({
  modelId: "anthropic/claude-3-5-sonnet",
});

console.log(`Max context: ${limits?.context} tokens`);
// Max context: 200000 tokens
```

## Get model details

```ts
import { describeModel } from "tokenlens";

const details = await describeModel({
  modelId: "openai/gpt-4o",
});

console.log(details);
// {
//   id: "openai/gpt-4o",
//   name: "GPT-4o",
//   provider: { id: "openai", name: "OpenAI" },
//   limit: { context: 128000, output: 16384 },
//   cost: { input: 2.5, output: 10 }
// }
```

## With usage breakdown

```ts
import { describeModel } from "tokenlens";

const details = await describeModel({
  modelId: "openai/gpt-4o-mini",
  usage: {
    inputTokens: 1000,
    outputTokens: 200,
  },
});

console.log(details.costs);
// {
//   inputCostUSD: 0.00015,
//   outputCostUSD: 0.00012,
//   totalTokenCostUSD: 0.00027
// }
```

## Using with Vercel AI SDK

```ts
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { computeCostUSD } from "tokenlens";

const result = await streamText({
  model: openai("gpt-4o-mini"),
  prompt: "Write a haiku about TypeScript",
});

// After streaming completes
const usage = await result.usage;
const cost = await computeCostUSD({
  modelId: "openai/gpt-4o-mini",
  usage: {
    inputTokens: usage.promptTokens,
    outputTokens: usage.completionTokens,
  },
});

console.log(`Cost: $${cost.totalTokenCostUSD.toFixed(6)}`);
```

## Custom instance with multiple sources

```ts
import { createTokenlens } from "tokenlens";

const tokenlens = createTokenlens({
  sources: ["openrouter", "package"],
  ttlMs: 5 * 60 * 1000, // 5 minute cache
  loaders: {
    package: async () => ({
      custom: {
        id: "custom",
        source: "package",
        models: {
          "custom/model": {
            id: "custom/model",
            name: "Custom Model",
            cost: { input: 0.5, output: 1.5 },
            limit: { context: 32000 },
          },
        },
      },
    }),
  },
});

const cost = await tokenlens.computeCostUSD({
  modelId: "custom/model",
  usage: { inputTokens: 1000, outputTokens: 500 },
});
```

## Next steps

- [View full documentation on GitHub](https://github.com/xn1cklas/tokenlens/tree/v2/docs)
- [Integration guides](https://github.com/xn1cklas/tokenlens/tree/v2/docs/integrations)
- [API Reference](https://github.com/xn1cklas/tokenlens)

