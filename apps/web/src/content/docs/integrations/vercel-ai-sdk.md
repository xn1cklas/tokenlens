---
title: Vercel AI SDK Integration
description: Using TokenLens with the Vercel AI SDK
---

# Vercel AI SDK Integration Guide

Tokenlens integrates seamlessly with the Vercel AI SDK by accepting `LanguageModelV2` metadata. This guide shows you how to estimate costs from Vercel usage payloads.

## Installing dependencies

Install Tokenlens and the AI SDK provider packages you use:

```bash
pnpm add tokenlens @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/xai
```

> Tokenlens works with any provider supported by the Vercel AI SDK.

## Estimating cost from a Vercel usage payload

```ts
import { computeCostUSD } from "tokenlens";
import { openai } from "@ai-sdk/openai";

// Define a model via the AI SDK
const model = openai("gpt-4o-mini");

// Usage payload returned by the SDK
const usage = {
  inputTokens: 1_000,
  outputTokens: 400,
  totalTokens: 1_400,
};

const costs = await computeCostUSD({
  modelId: model.modelId,
  provider: model.provider ?? model.providerId,
  usage,
});

console.log(costs.totalTokenCostUSD);
```

Tokenlens normalizes provider ids that include namespaces (e.g., `openai.responses`) and understands the AI SDK usage fields (`inputTokens`, `outputTokens`, `totalTokens`).

## Custom Tokenlens instances

If you need to control sources or caching, create your own Tokenlens instance:

```ts
import { createTokenlens } from "tokenlens";
import { openai } from "@ai-sdk/openai";

const tokenlens = createTokenlens({
  sources: ["openrouter", "package"],
  loaders: {
    package: async () => testProviders,
  },
});

const model = openai("gpt-4o-mini");
const costs = await tokenlens.computeCostUSD({
  modelId: model.modelId,
  usage: { inputTokens: 1000, outputTokens: 200 },
});
```

## Testing integrations

Use Tokenlens' `package` source and fixture catalogs during tests:

```ts
import { createTokenlens } from "tokenlens";
import { testProviders } from "../fixtures/providers";

const tokenlens = createTokenlens({
  sources: ["package"],
  loaders: {
    package: async () => testProviders,
  },
  ttlMs: 0, // always refresh in tests
});
```

This isolates integration tests from external API fluctuations while ensuring Tokenlens still performs the same cost calculations as in production.

## Summary

- Tokenlens understands Vercel AI SDK model metadata (`modelId`, `provider`/`providerId`)
- Pass usage payloads directly to `computeCostUSD` or `describeModel`
- Customise sources, loaders, and caching via `createTokenlens` when needed

