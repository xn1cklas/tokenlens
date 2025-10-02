# Tokenlens Overview

Tokenlens provides provider-aware model metadata and usage utilities for AI applications. It resolves canonical model ids across multiple data sources, normalizes usage payloads, and estimates token costs/context limits with a consistent TypeScript API.

## Why Tokenlens?
- **Consistent metadata**: Works with dynamic catalogs such as OpenRouter and models.dev, plus local fixture data.
- **Usage normalization**: Understands common SDK payloads (OpenAI, Anthropic, Vercel AI SDK `LanguageModelV2`, etc.).
- **Cost and context**: Quickly estimate USD costs, check context windows, and inform compaction strategies.
- **Typed surface**: Ships DTOs for the metadata it returns (`ModelDetails`, `TokenCosts`, etc.).

## Core Concepts

### Tokenlens instance
A `Tokenlens` instance encapsulates:
- The list of **sources** to load (e.g., `"openrouter"`, `"models.dev"`, `"package"`).
- Source **loaders** responsible for fetching and transforming provider catalogs into Tokenlens DTOs.
- A **cache**, with configurable TTL, used to avoid repeated network requests during a process lifecycle.

The instance exposes three primary methods:
- `describeModel({ modelId, provider? })`
- `computeCostUSD({ modelId, provider?, usage })`
- `getContextLimits({ modelId, provider? })`

Each method operates on the same cached provider metadata, ensuring consistent results.

### Sources & loaders
A *source* identifies a dataset Tokenlens knows how to ingest. Built-in identifiers:
- `"openrouter"` (default) – live catalog fetched over HTTP.
- `"models.dev"` – static dataset derived from models.dev.
- `"package"` – user-defined loader returning local/fixture data.

Loaders are async functions with the signature `SourceLoader = (fetchImpl) => Promise<SourceProviders>`. Tokenlens merges the returned provider maps in the order sources are specified.

### Caching
Tokenlens caches provider metadata via an in-memory adapter (`MemoryCache`) by default. Features:
- TTL defaults to 24h (`ttlMs`), with ±5% jitter to avoid synchronized reloads.
- `cache` option accepts custom adapters (`{ get, set, delete }`) to back the cache with Redis or other stores.
- On fetch errors, Tokenlens falls back to the last cached entry if available.

### Standalone helpers
The root module also exports `computeCostUSD`, `describeModel`, and `getContextLimits` helpers. The first call to any helper lazily creates a shared `Tokenlens` instance with default options (OpenRouter source, in-memory cache). Use them when the defaults match your needs.

When you require custom configuration (multiple sources, custom cache, fixture loaders), instantiate an explicit Tokenlens client via `createTokenlens` and reuse it within your application.

## Architecture Diagram

```
┌─────────────┐     ┌────────────────────┐
│  Tokenlens  │────▶│  Source Loaders    │
└─────┬───────┘     │ (openrouter, ...) │
      │              └────────────────────┘
      │ providers
      ▼
┌─────────────────────┐
│   Provider Cache    │
└────────┬────────────┘
         │
         ▼
 ┌────────────────────────────┐
 │  Helpers / Methods         │
 │  • describeModel           │
 │  • computeCostUSD         │
 │  • getContextLimits        │
 └────────────────────────────┘
```

## When to use Tokenlens
- You need reliable cost estimates across multiple providers.
- Your application must determine if a usage payload exceeds model context limits.
- You integrate with SDKs that emit usage in differing shapes (Vercel AI SDK, OpenAI, Anthropic, etc.).
- You want to merge live provider data with in-app fixture data while keeping a single lookup API.

## Next steps
- [Getting Started](./getting-started.md)
- [Sources & Caching](./sources-and-caching.md)
- [Integration Guides](./integrations/vercel-ai-sdk.md)
- [Glossary](./glossary.md)
