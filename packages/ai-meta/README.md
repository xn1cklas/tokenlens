ai-meta
========

A tiny, typed registry of LLM model metadata (context windows, status, pricing hints), plus helpers to compute remaining tokens and cost — starting with OpenAI and Anthropic.

Why
- One source of truth for model IDs and context sizes.
- Normalize usage objects across providers.
- Compute “tokens left” and rough cost in 1–2 lines.
- Strong typing with autocomplete for supported model IDs.

Install
- npm: `npm i ai-meta`
- pnpm: `pnpm add ai-meta`
- yarn: `yarn add ai-meta`

Quick Start (Sugar API)
- import { MODEL_IDS, type ModelId, modelMeta, percentOfContextUsed, tokensRemaining, costFromUsage } from 'ai-meta'
- const modelId: ModelId = 'openai:gpt-4o-mini'
- const usage = { prompt_tokens: 3200, completion_tokens: 400 }
- const { maxTokens, source } = modelMeta(modelId)
- const percent = percentOfContextUsed({ id: modelId, usage, reserveOutput: 256 })
- const remaining = tokensRemaining({ id: modelId, usage, reserveOutput: 256 })
- const cost = costFromUsage({ id: modelId, usage })
- console.log({ maxTokens, percent, remaining, cost, source })

- Granular Helpers
- import { resolveModel, normalizeUsage, remainingContext, estimateCost, getModelRaw } from 'ai-meta'
- const model = resolveModel('gpt-4o') // alias resolution works
- const u = normalizeUsage(response.usage)
- const ctx = remainingContext({ modelId: model!.id, usage: u, reserveOutput: 256 })
- const cost = estimateCost({ modelId: model!.id, usage: u })
- console.log({ ctx, cost })

API Overview
- ids
  - `MODEL_IDS`: readonly array of supported canonical IDs
  - `type ModelId = typeof MODEL_IDS[number]`
  - `isModelId(value: string): value is ModelId`
  - `assertModelId(value: string): asserts value is ModelId`
- registry
  - `models`: record of all models (canonical id → model)
  - `aliases`: alias → canonical id
  - `getModel(id)`, `resolveModel(idOrAlias)`, `listModels({ provider?, status? })`
- context & cost
  - `getContextWindow(modelId)`
  - `normalizeUsage(usage)` → `{ input, output, total }`
  - `breakdownTokens(usage)` → `{ input, output, total?, cacheReads?, cacheWrites? }`
  - `remainingContext({ modelId, usage, reserveOutput?, strategy? })`
  - `fitsContext({ modelId, tokens, reserveOutput? })`
  - `estimateCost({ modelId, usage })`
- sugar
  - `getModel(id)` → `{ id, displayName?, provider, status, maxTokens?, pricePerTokenIn?, pricePerTokenOut?, source }`
  - `percentOfContextUsed({ id, usage, reserveOutput? })`
  - `tokensRemaining({ id, usage, reserveOutput? })`
  - `costFromUsage({ id, usage })`

Model Data
- Each model object includes
  - `id`, `provider`, `status`, `context` (`combinedMax` or `inputMax/outputMax`), `modalities`, `pricing` (approx per 1M tokens), `aliases`, `source`
- Providers covered: OpenAI (GPT-4o family, 4.1, 3.5-turbo), Anthropic (Claude 3/3.5), Google (Gemini 2.5; Gemini 2.0 Flash long context), Meta (Llama 3.1 Instruct), Mistral (Mistral Large/Small, Codestral), Cohere (Command R/R+), xAI (Grok-2)

Notes
- Pricing is omitted unless verified in provider docs; check `model.source` for details.
- `reserveOutput` helps protect future output budget when computing remaining context.
- This package does not include tokenizers; pass usage from your SDK responses.

Roadmap
- Expand model list coverage and keep it fresh.
- Optional runtime updater and small CLI.

Real-World Example: show tokens left after a request

Using the Vercel AI SDK `generateText` (returns usage as `{ promptTokens, completionTokens, totalTokens }`).

```ts
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { type ModelId, modelMeta, percentOfContextUsed, tokensRemaining, costFromUsage, breakdownTokens } from 'ai-meta';

const modelId: ModelId = 'openai:gpt-4o-mini';

const result = await generateText({
  model: openai('gpt-4o-mini'),
  prompt: 'Summarize my document…',
});

// result.usage -> { promptTokens, completionTokens, totalTokens }
const usage = result.usage;

const { displayName, id, source, maxTokens } = modelMeta(modelId);
const percentUsed = percentOfContextUsed({ id: modelId, usage, reserveOutput: 256 });
const remaining = tokensRemaining({ id: modelId, usage, reserveOutput: 256 });
const costUSD = costFromUsage({ id: modelId, usage });
const { input, output, cacheReads, cacheWrites } = breakdownTokens(usage);

```

OpenAI Node SDK example

```ts
import OpenAI from 'openai';
import { remainingContext, estimateCost } from 'ai-meta';

const client = new OpenAI();

const chat = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'user', content: 'Draft a product description for…' },
  ],
});

const usage = chat.usage; // { prompt_tokens, completion_tokens, total_tokens, ...maybe cache fields }

const { remainingCombined, percentUsed } = remainingContext({
  modelId: 'openai:gpt-4o-mini',
  usage,
  reserveOutput: 256,
});

const { totalUSD } = estimateCost({ modelId: 'openai:gpt-4o-mini', usage });

console.log({ remainingCombined, percentUsed, totalUSD });
```

Anthropic SDK example

```ts
import Anthropic from '@anthropic-ai/sdk';
import { remainingContext } from 'ai-meta';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const msg = await anthropic.messages.create({
  model: 'claude-3-5-sonnet',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: 'Make a plan for…' },
  ],
});

// msg.usage -> { input_tokens, output_tokens, cache_creation_input_tokens?, cache_read_input_tokens? }
const { remainingCombined, percentUsed } = remainingContext({
  modelId: 'anthropic:claude-3.5-sonnet',
  usage: msg.usage,
  reserveOutput: 256,
});

console.log({ remainingCombined, percentUsed });
```
