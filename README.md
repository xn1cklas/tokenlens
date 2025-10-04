TokenLens
========

[![npm version](https://img.shields.io/npm/v/tokenlens.svg)](https://www.npmjs.com/package/tokenlens)
[![npm downloads](https://img.shields.io/npm/dm/tokenlens.svg)](https://www.npmjs.com/package/tokenlens)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

Typed model metadata and cost/context helpers for LLM applications. TokenLens provides a simple client that fetches model catalogs from multiple sources and offers utilities to answer: *Does this fit? What will it cost? How healthy is my context?*

Works seamlessly with Vercel AI SDK, OpenAI SDK, Anthropic SDK, and remains SDK-agnostic.

![TokenLens overview](https://raw.githubusercontent.com/xn1cklas/tokenlens/HEAD/assets/tokenlens.png)

## Highlights

- **Multi-source catalog**: Auto-fetches from OpenRouter or models.dev with built-in caching
- **Simple API**: `computeCostUSD`, `getModelData`, `getContextLimits`, `getContextHealth`, `countTokens`, `estimateCostUSD`
- **Strong TypeScript**: Full type safety for model IDs, usage objects, and return types
- **Automatic caching**: Configurable TTL with jitter to avoid cache stampedes
- **Provider/model resolution**: Supports `provider/model`, `model` only, or separate provider parameter

## Install

```bash
npm install tokenlens
# or
pnpm add tokenlens
# or
yarn add tokenlens
```

## Quick Start

```ts
import { Tokenlens } from "tokenlens";

const tokenlens = new Tokenlens();

// Get model metadata
const model = await tokenlens.getModelData({ 
  modelId: "openai/gpt-4o-mini" 
});

// Compute costs from usage
const costs = await tokenlens.computeCostUSD({
  modelId: "openai/gpt-4o-mini",
  usage: {
    input_tokens: 1000,
    output_tokens: 500,
    reasoning_tokens: 0,
    cacheReads: 0,
    cacheWrites: 0,
  }
});

console.log(`Total cost: $${costs.totalTokenCostUSD.toFixed(6)}`);

// Get context limits
const limits = await tokenlens.getContextLimits({ 
  modelId: "openai/gpt-4o-mini" 
});

console.log(`Context: ${limits?.context} tokens`);
```

## API Reference

### Constructor

```ts
const tokenlens = new Tokenlens(options?: TokenlensOptions);
```

**Options:**
- `catalog`: `"auto" | "openrouter" | "models.dev"` or custom `SourceProviders` object (default: `"auto"`)
- `ttlMs`: Cache TTL in milliseconds (default: 24 hours)
- `cache`: Custom cache adapter implementing `CacheAdapter` interface (default: in-memory cache)
- `cacheKey`: Custom cache key for the catalog (default: `tokenlens:v2:{catalog}`)

### Methods

#### `getModelData(args)`

Get full model metadata including pricing, limits, and provider information.

```ts
const model = await tokenlens.getModelData({
  modelId: "openai/gpt-4o-mini",
  provider?: "openai", // optional, useful when modelId doesn't include provider
});
```

**Returns:** `Promise<SourceModel | undefined>`

#### `computeCostUSD(args)`

Calculate token costs in USD based on actual usage.

```ts
const costs = await tokenlens.computeCostUSD({
  modelId: "openai/gpt-4o-mini",
  provider?: "openai", // optional
  usage: {
    input_tokens: 1000,
    output_tokens: 500,
    reasoning_tokens: 0,
    cacheReads: 0,
    cacheWrites: 0,
  }
});
```

**Returns:** `Promise<TokenCosts>`
```ts
{
  inputTokenCostUSD: number;
  outputTokenCostUSD: number;
  reasoningTokenCostUSD: number;
  cacheReadTokenCostUSD: number;
  cacheWriteTokenCostUSD: number;
  totalTokenCostUSD: number;
}
```

#### `estimateCostUSD(args)`

Estimate costs by counting tokens in text before making an API call.

```ts
const estimate = await tokenlens.estimateCostUSD({
  modelId: "gpt-4o", // can use short form or full provider/model
  provider?: "openai", // optional
  data: "Write a story about a robot",
});

console.log(`Estimated cost: $${estimate.totalTokenCostUSD.toFixed(6)}`);
console.log(`Input tokens: ${estimate.inputTokens}`);
```

**Returns:** `Promise<TokenCosts & { inputTokens: number }>`

#### `countTokens(args)`

Count tokens in text for a given model.

```ts
const tokens = await tokenlens.countTokens({
  modelId: "gpt-4o",
  data: "Hello, world!",
});

console.log(`Tokens: ${tokens}`);
```

**Returns:** `Promise<number | undefined>`

#### `getContextLimits(args)`

Get context, input, and output token limits for a model.

```ts
const limits = await tokenlens.getContextLimits({
  modelId: "openai/gpt-4o-mini",
  provider?: "openai", // optional
});

console.log(`Context: ${limits?.context}`);
console.log(`Input: ${limits?.input}`);
console.log(`Output: ${limits?.output}`);
```

**Returns:** `Promise<{ context?: number; input?: number; output?: number } | undefined>`

#### `getContextHealth(args)`

Calculate context window health metrics.

```ts
const health = await tokenlens.getContextHealth({
  modelId: "openai/gpt-4o-mini",
  provider?: "openai", // optional
  usage: {
    input_tokens: 50000,
    output_tokens: 10000,
  }
});

console.log(`Status: ${health.status}`); // "healthy" | "warning" | "critical"
console.log(`Used: ${health.usedPercentage.toFixed(1)}%`);
console.log(`Remaining: ${health.remainingTokens} tokens`);
```

**Returns:** Context health metrics including:
- `status`: `"healthy"` (<70%), `"warning"` (70-90%), or `"critical"` (>90%)
- `totalTokens`, `usedTokens`, `remainingTokens`
- `usedPercentage`, `remainingPercentage`

#### `refresh(force?)`

Manually refresh the catalog from the source.

```ts
const providers = await tokenlens.refresh(true); // force refresh
```

**Returns:** `Promise<SourceProviders>`

#### `invalidate()`

Clear the cached catalog.

```ts
await tokenlens.invalidate();
```

**Returns:** `Promise<void>`

## Model ID Formats

TokenLens supports multiple model ID formats:

```ts
// Full provider/model format
await tokenlens.getModelData({ modelId: "openai/gpt-4o-mini" });

// Separate provider parameter
await tokenlens.getModelData({ 
  modelId: "gpt-4o-mini", 
  provider: "openai" 
});

// Model only (searches across providers, may be ambiguous)
await tokenlens.getModelData({ modelId: "gpt-4o-mini" });
```

## Custom Configuration

### Using a custom catalog source

```ts
import { Tokenlens } from "tokenlens";

// Use models.dev instead of OpenRouter
const tokenlens = new Tokenlens({ 
  catalog: "models.dev" 
});

// Or provide your own catalog
const customCatalog = {
  openai: {
    id: "openai",
    models: {
      "gpt-custom": {
        id: "gpt-custom",
        name: "Custom GPT",
        // ... model metadata
      }
    }
  }
};

const customTokenlens = new Tokenlens({ 
  catalog: customCatalog 
});
```

### Custom cache adapter

```ts
import { Tokenlens, type CacheAdapter } from "tokenlens";

const redisCache: CacheAdapter = {
  async get(key: string) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },
  async set(key: string, value: any) {
    await redis.set(key, JSON.stringify(value));
  },
  async delete(key: string) {
    await redis.del(key);
  }
};

const tokenlens = new Tokenlens({ 
  cache: redisCache,
  ttlMs: 60 * 60 * 1000, // 1 hour
});
```

## Type Exports

```ts
import type {
  Usage,
  SourceModel,
  TokenCosts,
  TokenlensOptions,
  CacheAdapter,
  GatewayId,
} from "tokenlens";
```

## Testing

For testing, provide a custom catalog to avoid network calls:

```ts
import { Tokenlens } from "tokenlens";

const testCatalog = {
  openai: {
    id: "openai",
    models: {
      "test-model": {
        id: "test-model",
        name: "Test Model",
        limit: { context: 4096, output: 2048 },
        cost: { input: 1, output: 2 },
      }
    }
  }
};

const tokenlens = new Tokenlens({ 
  catalog: testCatalog 
});
```

## Further Reading

- [Migration Guide (v1 to v2)](docs/migrations/migration-v1-to-v2.md)
- [Glossary](docs/glossary.md)
- [Sources & Caching](docs/sources-and-caching.md)
- [Testing Guide](docs/testing.md)

## License

MIT
