# Vercel AI SDK Integration Guide

Tokenlens integrates seamlessly with the Vercel AI SDK by accepting `LanguageModelV2` metadata. This guide shows you how to estimate costs from Vercel usage payloads and how to attach Tokenlens cost hints to SDK responses.

## Installing dependencies

Install Tokenlens and the AI SDK provider packages you use. The examples below cover OpenAI, Anthropic, and xAI—install only the providers relevant to your project:

```bash
pnpm add tokenlens @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/xai
```

> Tokenlens works with any provider supported by the Vercel AI SDK; the examples below cover OpenAI, Anthropic, and xAI.

## Estimating cost from a Vercel usage payload

```ts
import { computeCostUSD } from "tokenlens";
import { openai } from "@ai-sdk/openai";

// Define a model via the AI SDK.
const model = openai("gpt-4o-mini");

// Usage payload returned by the SDK.
const usage = {
  inputTokens: 1_000,
  outputTokens: 400,
  totalTokens: 1_400,
};

const costs = await computeCostUSD({
  modelId: model.modelId,
  provider: model.provider ?? model.providerId,
  usage,
});

console.log(costs.totalTokenCostUSD);
```

Tokenlens normalizes provider ids that include namespaces (e.g., `openai.responses`) and understands the AI SDK usage fields (`inputTokens`, `outputTokens`, `totalTokens`).

## Attaching cost metadata via middleware

Tokenlens provides a middleware helper for the Vercel AI SDK that adds cost information to the `providerMetadata` of generated responses.

```ts
import { tokenlensMiddleware } from "@tokenlens/vercel";
import { createTokenlens } from "tokenlens";
import { anthropic } from "@ai-sdk/anthropic";

const tokenlens = createTokenlens();

const middleware = tokenlensMiddleware(tokenlens);

const model = anthropic("claude-3-5-sonnet-20241022").withMiddleware(middleware);

const result = await model.invoke("Hello!");

console.log(result.providerMetadata?.tokenlens?.costs); // Token cost breakdown
```

The middleware calls `tokenlens.computeCostUSD` internally using the model metadata and usage provided by the SDK.

## Custom Tokenlens instances

If you need to control sources or caching, create your own Tokenlens instance and pass it to the middleware or call its methods directly.

```ts
import { createTokenlens } from "tokenlens";
import { createOpenAI } from "@ai-sdk/openai";
import { tokenlensMiddleware } from "@tokenlens/vercel";

const tokenlens = createTokenlens({
  sources: ["openrouter", "package"],
  loaders: {
    package: async () => testProviders,
  },
});

const model = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
  .text("gpt-4o-mini")
  .withMiddleware(tokenlensMiddleware(tokenlens));
```

## Testing integrations

Use Tokenlens' `package` source and fixture catalogs during tests:

```ts
import { createTokenlens } from "tokenlens";
import { tokenlensMiddleware } from "@tokenlens/vercel";
import { createLanguageModel } from "@ai-sdk/provider";
import { testProviders } from "../fixtures/providers";

const tokenlens = createTokenlens({
  sources: ["package"],
  loaders: {
    package: async () => testProviders,
  },
  ttlMs: 0, // always refresh in tests
});

const model = createLanguageModel({ modelId: "openai/gpt-5", provider: "openai" })
  .withMiddleware(tokenlensMiddleware(tokenlens));
```

This isolates integration tests from external API fluctuations while ensuring Tokenlens still performs the same cost calculations as in production.

## Summary

- Tokenlens understands Vercel AI SDK model metadata (`modelId`, `provider`/`providerId`).
- Pass usage payloads directly to `computeCostUSD` or `describeModel`.
- Use `@tokenlens/vercel` middleware to automatically compute costs when generating responses.
- Customise sources, loaders, and caching via `createTokenlens` when needed.
