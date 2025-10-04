---
title: Glossary
description: Key terminology used in TokenLens
---

# TokenLens Glossary

This page defines canonical terminology used across the TokenLens v2 codebase and docs.

## Provider ID

The vendor namespace for a model (e.g., `openai`, `anthropic`, `xai`). Appears as the prefix in canonical ids such as `provider/model`.

## Model ID (canonical)

Fully qualified identifier in the form `provider/model`.

Example: `openai/gpt-4o-mini`, `anthropic/claude-3-5-sonnet-20241022`.

## Source

The upstream dataset Tokenlens can load (`openrouter`, `models.dev`, or `package`). Configured via `TokenlensOptions.sources` or `createTokenlens({ sources })`.

## Source Loader

A function that fetches and normalizes a given source into `SourceProviders`. Defaults live in the package; custom loaders can be supplied via `TokenlensOptions.loaders`.

## SourceProvider

Raw provider metadata emitted by a loader. Fields include `id`, `name`, `api`, `doc`, `env`, `models`. Represents source-specific data before Tokenlens composes higher-level DTOs.

## SourceModel

Raw per-model metadata entry delivered by a loader. Fields include `id`, `name`, `limit`, `cost`, `modalities`, capability flags, and source-specific `extras`.

## ModelDetails

Alias for the `SourceModel` returned by `describeModel` (or `undefined` when not found).

## Usage

Union type capturing usage counters from common SDKs (e.g., `input_tokens`, `outputTokens`, `reasoning_tokens`). Passed to `computeCostUSD` or `describeModel` to compute cost breakdowns.

## TokenCosts

Normalized USD cost breakdown calculated by `computeCostUSD`. Fields: `inputTokenCostUSD`, `outputTokenCostUSD`, optional `reasoningTokenCostUSD`, caching costs, and `totalTokenCostUSD` plus the `ratesUsed`.

## Context Limits

Token budget derived from provider metadata. `limit.context` represents combined tokens; `limit.input` / `limit.output` provide per-direction caps when available.

## Pricing

Approximate USD cost per 1M tokens as supplied by the source catalog (`cost.input`, `cost.output`, etc.). Tokenlens converts these to per-request USD using `computeCostUSD`.

## computeCostUSD

Stand-alone helper (and class method) that resolves a model, normalizes usage, and returns `TokenCosts`.

## describeModel

Stand-alone helper (and class method) returning `ModelDetails` for a model. Accepts optional `usage` to embed `TokenCosts` in the result.

## getContextLimits

Stand-alone helper returning `{ context?, input?, output? }` for a resolved model.

## Tokenlens (class)

Configurable client responsible for loading sources, caching provider catalogs, and exposing helpers (`computeCostUSD`, `describeModel`, `getContextLimits`). Instances share a cache unless `cacheKey` is overridden.

## createTokenlens

Convenience factory that instantiates `Tokenlens` with sensible defaults (fallback loaders for each source, `DEFAULT_SOURCE` when none provided).

## MemoryCache

Default cache adapter for Tokenlens. Stores provider catalogs in-memory with TTL jitter to prevent thundering herds.

