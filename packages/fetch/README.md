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
- `fetchVercel` maps Vercel AI Gateway models, pricing, and context limits, with optional endpoint-level enrichment for filtered models
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

// Vercel AI Gateway endpoint details for a specific model
const claudeCatalog = await fetchVercel({
  provider: "anthropic",
  model: "claude-sonnet-4",
  includeEndpointDetails: true,
});

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
  - Normalizes bare models.dev model keys such as `gpt-5` into canonical provider-prefixed IDs such as `openai/gpt-5`.
  - Fetches the public models.dev JSON, normalizes provider metadata and models, and optionally filters.
- `fetchOpenrouter(options?: { provider?: string; model?: string; fetch?: typeof globalThis.fetch })`
  - Calls `https://openrouter.ai/api/v1/models`, groups models by namespace, and keeps pricing/limit details.
- `fetchVercel(options?: { provider?: string; model?: string; includeEndpointDetails?: boolean; fetch?: FetchLike })`
  - Loads `https://ai-gateway.vercel.sh/v1/models`, groups models by upstream provider, and converts pricing.
  - When `includeEndpointDetails` is true, also loads `https://ai-gateway.vercel.sh/v1/models/{provider}/{model}/endpoints` for each matched model and prefers endpoint-level pricing/context data.
- `fetchVercelModelEndpoints(modelId: string, options?: { fetch?: FetchLike })`
  - Loads endpoint details for one Vercel AI Gateway model id, for example `anthropic/claude-sonnet-4`.
- `FetchLike`
  - Minimal fetch contract accepted by both functions. Useful when wiring Node, Deno, Cloudflare Workers, etc.

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
- `pnpm --filter @tokenlens/fetch test:run` runs deterministic unit tests with mocked DTO transforms.
- `pnpm --filter @tokenlens/fetch test:live` runs live integration tests against models.dev, Vercel AI Gateway, and OpenRouter. The repository also runs these through the scheduled/manual "Live Fetch Tests" workflow.

License
MIT
