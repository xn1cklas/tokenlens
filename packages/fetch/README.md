@tokenlens/fetch
================

[![npm version](https://img.shields.io/npm/v/%40tokenlens%2Ffetch.svg)](https://www.npmjs.com/package/@tokenlens/fetch)
[![npm downloads](https://img.shields.io/npm/dm/%40tokenlens%2Ffetch.svg)](https://www.npmjs.com/package/@tokenlens/fetch)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)


![TokenLens overview](https://raw.githubusercontent.com/xn1cklas/tokenlens/HEAD/assets/tokenlens.png)

Typed, dependency-free fetchers for the public `models.dev` catalog, Vercel AI Gateway, and the OpenRouter API. All return the shared TokenLens DTO shape so the rest of the toolchain can consume a consistent model registry.

Features
- `fetchModelsDev` normalizes https://models.dev/api.json into TokenLens DTOs
- `fetchOpenrouter` maps OpenRouter models, pricing, limits, and metadata
- `fetchVercel` maps Vercel AI Gateway models, pricing, and context limits
- Pass a custom `fetch` implementation for server/runtime flexibility
- DTO types (`SourceProvider`, `SourceModel`, …) re-exported for convenience

Install
- npm: `npm i @tokenlens/fetch`
- pnpm: `pnpm add @tokenlens/fetch`
- yarn: `yarn add @tokenlens/fetch`

Quick start
```ts
import {
  fetchModelsDev,
  fetchOpenrouter,
  fetchVercel,
  type SourceProviders,
} from "@tokenlens/fetch";

// models.dev catalog (optionally filter by provider/model substring)
const modelsDevCatalog = await fetchModelsDev({ provider: "openai" });

// OpenRouter catalog (grouped by provider namespace)
const openrouterCatalog = await fetchOpenrouter({ model: "gpt" });

// Vercel AI Gateway catalog (grouped by upstream provider)
const vercelCatalog = await fetchVercel({ provider: "openai" });

const combine = (catalogs: SourceProviders[]): SourceProviders =>
  Object.assign({}, ...catalogs);

const providers = combine([
  modelsDevCatalog,
  openrouterCatalog,
  vercelCatalog,
]);
```

API
- `fetchModelsDev(options?: { provider?: string; model?: string; fetch?: typeof globalThis.fetch })`
  - Fetches the public models.dev JSON, normalizes provider metadata and models, and optionally filters.
- `fetchOpenrouter(options?: { provider?: string; model?: string; fetch?: typeof globalThis.fetch })`
  - Calls `https://openrouter.ai/api/v1/models`, groups models by namespace, and keeps pricing/limit details.
- `fetchVercel(options?: { provider?: string; model?: string; fetch?: typeof globalThis.fetch })`
  - Loads `https://ai-gateway.vercel.sh/v1/models`, groups models by upstream provider, and converts pricing.

DTO exports
```ts
import type {
  SourceId,
  SourceModel,
  SourceProvider,
  SourceProviders,
} from "@tokenlens/fetch";
```
The types mirror the definitions in `@tokenlens/core/dto` and are re-exported here for convenience.

Testing
- `pnpm test --filter @tokenlens/fetch` runs both unit tests (mocked DTO transforms) and live integration tests hitting models.dev, Vercel AI Gateway, and OpenRouter. Ensure you have network access when running the suite.

License
MIT
