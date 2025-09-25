# TokenLens Glossary

This file defines canonical terminology used across the TokenLens v2 codebase and docs.

## provider id
- The vendor namespace for a model (e.g., `openai`, `anthropic`, `xai`).
- Appears as the prefix in canonical ids such as `provider/model`.

## model id (canonical)
- Fully qualified identifier in the form `provider/model`.
- Example: `openai/gpt-4o-mini`, `anthropic/claude-3-5-sonnet-20241022`.

## source
- The upstream dataset Tokenlens can load (`openrouter`, `models.dev`, or `package`).
- Configured via `TokenlensOptions.sources` or `createClient({ sources })`.

## source loader
- A function that fetches and normalizes a given source into `SourceProviders`.
- Defaults live in `packages/tokenlens/src/default-loaders.ts`; custom loaders can be supplied via `TokenlensOptions.loaders`.

## SourceProvider
- Raw provider metadata emitted by a loader.
- Fields include `id`, `name?`, `api?`, `doc?`, `env?`, `models`.
- Represents source-specific data before Tokenlens composes higher-level DTOs.

## SourceModel
- Raw per-model metadata entry delivered by a loader.
- Fields include `id`, `name`, `limit`, `cost`, `modalities`, capability flags, and source-specific `extras`.

## ModelDetails
- The DTO returned by `describeModel`.
- Contains the resolved `providerId`, canonical `modelId`, optional `model` (the `SourceModel`), token `limit`, computed `costs`, and `hints`.

## ModelHints
- Helper object derived from a `SourceModel` summarizing capabilities (`supportsReasoning`, `supportsToolCall`, `supportsAttachments`, `openWeights`, optional knowledge cutoff).

## Usage
- Union type capturing usage counters from common SDKs (e.g., `input_tokens`, `outputTokens`, `reasoning_tokens`).
- Passed to `estimateCostUSD` or `describeModel` to compute cost breakdowns.

## TokenCosts
- Normalized USD cost breakdown calculated by `estimateCostUSD` / `computeTokenCostsForModel`.
- Fields: `inputTokenCostUSD`, `outputTokenCostUSD`, optional `reasoningTokenCostUSD`, caching costs, and `totalTokenCostUSD` plus the `ratesUsed`.

## DEFAULT_SOURCE
- The source used when none is specified (`openrouter`).
- Ensures stand-alone helpers work without configuration.

## provider id normalization
- Tokenlens trims suffixes like `.responses` or slash-prefixed ids so `openai.responses/gpt-4o` resolves to the canonical `openai/gpt-4o` entry.
- Needed for Vercel AI SDK integration where provider ids include namespaces.

## LanguageModelV2
- AI SDK model abstraction (`@ai-sdk/*`) whose `modelId` and `provider`/`providerId` can be passed directly to Tokenlens helpers.
- Tests covering this live in `packages/provider-tests/tests/ai-sdk-usage.spec.ts`.

## models.dev
- External dataset consumed via `https://models.dev/api.json`.
- In v2 we ingest it into `packages/models/src/modelsdev/`.

## OpenRouter
- External dataset consumed via `https://openrouter.ai/api/v1/models`.
- In v2 we ingest it into `packages/models/src/openrouter/`.

## package source
- In-memory catalog provided by Tokenlens for tests/examples.
- Typically wired via `createClient({ sources: ["package"], loaders: { package: async () => ... } })`.

## context limits
- Token budget derived from provider metadata.
- `limit.context` represents combined tokens; `limit.input` / `limit.output` provide per-direction caps when available.

## pricing
- Approximate USD cost per 1M tokens as supplied by the source catalog (`cost.input`, `cost.output`, etc.).
- Tokenlens converts these to per-request USD using `estimateCostUSD`.

## modalities
- Supported input/output modalities of a model (`modalities.input`, `modalities.output`).
- Used to derive hints returned from `describeModel`.

## estimateCostUSD
- Stand-alone helper (and class method) that resolves a model, normalizes usage, and returns `TokenCosts`.

## describeModel
- Stand-alone helper (and class method) returning `ModelDetails` for a model.
- Accepts optional `usage` to embed `TokenCosts` in the result.

## getContextLimits
- Stand-alone helper returning `{ context?, input?, output? }` for a resolved model.

## Tokenlens (class)
- Configurable client responsible for loading sources, caching provider catalogs, and exposing helpers (`estimateCostUSD`, `describeModel`, `getContextLimits`).
- Instances share a cache unless `cacheKey` is overridden.

## createClient
- Convenience factory that instantiates `Tokenlens` with sensible defaults (fallback loaders for each source, `DEFAULT_SOURCE` when none provided).

## MemoryCache
- Default cache adapter for Tokenlens.
- Stores provider catalogs in-memory with TTL jitter to prevent thundering herds.

---

Conventions
- Prefer `provider/model` in code and docs.
- Reference terms by anchor, e.g., “See docs/glossary.md#model”.
- New terms must be added here in the same PR.


