@tokenlens/vercel
=================

[![npm version](https://img.shields.io/npm/v/%40tokenlens%2Fvercel.svg)](https://www.npmjs.com/package/@tokenlens/vercel)
[![npm downloads](https://img.shields.io/npm/dm/%40tokenlens%2Fvercel.svg)](https://www.npmjs.com/package/@tokenlens/vercel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

Tokenlens middleware helpers for the [Vercel AI SDK](https://sdk.vercel.ai). Attach live token cost estimation to any `LanguageModelV2` by wrapping it with Tokenlens.

![TokenLens overview](https://raw.githubusercontent.com/xn1cklas/tokenlens/HEAD/assets/tokenlens.png)


Install
- npm: `npm i @tokenlens/vercel tokenlens`
- pnpm: `pnpm add @tokenlens/vercel tokenlens`
- yarn: `yarn add @tokenlens/vercel tokenlens`


Quickstart
```
import { Tokenlens } from 'tokenlens';
import { withTokenlens } from '@tokenlens/vercel';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';


const tokenlens = new Tokenlens({
  sources: ['models.dev'],
});

const openai = withTokenlens(openai.languageModel('gpt-5'), tokenlens);

const result = await generateText({
  model: openai,
  prompt: 'How many tokens does this cost?',
});

console.log({
  inputTokens: result.usage?.inputTokens,
  outputTokens: result.usage?.outputTokens,
  costs: result.costs,
});
```


How it works
- Wrap any `LanguageModelV2` with `withTokenlens(model, tokenlens)`.
- The middleware calls `tokenlens.computeCostUSD()` after each generation.
- Token cost fields (`inputTokenCostUSD`, `outputTokenCostUSD`, `totalTokenCostUSD`) are merged directly onto the SDK response alongside the existing `usage` information.
- Providers and pricing come from your Tokenlens loaders (package data, remote API, etc.).


API
- `withTokenlens(model, tokenlens)` → returns a wrapped `LanguageModelV2`.
- Accepts any `Tokenlens` instance configured with your preferred sources.
- Exposes the same interface as the original model, plus cost breakdown properties on generation results.


Testing
- `pnpm test` inside `packages/vercel` runs the Vitest suite covering the middleware behaviour with a mock provider.


License
MIT
