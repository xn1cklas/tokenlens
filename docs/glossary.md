# TokenLens Glossary

This file defines canonical terminology used across the TokenLens v2 codebase and docs.

## provider id
- A vendor namespace for models (e.g., `openai`, `anthropic`, `qwen`).
- Appears as the prefix in `provider/model` identifiers.

## model id (canonical)
- Fully qualified identifier `provider/model` (or `provider:model` where applicable).
- Example: `openai/gpt-4o-mini`, `anthropic/claude-3.7-sonnet`.

## model
- Normalized per-model metadata entry used in catalogs.
- Fields include: `id`, `name`, `modalities`, `limit`, `cost`, and optional capabilities.

## provider
- A provider entry with metadata and a map of `models` keyed by model id.
- Fields: `id`, `name?`, `api?`, `doc?`, `env?`, `models`.

## providers
- A dictionary mapping provider id to `provider`.
- Example shape: `{ openai: { id: 'openai', models: { 'openai/gpt-4o-mini': {...} } } }`.

## models.dev
- External dataset consumed via `https://models.dev/api.json`.
- In v2 we ingest it into `packages/models/src/modelsdev/`.

## OpenRouter
- External dataset consumed via `https://openrouter.ai/api/v1/models`.
- In v2 we ingest it into `packages/models/src/openrouter/`.

## context caps
- Limits on tokens per request.
- Unified as `limit.context` (combined budget) and optionally `limit.input`, `limit.output`.

## pricing
- Approximate costs in USD per 1M tokens.
- Exposed via `cost` with optional fields: `input`, `output`, `reasoning`, `cache_read`, `cache_write`.

## modalities
- Supported I/O modalities of a model: `input: string[]`, `output: string[]`.

---

Conventions
- Prefer `provider/model` in code and docs.
- Reference terms by anchor, e.g., “See docs/glossary.md#model”.
- New terms must be added here in the same PR.


