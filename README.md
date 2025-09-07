ai-meta Monorepo
=================

This repository houses ai-meta and related examples/tools for building AI apps with reliable, strongly-typed model metadata.

Packages
- packages/ai-meta — Typed registry of model metadata (context windows, pricing, aliases) + utilities to normalize usage and estimate costs.
- packages/provider-tests — Small verification harness and fixtures (optional/local).
- apps/web-demo — Minimal example app wiring ai-meta into a UI.

Why this repo exists
- One source of truth for canonical model IDs across providers and gateways.
- A consistent way to answer “Does this request fit?” and “What will it cost?”
- Strong TypeScript types (autocomplete for model IDs, safe helpers).
- Practical, up-to-date defaults aligned with Vercel AI Gateway and official model pages.

Quick Start
- Install dependencies: `pnpm i`
- Build all: `pnpm -w build`
- Focus on ai-meta only: `pnpm -w -F ai-meta build`

What ai-meta gives you
- Model registry: resolve canonical IDs or aliases (e.g. `openai:gpt-4.1` or `openai/gpt-4.1`).
- Autocomplete: `MODEL_IDS` and `type ModelId` for safer code.
- Context math: normalize usage, compute remaining tokens, check if a prompt fits, pick the smallest fitting model.
- Cost estimates: rough USD costs from usage with provider/gateway-aligned pricing where available.

Verification
- Primary source: Vercel AI Gateway model pages (no markup) at https://vercel.com/ai-gateway/models
- Secondary: Official provider docs (OpenAI, Anthropic, Google, Mistral, Cohere, xAI, Meta Llama).
- If a value isn’t explicit, we leave it undefined rather than guess and always include a `source` link.

Contributing
- Open a PR with focused changes. Keep numbers verifiable (link a source).
- Prefer provider/Vercel sources; leave fields undefined rather than guess.

License
MIT
