# Getting Started with Tokenlens

This guide walks you through installing Tokenlens, calling the high-level helpers, and configuring your own `Tokenlens` instance when you need advanced control.

## 1. Installation

```bash
npm install tokenlens
# or
yarn add tokenlens
# or
pnpm add tokenlens
```

Tokenlens ships TypeScript types out of the box. Node.js 18+ (or a Fetch-compatible runtime) is required for the default OpenRouter loader.

## 2. Quick usage (standalone helpers)

If you just need cost and context utilities, import the top-level helpers. They automatically reuse a lazily-created Tokenlens instance configured with the default `openrouter` source.

```ts
import {
  describeModel,
  computeCostUSD,
  getContextLimits,
} from "tokenlens";

const usage = { inputTokens: 2_000, outputTokens: 500 };

const details = await describeModel({
  modelId: "openai/gpt-4o-mini",
});

console.log(details?.id);             // "openai/gpt-4o-mini"
console.log(details?.limit?.context); // combined token limit
console.log(details?.cost?.input);    // per-million pricing hints
```

> If you call `describeModel` without a `usage` payload, the `costs` field is `undefined`. Use `details.model?.cost` for the per‑million pricing hints in that case.

## 3. Create a configured instance

Use `createTokenlens` when you need to override sources, caches, or loaders:

```ts
import { createTokenlens, type TokenlensOptions } from "tokenlens";

const options: TokenlensOptions = {
  sources: ["openrouter", "package"],
  ttlMs: 10 * 60 * 1000,           // refresh provider data every 10 minutes
  cacheKey: "tokenlens:openrouter", // optional custom cache key (helps when multiple instances coexist)
  loaders: {
    package: async () => ({
      demo: {
        id: "demo",
        source: "package",
        models: {
          "demo/chat": {
            id: "demo/chat",
            name: "Chat Demo",
            cost: { input: 1, output: 1 },
            limit: { context: 128_000, output: 4_096 },
          },
        },
      },
    }),
  },
};

const tokenlens = createTokenlens(options);

const cost = await tokenlens.computeCostUSD({
  modelId: "demo/chat",
  usage: { input_tokens: 400, output_tokens: 200 },
});

console.log(cost.totalTokenCostUSD);
```

### Controlling caching
- **TTL**: Use `ttlMs` to set how long provider catalogs should live in the cache.
- **Cache adapters**: supply `cache` with your own `{ get, set, delete }` implementation to back the cache with Redis or another storage.
- **No caching**: set `ttlMs: 0` to force a reload on every call (useful for tests).

## 4. Standalone vs. custom instance

| Use case                                          | Recommended approach                                                                |
| ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Default OpenRouter data and minimal setup         | Call the top-level helpers (`computeCostUSD`, `describeModel`, `getContextLimits`). |
| Multiple sources, fixture data, or custom caching | Create your own instance via `createTokenlens` and reuse it within your app.        |
| Need directive control over provider data merging | Provide explicit `sources` and `loaders` in `createTokenlens`.                      |

## 5. TypeScript types

Tokenlens re-exports the primary DTOs so you can import them from the root package:

```ts
import type { Usage, ModelDetails, TokenCosts, TokenlensOptions } from "tokenlens";

const describe = await describeModel({
  modelId: "openai/gpt-4o-mini",
  usage: { inputTokens: 1_000, outputTokens: 200 } satisfies Usage,
});
```

`ModelDetails` is simply the resolved `SourceModel` entry (or `undefined` when the model is missing). Use `computeCostUSD` and `getContextLimits` for derived information.

## 6. Next steps
- Configure advanced behaviour: [Sources & Caching](./sources-and-caching.md)
- Integrate with the Vercel AI SDK: [Integration Guide](./integrations/vercel-ai-sdk.md)
- Explore DTO terminology: [Glossary](./glossary.md)
- Migrating from v1: [Migration Guide](./migration-v1-to-v2.md)
