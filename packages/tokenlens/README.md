TokenLens
========

[![npm version](https://img.shields.io/npm/v/tokenlens.svg)](https://www.npmjs.com/package/tokenlens)
[![npm downloads](https://img.shields.io/npm/dm/tokenlens.svg)](https://www.npmjs.com/package/tokenlens)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

Typed model metadata and cost/context helpers for LLM applications. Tokenlens resolves provider/model ids, normalises usage from common SDKs (incl. Vercel AI SDK), and returns USD estimates plus context limits so you can decide: *Does this fit? What will it cost? Should we compact now?*

Works great with the Vercel AI SDK out of the box, and remains SDK‑agnostic.

![TokenLens overview](https://raw.githubusercontent.com/xn1cklas/tokenlens/HEAD/assets/tokenlens.png)

Highlights
----------
- Canonical model registry with alias resolution across multiple data **sources** (OpenRouter by default, models.dev optionally).
- Minimal helper surface: `computeCostUSD`, `describeModel`, and `getContextLimits` – each powered by the same cached provider catalog.
- Strong TypeScript surface: exported types for `Usage`, `ModelDetails`, `TokenCosts`, and `TokenlensOptions`.
- Built-in caching with configurable TTLs and pluggable adapters to avoid repeated network fetches.

Install
-------
- npm: `npm i tokenlens`
- pnpm: `pnpm add tokenlens`
- yarn: `yarn add tokenlens`

Quick Start (standalone helpers)
--------------------------------
```ts
import {
  describeModel,
  computeCostUSD,
  getContextLimits,
} from "tokenlens";

const usage = { inputTokens: 3_200, outputTokens: 400 };

const [costs, limits, details] = await Promise.all([
  computeCostUSD({ modelId: "openai/gpt-4o-mini", usage }),
  getContextLimits({ modelId: "openai/gpt-4o-mini" }),
  describeModel({ modelId: "openai/gpt-4o-mini", usage }),
]);

console.log({
  usd: costs.totalTokenCostUSD,
  context: limits?.context,
  provider: details.providerId,
});
```

How Tokenlens works
-------------------
Tokenlens maintains a small cache of provider catalogs. By default it lazily loads the **OpenRouter** dataset and reuses it across helper calls. You can:

1. Use the **standalone helpers** (`computeCostUSD`, `describeModel`, `getContextLimits`) which share an internal singleton with default settings.
2. Create your own **Tokenlens instance** when you need to control sources, caching, loaders, or fetch implementations.

Custom configuration (`createTokenlens`)
---------------------------------------
```ts
import { createTokenlens, type TokenlensOptions } from "tokenlens";

const options: TokenlensOptions = {
  sources: ["openrouter", "package"],
  ttlMs: 5 * 60 * 1000, // refresh cached providers every 5 minutes
  loaders: {
    // Provide an in-memory catalog for tests or app-specific metadata
    package: async () => ({
      demo: {
        id: "demo",
        source: "package",
        models: {
          "demo/chat": {
            id: "demo/chat",
            name: "Chat Demo",
            limit: { context: 128_000, output: 4_096 },
            cost: { input: 1, output: 2 },
          },
        },
      },
    }),
  },
};

const tokenlens = createTokenlens(options);
const costs = await tokenlens.computeCostUSD({
  modelId: "demo/chat",
  usage: { input_tokens: 500, output_tokens: 200 },
});

console.log(costs.totalTokenCostUSD.toFixed(4));
```

Multiple sources & fallback
---------------------------
Tokenlens can merge provider data from several sources. Sources are processed in order; missing providers/models can be filled by later sources.

```ts
const tokenlens = createTokenlens({
  sources: ["package", "openrouter"],
  loaders: {
    package: async () => fixtureProviders,
  },
});

// Package models win when ids collide, OpenRouter fills in the rest.
const details = await tokenlens.describeModel({
  modelId: "openai/gpt-4o-mini",
});
```

Caching & control
-----------------
- Default cache: in-memory `MemoryCache` with a 24h TTL and jitter to avoid stampedes.
- Override TTL via `ttlMs`.
- Provide a custom cache adapter (`cache: { get, set, delete }`) to integrate Redis or other stores.
- Cold starts automatically fetch sources; errors fall back to the last cached value if available.

```ts
const tokenlens = createTokenlens({
  ttlMs: 60_000, // 1 minute TTL
  cache: myRedisBackedCache,
});
```

Type exports
------------
The package re-exports the most common types so you can stay on the root import:

```ts
import type {
  Usage,
  ModelDetails,
  TokenCosts,
  TokenlensOptions,
} from "tokenlens";
```

Testing
-------
Inject deterministic provider data with the `package` source and a custom loader:

```ts
import { createTokenlens } from "tokenlens";
import { testProviders } from "./fixtures";

export function createTestTokenlens() {
  return createTokenlens({
    sources: ["package"],
    ttlMs: 0,
    loaders: {
      package: async () => testProviders,
    },
  });
}
```

Further reading
---------------
- [`docs/glossary.md`](../../docs/glossary.md) – terminology and DTO definitions.
- [`docs/migration-v1-to-v2.md`](../../docs/migration-v1-to-v2.md) – guidance for upgrading from the legacy helpers.

License
-------
MIT
