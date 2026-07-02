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

- **Multi-source catalog**: Auto-fetches from OpenRouter, models.dev, or Vercel AI Gateway with built-in caching
- **Simple API**: `computeCostUSD`, `getModelData`, `getContextLimits`, `getContextHealth`, `countTokens`, `estimateCostUSD`
- **Strong TypeScript**: Typed DTOs, usage objects, helper return values, and dynamic model IDs as strings
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

Token counting helpers (`countTokens` and `estimateCostUSD`) load the tokenizer package on demand:

```bash
npm install tokenlens @tokenlens/tokenizer
# or
pnpm add tokenlens @tokenlens/tokenizer
```

TokenLens requires Node.js 20+ or a Fetch-compatible runtime for hosted catalogs.

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
- `catalog`: `"auto" | "openrouter" | "models.dev" | "vercel"`, a custom `SourceProviders` object, or a custom async `CatalogSource` (default: `"openrouter"`; `"auto"` is an alias for the same OpenRouter catalog)
- `overrides`: Patch-style `CatalogOverrides` merged over the base catalog. Use this for local price, limit, or provider metadata corrections while preserving hosted metadata.
- `ttlMs`: Cache TTL in milliseconds (default: 24 hours)
- `cache`: Custom cache adapter with `{ get(key), set(key, entry), delete?(key) }` methods where `entry` is `{ value: SourceProviders; expiresAt: number }` (default: in-memory cache), or `false` to disable TokenLens caching entirely
- `cacheKey`: Custom cache key for the catalog (default: `tokenlens:v2:{catalog}`)
- `fetch`: Custom fetch implementation
- `signal`: Abort signal passed to hosted or async catalog fetches
- `timeoutMs`: Timeout for hosted or async catalog fetches
- `staleIfError`: Return the last cached catalog when refresh fails (default: `true`)
- `sourceOptions`: Source-specific loader options, such as `{ vercel: { includeEndpointDetails: true, endpointConcurrency: 2 } }`
- `tokenizer`: Optional token counting function; pass `false` to disable implicit `@tokenlens/tokenizer` loading

### Standalone Helpers

The root helpers accept the same model arguments plus `TokenlensOptions`:

```ts
import { computeCostUSD, createTokenlens } from "tokenlens";

await computeCostUSD({
  catalog: "models.dev",
  modelId: "openai/gpt-4o-mini",
  usage: { input_tokens: 1_000, output_tokens: 200 },
});

const tokenlens = createTokenlens({
  catalog: "vercel",
  sourceOptions: {
    vercel: { includeEndpointDetails: true },
  },
  ttlMs: 10 * 60 * 1000,
});

await computeCostUSD({
  tokenlens,
  modelId: "openai/gpt-4o-mini",
  usage: { input_tokens: 1_000, output_tokens: 200 },
});
```

Primitive options reuse a keyed shared client. For custom catalogs, caches, fetchers, tokenizers, or overrides, create a `Tokenlens` instance and pass it as `tokenlens` so reuse is explicit.

### Methods

#### `getModelData(args)`

Get full model metadata including pricing, limits, and provider information.

```ts
const model = await tokenlens.getModelData({
  modelId: "gpt-4o-mini",
  provider: "openai", // optional when modelId already includes provider
});
```

**Returns:** `Promise<SourceModel>`; throws `TokenlensError.ModelNotFound` when the model cannot be resolved, or `TokenlensError.AmbiguousModelId` when a bare model id matches multiple providers.

#### `tryGetModelData(args)`

Return model metadata when available, or `undefined` when lookup fails.

```ts
const model = await tokenlens.tryGetModelData({
  modelId: "openai/gpt-4o-mini",
});
```

**Returns:** `Promise<SourceModel | undefined>`

#### `listProviders()`

List providers from the active cached catalog.

```ts
const providers = await tokenlens.listProviders();
```

**Returns:** `Promise<SourceProvider[]>`

#### `listModels(args?)`

List models from the active cached catalog, optionally filtering by provider and search text.

```ts
const models = await tokenlens.listModels({
  provider: "openai",
  search: "gpt-4o",
});
```

**Returns:** `Promise<SourceModel[]>`

#### `computeCostUSD(args)`

Calculate token costs in USD based on actual usage.

```ts
const costs = await tokenlens.computeCostUSD({
  modelId: "gpt-4o-mini",
  provider: "openai", // optional when modelId already includes provider
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
  provider: "openai", // optional when modelId already includes provider
  data: "Write a story about a robot",
});

console.log(`Estimated cost: $${estimate.totalTokenCostUSD.toFixed(6)}`);
console.log(`Input tokens: ${estimate.inputTokens}`);
```

**Returns:** `Promise<TokenCosts & { inputTokens: number }>`

#### `countTokens(args)`

Count tokens in text for a given model.

By default this loads `@tokenlens/tokenizer` when it is installed. You can also inject your own tokenizer function or import tokenizers directly from `tokenlens/tokenizer`.

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
  modelId: "gpt-4o-mini",
  provider: "openai", // optional when modelId already includes provider
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
  modelId: "gpt-4o-mini",
  provider: "openai", // optional when modelId already includes provider
  usage: {
    input_tokens: 50000,
    output_tokens: 10000,
  }
});

if (health) {
  console.log(`Status: ${health.status}`); // "healthy" | "warning" | "critical"
  console.log(`Used: ${health.usedPercentage.toFixed(1)}%`);
  console.log(`Remaining: ${health.remainingTokens} tokens`);
}
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

### Using catalog sources

```ts
import { Tokenlens } from "tokenlens";

// Use models.dev instead of OpenRouter
const tokenlens = new Tokenlens({
  catalog: "models.dev"
});

// Or provide your own user-authored catalog
const customCatalog = {
  openai: {
    id: "openai",
    models: {
      "gpt-custom": {
        id: "gpt-custom",
        canonical_id: "gpt-custom",
        name: "Custom GPT",
        // ... model metadata
      }
    }
  }
};

const customTokenlens = new Tokenlens({
  catalog: customCatalog
});

// Or provide an async catalog source that you own
const privateSource = {
  id: "private-registry",
  cacheKey: "tokenlens:private-registry",
  async load({ fetch = globalThis.fetch, signal } = {}) {
    const response = await fetch("https://example.com/models.json", { signal });
    return response.json();
  },
};

const privateTokenlens = new Tokenlens({
  catalog: privateSource,
  timeoutMs: 3_000,
  staleIfError: true,
});

// Or patch prices/limits on top of a hosted catalog
const pricedTokenlens = new Tokenlens({
  catalog: "openrouter",
  overrides: {
    openai: {
      models: {
        "openai/gpt-4o-mini": {
          cost: { input: 1, output: 2 },
        },
      },
    },
  },
});
```

### Custom cache adapter

```ts
import { Tokenlens } from "tokenlens";
import type { CacheAdapter, CacheEntry } from "tokenlens";

const redisCache: CacheAdapter = {
  async get(key: string) {
    const data = await redis.get(key);
    return data ? (JSON.parse(data) as CacheEntry) : undefined;
  },
  async set(key: string, entry: CacheEntry) {
    await redis.set(key, JSON.stringify(entry));
  },
  async delete(key: string) {
    await redis.del(key);
  },
};

const tokenlens = new Tokenlens({
  cache: redisCache,
  ttlMs: 60 * 60 * 1000, // 1 hour
});
```

Set `cache: false` or `ttlMs: 0` when you want TokenLens to make a fresh catalog request on every call and never return stale TokenLens cache entries.

### Tokenizer injection

```ts
import { Tokenlens } from "tokenlens";

const tokenlens = new Tokenlens({
  tokenizer: ({ data }) => data.trim().split(/\s+/).filter(Boolean).length,
});

const estimate = await tokenlens.estimateCostUSD({
  modelId: "openai/gpt-4o-mini",
  data: "Estimate this prompt before sending it",
});
```

Inject a tokenizer when your app already owns token counting. Install `@tokenlens/tokenizer` when you want TokenLens to load the optional tokenizer package for you.

## Type Exports

```ts
import type {
  Usage,
  SourceModel,
  SourceProvider,
  SourceProviders,
  TokenCosts,
  TokenlensOptions,
  CatalogOverrides,
  CacheAdapter,
  CacheEntry,
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
        canonical_id: "test-model",
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

## Migrating from v1

TokenLens v2 intentionally removed the bundled static catalog and legacy sync helpers. Start with the codemod, then finish any TODOs it leaves for app-specific budgeting or registry logic:

```bash
npx @tokenlens/codemod v2 src
npx @tokenlens/codemod v2 src --write
```

## Further Reading

- [Migration Guide (v1 to v2)](https://github.com/xn1cklas/tokenlens/blob/HEAD/apps/www/content/docs/migrations/migration-v1-to-v2.mdx)
- [Glossary](https://github.com/xn1cklas/tokenlens/blob/HEAD/apps/www/content/docs/glossary.mdx)
- [Sources & Caching](https://github.com/xn1cklas/tokenlens/blob/HEAD/apps/www/content/docs/sources-and-caching.mdx)
- [Testing Guide](https://github.com/xn1cklas/tokenlens/blob/HEAD/apps/www/content/docs/testing.mdx)

## License

MIT
