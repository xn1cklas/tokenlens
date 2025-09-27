

@tokenlens/tokenizer
=====================

[![npm version](https://img.shields.io/npm/v/%40tokenlens%2Ftokenizer.svg)](https://www.npmjs.com/package/@tokenlens/tokenizer)
[![npm downloads](https://img.shields.io/npm/dm/%40tokenlens%2Ftokenizer.svg)](https://www.npmjs.com/package/@tokenlens/tokenizer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

![TokenLens overview](https://raw.githubusercontent.com/xn1cklas/tokenlens/HEAD/assets/tokenlens.png)

Tokenizer orchestration utilities for TokenLens. Detect provider/tokenizer combos, count tokens with provider-specific implementations, and fall back to heuristic estimates when exact tokenizers are unavailable.

Highlights
- Provider-aware tokenizer dispatch with automatic fallback heuristics.
- Works standalone or with TokenLens metadata (pass `model`, `usage`, or both).
- Safe defaults: exposes `{ estimated: boolean }` so you can surface heuristics in tooling.

Install
- npm: `npm i @tokenlens/tokenizer`
- pnpm: `pnpm add @tokenlens/tokenizer`
- yarn: `yarn add @tokenlens/tokenizer`

Tokenizers are optional peer dependencies. Install the engines you need, for example:

```bash
pnpm add @tokenlens/tokenizer @dqbd/tiktoken @anthropic-ai/tokenizer llama-tokenizer-js
```

Usage
```ts
import { countTokens } from "@tokenlens/tokenizer";

const result = await countTokens({
  providerId: "openai",
  modelId: "openai/gpt-4o",
  text: "Hello world",
});

console.log(result);
// ⇒ { count: 2, estimated: false, tokenizerId: "openai-tiktoken" }
```

With TokenLens metadata
```ts
import { createTokenlens } from "tokenlens";
import { countTokens } from "@tokenlens/tokenizer";

const tokenlens = createTokenlens();
const { model } = await tokenlens.describeModel({
  modelId: "anthropic:claude-3-5-sonnet-20241022",
});

const analysis = await countTokens({
  providerId: "anthropic",
  modelId: "anthropic/claude-3-5-sonnet-20241022",
  model,
  text: "Summarize TokenLens in two sentences.",
});

if (analysis.estimated) {
  console.warn("Tokenizer fallback used", analysis);
}
```

Integration tips
- Provide `model` (from TokenLens) so provider-specific tokenizers can inspect metadata like `extras.architecture.tokenizer`.
- Include `usage` payloads when recounting transcripts; the tokenizer can use cached inputs where available.
- Use `encodingOverride` to force a specific tokenizer when heuristics aren’t sufficient.
- Watch the `{ estimated: true }` flag to surface heuristics in UI/logs.

Status

This package is experimental. Interfaces and behavior can change while we gather feedback.

