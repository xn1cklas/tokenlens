TokenLens
========

[![npm version](https://img.shields.io/npm/v/tokenlens.svg)](https://www.npmjs.com/package/tokenlens)
[![npm downloads](https://img.shields.io/npm/dm/tokenlens.svg)](https://www.npmjs.com/package/tokenlens)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

Typed model metadata and context/cost utilities that help AI apps answer: Does this fit? What will it cost? Should we compact now? How much budget is left for the next turn?

Works great with the Vercel AI SDK out of the box, and remains SDK‑agnostic.

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
import {
  type ModelId,
  modelMeta,
  percentOfContextUsed,
  tokensRemaining,
  costFromUsage,
} from 'tokenlens';

const id: ModelId = 'openai:gpt-4.1';
// Works with provider usage or Vercel AI SDK usage
const usage = { prompt_tokens: 3200, completion_tokens: 400 };

const meta = modelMeta(id);
const used = percentOfContextUsed({ id, usage, reserveOutput: 256 });
const remaining = tokensRemaining({ id, usage, reserveOutput: 256 });
const costUSD = costFromUsage({ id, usage });

console.log({ meta, used, remaining, costUSD });
```

Core Helpers
- Registry: `resolveModel`, `listModels`, `MODEL_IDS`, `isModelId`, `assertModelId`
- Usage: `normalizeUsage`, `breakdownTokens`, `consumedTokens`
- Context: `getContextWindow`, `remainingContext`, `percentRemaining`, `fitsContext`, `pickModelFor`
- Cost: `estimateCost`
- Compaction: `shouldCompact`, `contextHealth`, `tokensToCompact`
- Conversation: `sumUsage`, `estimateConversationCost`, `computeContextRot`, `nextTurnBudget`
- Sugar: `modelMeta`, `percentOfContextUsed`, `tokensRemaining`, `costFromUsage`

Provider‑Agnostic Usage
```ts
import { normalizeUsage, breakdownTokens } from 'tokenlens';

// Works with many shapes, including Vercel AI SDK fields
const u1 = normalizeUsage({ prompt_tokens: 1000, completion_tokens: 150 });
const u2 = normalizeUsage({ inputTokens: 900, outputTokens: 200, totalTokens: 1100 });
const b = breakdownTokens({ inputTokens: 900, cachedInputTokens: 300, reasoningTokens: 120 });
```
Async Fetch (models.dev)

```ts
import {
  fetchModels,
  FetchModelsError,
  type ModelCatalog,
  type ProviderInfo,
  type ProviderModel,
} from 'tokenlens';

// 1) Fetch the full catalog (Node 18+ or modern browsers with global fetch)
const catalog: ModelCatalog = await fetchModels();

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
// const catalog = await fetchModels({ fetch });
```


Picking Model Metadata
```ts
import { getModels, getModelMeta } from 'tokenlens';

// Build a static catalog (or use fetchModels() dynamically)
const providers = getModels();

// Provider info
const openai = getModelMeta({ providers, provider: 'openai' });

// Single model
const gpto = getModelMeta({ providers, provider: 'openai', model: 'gpt-4o' });

// Multiple models
const picks = getModelMeta({ providers, provider: 'openai', models: ['gpt-4o', 'o3-mini'] });

// Providerless id
const viaId = getModelMeta({ providers, id: 'openai:gpt-4o' }); // or 'openai/gpt-4o'
```


Context Budgeting & Compaction
```ts
import { remainingContext, shouldCompact, tokensToCompact, contextHealth } from 'tokenlens';

const rc = remainingContext({ modelId: 'anthropic:claude-3-5-sonnet-20240620', usage: u1, reserveOutput: 256 });
if (shouldCompact({ modelId: 'anthropic:claude-3-5-sonnet-20240620', usage: u1 })) {
  const n = tokensToCompact({ modelId: 'anthropic:claude-3-5-sonnet-20240620', usage: u1 });
  // summarize oldest messages by ~n tokens
}
const badge = contextHealth({ modelId: 'openai:gpt-4.1', usage: u2 }); // { status: 'ok'|'warn'|'compact' }
```

Advanced
- Caps strategy: `remainingContext` supports `strategy: 'provider-default' | 'combined' | 'input-only'`.
  - `provider-default` (default): prefers `combinedMax` when available; otherwise uses `inputMax`.
  - `combined`: always uses `combinedMax` (falls back to `inputMax` if missing).
  - `input-only`: uses only `inputMax` for remaining/percent calculations.
- Defaults: `shouldCompact` defaults to `threshold: 0.85`; `contextHealth` defaults to `warnAt: 0.75`, `compactAt: 0.85`.

Conversation Utilities
```ts
import { sumUsage, estimateConversationCost, computeContextRot, nextTurnBudget } from 'tokenlens';

const totals = sumUsage([turn1.usage, turn2.usage, turn3.usage]);
const cost = estimateConversationCost({ modelId: 'openai:gpt-4.1', usages: [turn1.usage, turn2.usage] });
const rot = computeContextRot({ messageTokens: [800, 600, 400, 300, 200], keepRecentTurns: 2, modelId: 'openai:gpt-4.1' });
const nextBudget = nextTurnBudget({ modelId: 'openai:gpt-4.1', usage: totals, reserveOutput: 256 });
```

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
