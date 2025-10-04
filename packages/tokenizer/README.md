@tokenlens/tokenizer
=====================

[![npm version](https://img.shields.io/npm/v/%40tokenlens%2Ftokenizer.svg)](https://www.npmjs.com/package/@tokenlens/tokenizer)
[![npm downloads](https://img.shields.io/npm/dm/%40tokenlens%2Ftokenizer.svg)](https://www.npmjs.com/package/@tokenlens/tokenizer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)


![TokenLens overview](https://raw.githubusercontent.com/xn1cklas/tokenlens/HEAD/assets/tokenlens.png)

Count tokens for any LLM. Auto-detects provider from model name.

## Install

```bash
npm install @tokenlens/tokenizer
```

Peer dependencies
- OpenAI: `@dqbd/tiktoken` (local, no API key)
- Anthropic: `@anthropic-ai/sdk` (requires `ANTHROPIC_API_KEY`)
- Google: `@google/genai` (requires `GOOGLE_API_KEY`)

## Environment variables

When using Anthropic or Google models, the package tries to parse the API keys to access the provider endpoints.

## Usage

Simple token counting:

```ts
import { countTokens } from "@tokenlens/tokenizer";

// Auto-detects provider from model name
await countTokens("gpt-4o", "Hello world");
// => 2

await countTokens("claude-sonnet-4-5", "Hello world");  
// => 3

await countTokens("gemini-2.5-pro", "Hello world");
// => 2
```

Prefixed model IDs work too:

```ts
await countTokens("openai/gpt-4o", "Hello world");
await countTokens("anthropic/claude-opus-4", "Hello world");
await countTokens("google/gemini-2.5-flash", "Hello world");
```

Unknown models fall back to GPT-5 tokenizer:

```ts
await countTokens("future-model-xyz", "Hello world");
// => 2 (uses o200k_base encoding)
```

## How it works

Routes to correct tokenizer based on model name:
- `gpt-*` or `openai/*` → OpenAI tiktoken (local)
- `claude-*` or `anthropic/*` → Anthropic API
- `gemini-*` or `google/*` → Google API  
- Unknown → Falls back to GPT-5 tiktoken

## Supported Models

**OpenAI**: `gpt-4o`, `gpt-4o-mini`, `gpt-5`, `gpt-4`

**Anthropic**: `claude-sonnet-4-5`, `claude-sonnet-4-0`, `claude-3-7-sonnet-latest`, `claude-opus-4-1`, `claude-opus-4`, `claude-3-5-haiku-latest`

**Google**: `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`

## TypeScript

Fully type-safe with autocomplete for all model IDs:

```ts
import { countTokens, type ModelId } from "@tokenlens/tokenizer";

const modelId: ModelId = "gpt-4o"; // ✅ autocomplete works
const tokens = await countTokens(modelId, "text");
```

## API

### `countTokens(modelId, data)`

**Parameters:**
- `modelId`: Model name (e.g., `"gpt-4o"`, `"claude-sonnet-4-5"`) or string
- `data`: Text to count tokens for

**Returns:** `Promise<number | undefined>`

Returns token count or `undefined` if counting fails.
