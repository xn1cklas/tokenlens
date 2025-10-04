---
title: Welcome to TokenLens
description: Get started with TokenLens - typed model metadata for LLM applications
template: splash
hero:
  tagline: Typed model metadata and cost/context helpers for LLM applications
  actions:
    - text: Get Started
      link: /guides/getting-started/
      icon: right-arrow
      variant: primary
    - text: View on GitHub
      link: https://github.com/xn1cklas/tokenlens
      icon: external
---

import { Card, CardGrid } from '@astrojs/starlight/components';

## Features

<CardGrid>
  <Card title="Model Registry" icon="puzzle">
    Canonical model registry with alias resolution across multiple data sources (OpenRouter, models.dev)
  </Card>
  <Card title="Usage Normalization" icon="document">
    Understands common SDK payloads from OpenAI, Anthropic, Vercel AI SDK, and more
  </Card>
  <Card title="Cost Estimation" icon="rocket">
    Fast, accurate USD cost estimates based on provider pricing data
  </Card>
  <Card title="Context Management" icon="setting">
    Check context windows and token limits for any model
  </Card>
  <Card title="TypeScript First" icon="approve-check">
    Strong TypeScript support with autocomplete and type safety
  </Card>
  <Card title="SDK Agnostic" icon="seti:config">
    Works great with Vercel AI SDK and remains SDK-agnostic
  </Card>
</CardGrid>

## Quick Install

```bash
npm i tokenlens
```

## Example Usage

```ts
import { computeCostUSD, getContextLimits, describeModel } from "tokenlens";

// Get cost estimate
const cost = await computeCostUSD({
  modelId: "openai/gpt-4o-mini",
  usage: { inputTokens: 3_200, outputTokens: 400 },
});

// Get context limits
const limits = await getContextLimits({
  modelId: "anthropic/claude-3-5-sonnet",
});

// Get full model details
const details = await describeModel({
  modelId: "openai/gpt-4o",
  usage: { inputTokens: 1000, outputTokens: 200 },
});

console.log(`Cost: $${cost.totalTokenCostUSD.toFixed(4)}`);
console.log(`Max tokens: ${limits?.context}`);
console.log(details);
```

## Why TokenLens?

- **Consistent metadata**: Works with dynamic catalogs (OpenRouter, models.dev) plus local fixture data
- **Usage normalization**: Understands common SDK payloads from all major providers
- **Cost and context**: Quickly estimate USD costs and check context windows
- **Typed surface**: Ships DTOs for all metadata (`ModelDetails`, `TokenCosts`, etc.)

