ai-meta
========

Typed model metadata and context/cost utilities for AI apps.

Stop copying model IDs, context sizes, and prices into your app. ai-meta gives you a single, strongly-typed registry plus tiny helpers to answer: “Does this fit?” and “What will it cost?”

Highlights
- Canonical registry across providers and gateways (with aliases and short ids).
- Strong TypeScript types (ModelId autocomplete, safe helpers).
- Context window math: normalize usage, compute remaining tokens, pick a fitting model.
- Cost estimates: rough USD costs with pricing aligned to Vercel AI Gateway where available.
- Conversation helpers: aggregate per-turn usage, estimate conversation cost, measure context rot.
- Pragmatic data policy: values are verified; fields are left undefined rather than guessed.

Install
- npm: `npm i ai-meta`
- pnpm: `pnpm add ai-meta`
- yarn: `yarn add ai-meta`

Quick Start
```ts
import {
  MODEL_IDS,
  type ModelId,
  modelMeta,
  percentOfContextUsed,
  tokensRemaining,
  costFromUsage,
} from 'ai-meta';

const modelId: ModelId = 'openai:gpt-4.1';
const usage = { prompt_tokens: 3200, completion_tokens: 400 };

const meta = modelMeta(modelId); // id, provider, status, maxTokens?, pricePerTokenIn?, ...
const percent = percentOfContextUsed({ id: modelId, usage, reserveOutput: 256 });
const remaining = tokensRemaining({ id: modelId, usage, reserveOutput: 256 });
const costUSD = costFromUsage({ id: modelId, usage });

console.log({ meta, percent, remaining, costUSD });
```

Granular Helpers
```ts
import {
  resolveModel,
  normalizeUsage,
  remainingContext,
  estimateCost,
} from 'ai-meta';

const m = resolveModel('openai/gpt-4.1'); // alias resolution works
const u = normalizeUsage(apiResponse.usage);
const ctx = remainingContext({ modelId: m!.id, usage: u, reserveOutput: 256 });
const { totalUSD } = estimateCost({ modelId: m!.id, usage: u });
```

API Overview
- ids
  - `MODEL_IDS` — readonly array of supported ids
  - `type ModelId = typeof MODEL_IDS[number]`
  - `isModelId(value)` and `assertModelId(value)`
- registry
  - `models` — canonical id → metadata
  - `aliases` — alias → canonical id (includes `openai/gpt-4.1`-style ids)
  - `getModelRaw(id)`, `resolveModel(idOrAlias)`, `listModels({ provider?, status? })`
- context & cost
  - `getContextWindow(id)` → `{ combinedMax?, inputMax?, outputMax? }`
  - `normalizeUsage(usage)` → `{ input, output, total }`
  - `breakdownTokens(usage)` → `{ input, output, total?, cacheReads?, cacheWrites? }`
  - `remainingContext({ modelId, usage, reserveOutput?, strategy? })`
  - `fitsContext({ modelId, tokens, reserveOutput? })`
  - `estimateCost({ modelId, usage })`
  - `sumUsage(usages[])` and `estimateConversationCost({ modelId, usages })`
  - `computeContextRot({ messageTokens, keepRecentTurns?, modelId?, targetStaleShareOfUsed? })`
  - `nextTurnBudget({ modelId, usage, reserveOutput? })`
- sugar
  - `modelMeta(id)` → `{ id, displayName?, provider, status, maxTokens?, pricePerTokenIn?, pricePerTokenOut?, source }`
  - `percentOfContextUsed`, `tokensRemaining`, `costFromUsage`

Providers Covered
- OpenAI (GPT‑5 family, GPT‑4.1 family, GPT‑4o, embeddings)
- Anthropic (Claude Sonnet 4, Claude 3.7 Sonnet, Opus 4.1)
- Google (Gemini 2.5 Pro/Flash/Flash‑Lite, Gemini 2.0 Flash)
- Mistral (Mistral Small/Medium/Large, Pixtral, Codestral, Devstral, embeddings)
- Cohere (Command R, Command R+, Command A, embed‑v4.0)
- DeepSeek (DeepSeek‑V3 / V3.1)
- xAI (Grok‑4/3, Grok code/vision variants, Grok mini)
- Meta Llama (Llama 4 Scout/Maverick, Llama 3.1 Instruct) — open weights; pricing varies by host

Data Sources & Policy
- Prices and context caps are aligned with Vercel AI Gateway model pages when available.
- Official provider pages are used where applicable (e.g., Llama site) — when numbers aren’t explicit, fields remain undefined.
- We never guess. If you see a value that needs updating, please open a PR with a link to the source.

Verification Policy
- Primary: Vercel AI Gateway model pages for pricing and context (no markup): https://vercel.com/ai-gateway/models
- Official docs when Vercel doesn’t cover it:
  - OpenAI: https://platform.openai.com/docs/models
  - Anthropic: https://docs.anthropic.com/en/docs/models-overview
  - Google Gemini: https://ai.google.dev/gemini-api/docs/models and long context: https://ai.google.dev/gemini-api/docs/long-context
  - Meta Llama: https://www.llama.com/
  - Mistral: https://docs.mistral.ai/platform/models/
  - Cohere: https://docs.cohere.com/docs/models
  - xAI: https://docs.x.ai/docs/models
- Policy: Prefer exact numbers from these sources. If unclear, leave fields unset. Always include a `source` URL.

Model Snapshot (selected examples)

| Canonical ID | Context | Pricing (per 1M) | Source |
| --- | --- | --- | --- |
| `openai:gpt-4.1` | 1M | in $2.00 / out $8.00 | https://vercel.com/ai-gateway/models/gpt-4.1 |
| `anthropic:claude-sonnet-4` | 200K | in $3.00 / out $15.00 | https://vercel.com/ai-gateway/models/claude-sonnet-4 |
| `google:gemini-2.5-pro` | 1M | in $2.50 / out $10.00 | https://vercel.com/ai-gateway/models/gemini-2.5-pro |
| `mistral:mistral-large` | 32K | in $2.00 / out $6.00 | https://vercel.com/ai-gateway/models/mistral-large |
| `cohere:command-r-plus` | 128K | in $2.50 / out $10.00 | https://vercel.com/ai-gateway/models/command-r-plus |
| `xai:grok-4` | 256K | in $3.00 / out $15.00 | https://vercel.com/ai-gateway/models/grok-4 |
| `deepseek:deepseek-v3` | 164K | in $0.77 / out $0.77 | https://vercel.com/ai-gateway/models/deepseek-v3 |
| `meta:llama-4-scout` | – | – | https://www.llama.com/ |

Notes
- `reserveOutput` protects future output budget when computing remaining context.
- Token counts are usage‑based; this package does not include tokenizers.

Conversation Helpers
```ts
import { sumUsage, estimateConversationCost, computeContextRot, nextTurnBudget } from 'ai-meta';

// Aggregate costs across turns (using provider usage objects)
const turns = [t1.usage, t2.usage, t3.usage];
const totals = sumUsage(turns);
const cost = estimateConversationCost({ modelId: 'openai:gpt-4.1', usages: turns });

// Compute a simple context-rot metric given per-message token counts
const rot = computeContextRot({ messageTokens: [800, 600, 400, 300, 200], keepRecentTurns: 2, modelId: 'openai:gpt-4.1' });
// rot.staleShareOfUsed indicates how much of the used context is stale (0..1)

// Budget for the next user turn after reserving 256 tokens for output
const nextBudget = nextTurnBudget({ modelId: 'openai:gpt-4.1', usage: totals, reserveOutput: 256 });
```

Roadmap
- Continue expanding provider coverage and keeping values fresh.
- Optional runtime sync util (opt‑in) to refresh pricing/caps.

License
MIT
