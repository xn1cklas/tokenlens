@tokenlens/helpers
==================

[![npm version](https://img.shields.io/npm/v/%40tokenlens%2Fhelpers.svg)](https://www.npmjs.com/package/@tokenlens/helpers)
[![npm downloads](https://img.shields.io/npm/dm/%40tokenlens%2Fhelpers.svg)](https://www.npmjs.com/package/@tokenlens/helpers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)


![TokenLens overview](https://raw.githubusercontent.com/xn1cklas/tokenlens/HEAD/assets/tokenlens.png)

Utility helpers for context windows, usage normalization, compaction, and cost estimation. DI‑first: pass a `source` from `@tokenlens/models` or a `catalog` from `@tokenlens/fetch`.


Install
- npm: `npm i @tokenlens/helpers`
- pnpm: `pnpm add @tokenlens/helpers`
- yarn: `yarn add @tokenlens/helpers`

Exports
- Context: `getContextWindow`, `remainingContext`, `percentRemaining`, `fitsContext`
- Usage: `normalizeUsage`, `breakdownTokens`, `consumedTokens`
- Cost: `estimateCost`
- Compaction: `shouldCompact`, `contextHealth`, `tokensToCompact`
- DI: `sourceFromModels`, `sourceFromCatalog`, `selectStaticModels`

Usage (DI)
```
import { getContextWindow, estimateCost, sourceFromModels } from '@tokenlens/helpers';
import openai from '@tokenlens/models/providers/openai';

const source = sourceFromModels(openai);
const cw = getContextWindow('gpt-4o', { source });
const cost = estimateCost({ modelId: 'openai:gpt-4o', usage: { inputTokens: 1000, outputTokens: 500 }, source });
```

Normalize usage shapes
```
import { normalizeUsage } from '@tokenlens/helpers';

const u1 = normalizeUsage({ prompt_tokens: 1000, completion_tokens: 150 });
const u2 = normalizeUsage({ inputTokens: 900, outputTokens: 200, totalTokens: 1100 });
```

Back‑compat via `tokenlens`
```
import { getContextWindow, estimateCost } from 'tokenlens';
// Uses a default static source under the hood (deprecated path).
```

License
MIT
