TokenLens
========

[![npm version](https://img.shields.io/npm/v/tokenlens.svg)](https://www.npmjs.com/package/tokenlens)
[![npm downloads](https://img.shields.io/npm/dm/tokenlens.svg)](https://www.npmjs.com/package/tokenlens)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

Typed model metadata and context/cost utilities that help AI apps answer: Does this fit? What will it cost? Should we compact now? How much budget is left for the next turn?

Works great with the Vercel AI SDK out of the box, and remains SDK‑agnostic.

See the central terminology in [docs/glossary.md](docs/glossary.md).

![TokenLens overview](https://raw.githubusercontent.com/xn1cklas/tokenlens/HEAD/assets/tokenlens.png)

Highlights
- Canonical model registry with alias resolution and minimal metadata you can trust.
- Strong TypeScript surface: `ModelId` autocomplete and safe helpers.
- Usage normalization across providers and SDKs (incl. Vercel AI SDK fields).
- Context budgeting: remaining tokens, percent used, and next-turn budget.
- Compaction helpers: when to compact and how many tokens to remove.
- Cost estimation: fast, rough USD costs using source‑linked pricing when available.
- Conversation utilities: sum usage, estimate conversation cost, measure context rot.

Install
- npm: `npm i tokenlens`
- pnpm: `pnpm add tokenlens`
- yarn: `yarn add tokenlens`

Quick Start
```ts
import { fetchModels } from 'tokenlens';
import { getContext, getTokenCosts, getUsage } from '@tokenlens/helpers';

// 1) Get providers (or import getModels() for a static set)
const openai = await fetchModels('openai'); // or getModels() synchronously

// 2) Use flexible ids: 'provider/model', 'provider:id', or providerless 'model'
const modelId = 'openai/gpt-4o-mini';
const usage = { prompt_tokens: 3200, completion_tokens: 400 };

// Context caps only
const { maxInput, maxOutput, maxTotal } = getContext(modelId, openai);

// Cost breakdown only
const {
  inputUSD,
  outputUSD,
  reasoningUSD,
  cacheReadUSD,
  cacheWriteUSD,
  totalUSD,
} = getTokenCosts(modelId, usage, openai);

// Or both together
const usageData = getUsage(modelId, usage, openai);

console.log({
  maxInput,
  maxOutput,
  maxTotal,
  inputUSD,
  outputUSD,
  reasoningUSD,
  cacheReadUSD,
  cacheWriteUSD,
  totalUSD,
  usageData,
});
```

Focused API
- fetchModels: fetch providers (models.dev dataset)
- getModels: static providers registry
- getContext(modelId, providers): returns caps `{ inputMax?, outputMax?, totalMax? }` (combinedMax remains as legacy alias)
- getTokenCosts(modelId, usage, providers): returns `{ inputUSD?, outputUSD?, reasoningUSD?, cacheReadUSD?, cacheWriteUSD?, totalUSD? }`
- getUsage(modelId, usage, providers, reserveOutput?): returns `{ context, costUSD }`

Deprecations
- Most other helpers are now deprecated in favor of the focused API above, including but not limited to:
  - Usage: `normalizeUsage`, `breakdownTokens`, `consumedTokens`
  - Context: `getContextWindow`, `remainingContext`, `percentRemaining`, `fitsContext`, `pickModelFor`
  - Cost: `estimateCost`
  - Compaction: `shouldCompact`, `contextHealth`, `tokensToCompact`
  - Conversation: `sumUsage`, `estimateConversationCost`, `computeContextRot`, `nextTurnBudget`
  - Sugar: `modelMeta`, `percentOfContextUsed`, `tokensRemaining`, `costFromUsage`

Notes
- ID normalization is automatic: accepts `provider/model`, `provider:id`, and providerless `model`.
- Version dots are normalized to dashes in the model segment (e.g., `claude-3.5-haiku` → `claude-3-5-haiku`).
- Cost outputs are estimates based on models.dev pricing fields. For authoritative cost numbers, read pricing and usage metrics from your model provider's API responses at runtime.
Async Fetch (models.dev)

```ts
import {
  fetchModels,
  FetchModelsError,
  type ModelCatalog,
  type ProviderInfo,
  type ProviderModel,
} from 'tokenlens';

// 1) Fetch all providers (Node 18+ or modern browsers with global fetch)
const providers: ModelCatalog = await fetchModels();

// 2) Fetch by provider key (e.g. 'openai', 'anthropic', 'deepseek')
const openai: ProviderInfo | undefined = await fetchModels({ provider: 'openai' });

// 3) Fetch a specific model within a provider
const gpto: ProviderModel | undefined = await fetchModels({ provider: 'openai', model: 'gpt-4o' });

// 4) Search for a model across providers when provider is omitted
const matches: Array<{ provider: string; model: ProviderModel }> = await fetchModels({ model: 'gpt-4.1' });

// 5) Error handling with typed error codes
try {
  await fetchModels();
} catch (err) {
  if (err instanceof FetchModelsError) {
    // err.code is one of: 'UNAVAILABLE' | 'NETWORK' | 'HTTP' | 'PARSE'
    console.error('Fetch failed:', err.code, err.status, err.message);
  } else {
    throw err;
  }
}

// 6) Provide a custom fetch (for Node < 18 or custom runtimes)
// import fetch from 'cross-fetch' or 'undici'
// const providers = await fetchModels({ fetch });
```


Context Budgeting & Compaction
- These helpers are deprecated; prefer `getContext` and your own compaction logic.

Advanced
- Caps strategy: `remainingContext` supports `strategy: 'provider-default' | 'combined' | 'input-only'`.
  - `provider-default` (default): prefers `combinedMax` when available; otherwise uses `inputMax`.
  - `combined`: always uses `combinedMax` (falls back to `inputMax` if missing).
  - `input-only`: uses only `inputMax` for remaining/percent calculations.
- Defaults: `shouldCompact` defaults to `threshold: 0.85`; `contextHealth` defaults to `warnAt: 0.75`, `compactAt: 0.85`.

Conversation Utilities
- Deprecated in favor of higher-level conversation budgeting tools.

Listing Models
```ts
import { listModels } from 'tokenlens';

const stableOpenAI = listModels({ provider: 'openai', status: 'stable' });
```

Data Source & Sync
- Primary source: models.dev (https://github.com/sst/models.dev). We periodically sync our registry from their dataset.
- Official provider pages are used where applicable; if numbers aren’t explicit, fields remain undefined.
- Sync locally: `pnpm -C packages/tokenlens sync:models`

Acknowlegements
- Big thanks to the sst/models.dev maintainers and community for keeping model information current: https://github.com/sst/models.dev

License
MIT
