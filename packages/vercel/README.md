@tokenlens/vercel
=================

[![npm version](https://img.shields.io/npm/v/%40tokenlens%2Fvercel.svg)](https://www.npmjs.com/package/@tokenlens/vercel)
[![npm downloads](https://img.shields.io/npm/dm/%40tokenlens%2Fvercel.svg)](https://www.npmjs.com/package/@tokenlens/vercel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

Tokenlens middleware helpers for the [Vercel AI SDK](https://sdk.vercel.ai). Attach live token cost estimation to AI SDK v5 `LanguageModelV2` and AI SDK v6 `LanguageModelV3` models by wrapping them with Tokenlens.

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


const tokenlens = new Tokenlens({ catalog: "models.dev" });

const model = withTokenlens(openai("gpt-5"), tokenlens);

const result = await generateText({
  model,
  prompt: 'How many tokens does this cost?',
});

console.log({
  inputTokens: result.usage?.inputTokens,
  outputTokens: result.usage?.outputTokens,
  costs: result.providerMetadata?.tokenlens?.costs,
});
```


How it works
- Wrap any AI SDK v5 or v6 language model with `withTokenlens(model, tokenlens)`.
- The middleware calls `tokenlens.computeCostUSD()` after non-streaming generations and when a stream emits its final usage.
- Token cost fields (`inputTokenCostUSD`, `outputTokenCostUSD`, `totalTokenCostUSD`) are attached at `providerMetadata.tokenlens.costs`.
- Providers and pricing come from your configured Tokenlens catalog.


API
- `withTokenlens(model, tokenlens)` → wraps the model using the installed AI SDK major.
- `withTokenlensV5(model, tokenlens)` / `tokenlensMiddlewareV5(tokenlens)` → explicit v5 helper names.
- `withTokenlensV6(model, tokenlens)` / `tokenlensMiddlewareV6(tokenlens)` → explicit v6 helper names.


Testing
- `pnpm test` inside `packages/vercel` runs the Vitest suite covering the middleware behaviour with a mock provider.


License
MIT
