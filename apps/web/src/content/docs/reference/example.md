---
title: API Reference
description: Complete API reference for TokenLens
---

# API Reference

For the complete and up-to-date API reference, please visit the [GitHub repository](https://github.com/xn1cklas/tokenlens).

## Core Functions

### `computeCostUSD(options)`

Computes the USD cost for a given model and usage.

```ts
import { computeCostUSD } from "tokenlens";

const cost = await computeCostUSD({
  modelId: "openai/gpt-4o-mini",
  usage: { inputTokens: 1000, outputTokens: 200 },
});
```

### `describeModel(options)`

Returns detailed model information including limits and costs.

```ts
import { describeModel } from "tokenlens";

const details = await describeModel({
  modelId: "anthropic/claude-3-5-sonnet",
});
```

### `getContextLimits(options)`

Returns context window limits for a model.

```ts
import { getContextLimits } from "tokenlens";

const limits = await getContextLimits({
  modelId: "openai/gpt-4o",
});
```

### `createTokenlens(options)`

Creates a custom Tokenlens instance with advanced configuration.

```ts
import { createTokenlens } from "tokenlens";

const tokenlens = createTokenlens({
  sources: ["openrouter"],
  ttlMs: 60_000,
});
```

## Types

### `Usage`

Token usage object in various formats.

```ts
type Usage = {
  inputTokens?: number;
  outputTokens?: number;
  // ... and more variants
};
```

### `TokenCosts`

Cost breakdown in USD.

```ts
type TokenCosts = {
  inputCostUSD?: number;
  outputCostUSD?: number;
  totalTokenCostUSD?: number;
};
```

### `ModelDetails`

Complete model metadata.

```ts
type ModelDetails = {
  id: string;
  name: string;
  provider: { id: string; name: string };
  limit?: { context?: number; output?: number };
  cost?: { input?: number; output?: number };
};
```

## Learn More

- [GitHub Repository](https://github.com/xn1cklas/tokenlens)
- [Full Documentation](https://github.com/xn1cklas/tokenlens/tree/v2/docs)
- [Examples](https://github.com/xn1cklas/tokenlens/tree/v2/examples)
