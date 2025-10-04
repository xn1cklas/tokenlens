---
title: Overview
description: Introduction to TokenLens and what it provides
---

# TokenLens Overview

TokenLens provides provider-aware model metadata and usage utilities for AI applications. It resolves canonical model ids across multiple data sources, normalizes usage payloads, and estimates token costs/context limits with a consistent TypeScript API.

## Why TokenLens?

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

## When to use Tokenlens

- You need reliable cost estimates across multiple providers.
- Your application must determine if a usage payload exceeds model context limits.
- You integrate with SDKs that emit usage in differing shapes (Vercel AI SDK, OpenAI, Anthropic, etc.).
- You want to merge live provider data with in-app fixture data while keeping a single lookup API.

## Next steps

- [Getting Started](/docs/guides/getting-started) - Install and setup
- [Quick Start](/docs/guides/quick-start) - Basic usage examples
- [GitHub Repository](https://github.com/xn1cklas/tokenlens) - View the source code

