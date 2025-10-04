---
title: Tokenizer
description: Count tokens for any LLM with automatic provider detection
---

# @tokenlens/tokenizer

Count tokens for any LLM. Auto-detects provider from model name.

## Installation

```bash
npm install @tokenlens/tokenizer
```

### Peer Dependencies

Install what you need:

- **OpenAI**: `@dqbd/tiktoken` (local, no API key required)
- **Anthropic**: `@anthropic-ai/sdk` (requires `ANTHROPIC_API_KEY`)
- **Google**: `@google/genai` (requires `GOOGLE_API_KEY`)

```bash
# OpenAI only
npm install @tokenlens/tokenizer @dqbd/tiktoken

# All providers
npm install @tokenlens/tokenizer @dqbd/tiktoken @anthropic-ai/sdk @google/genai
```

## Environment Variables

For API-based tokenizers, set the required keys:

```bash
ANTHROPIC_API_KEY=your_key_here
GOOGLE_API_KEY=your_key_here
```

## Usage

### Basic Token Counting

Auto-detects provider from model name:

```ts
import { countTokens } from "@tokenlens/tokenizer";

await countTokens("gpt-4o", "Hello world");
// => 2

await countTokens("claude-sonnet-4-5", "Hello world");  
// => 3

await countTokens("gemini-2.5-pro", "Hello world");
// => 2
```

### Prefixed Model IDs

Works with provider prefixes:

```ts
await countTokens("openai/gpt-4o", "Hello world");
await countTokens("anthropic/claude-opus-4", "Hello world");
await countTokens("google/gemini-2.5-flash", "Hello world");
```

### Fallback Behavior

Unknown models fall back to GPT-5 tokenizer:

```ts
await countTokens("future-model-xyz", "Hello world");
// => 2 (uses o200k_base encoding)
```

## How It Works

Routes to correct tokenizer based on model name pattern:

- `gpt-*` or `openai/*` → OpenAI tiktoken (local)
- `claude-*` or `anthropic/*` → Anthropic API
- `gemini-*` or `google/*` → Google API  
- Unknown → Falls back to GPT-5 tiktoken

## Supported Models

### OpenAI
`gpt-4o`, `gpt-4o-mini`, `gpt-5`, `gpt-4`

### Anthropic
`claude-sonnet-4-5`, `claude-sonnet-4-0`, `claude-3-7-sonnet-latest`, `claude-opus-4-1`, `claude-opus-4`, `claude-3-5-haiku-latest`

### Google
`gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`

## TypeScript

Fully type-safe with autocomplete:

```ts
import { countTokens, type ModelId } from "@tokenlens/tokenizer";

const modelId: ModelId = "gpt-4o"; // ✅ autocomplete works
const tokens = await countTokens(modelId, "text");
```

The `ModelId` type includes all known model IDs plus `string` for flexibility.

## API Reference

### countTokens(modelId, data)

Count tokens for any model with automatic provider detection.

**Parameters:**
- `modelId`: `ModelId` - Model name (e.g., `"gpt-4o"`, `"claude-sonnet-4-5"`) or any string
- `data`: `string` - Text to count tokens for

**Returns:** `Promise<number | undefined>`

Returns token count or `undefined` if counting fails.

**Example:**

```ts
const tokens = await countTokens("gpt-4o", "Count these tokens");
console.log(tokens); // => 3
```

## Integration with TokenLens

Combine with main package for cost estimation:

```ts
import { estimateCostUSD } from "tokenlens";

const estimate = await estimateCostUSD({
  modelId: "gpt-4o",
  content: {
    input: "Write a story about a robot",
    output: "Once upon a time..." 
  }
});

console.log(`Cost: $${estimate.totalTokenCostUSD}`);
console.log(`Input tokens: ${estimate.inputTokens}`);
console.log(`Output tokens: ${estimate.outputTokens}`);
```

## Learn More

- [GitHub Repository](https://github.com/xn1cklas/tokenlens)
- [npm Package](https://www.npmjs.com/package/@tokenlens/tokenizer)
- [Examples](https://github.com/xn1cklas/tokenlens/tree/v2/examples)
