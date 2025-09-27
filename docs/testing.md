# Testing with Tokenlens

Tokenlens is designed to work well in controlled test environments. This guide shows how to provide deterministic provider data, disable caching, and validate cost computations reliably.

## Goals
- Avoid network calls during tests.
- Use fixture provider catalogs to ensure reproducible cost expectations.
- Keep unit and integration tests fast and deterministic.

## Fixtures via the `package` source

Create a Tokenlens instance that loads only from the `package` source and returns your fixture catalog.

```ts
import { createTokenlens } from "tokenlens";
import type { SourceProviders } from "tokenlens";

const testProviders: SourceProviders = {
  openai: {
    id: "openai",
    source: "package",
    models: {
      "openai/gpt-5": {
        id: "openai/gpt-5",
        limit: { context: 200_000, output: 8_192 },
        cost: { input: 30, output: 60 },
      },
    },
  },
};

export function createTestTokenlens() {
  return createTokenlens({
    sources: ["package"],
    ttlMs: 0, // ensure fresh load for each test if needed
    loaders: {
      package: async () => testProviders,
    },
  });
}
```

### Example unit test

```ts
import { expect, test } from "vitest";
import { createTestTokenlens } from "./tokenlens-test-instance";

const tokenlens = createTestTokenlens();

test("computes cost for GPT-5 fixture", async () => {
  const costs = await tokenlens.computeCostUSD({
    modelId: "openai/gpt-5",
    usage: { input_tokens: 120, output_tokens: 80 },
  });

  expect(costs.inputTokenCostUSD).toBeCloseTo(0.0036, 6);
  expect(costs.outputTokenCostUSD).toBeCloseTo(0.0048, 6);
});
```

## Working with standalone helpers in tests

If your production code uses the module-level helpers, consider injecting the configured Tokenlens instance into the code under test or mocking the helper functions.

```ts
// Example: injecting a Tokenlens instance

import { createTestTokenlens } from "./tokenlens-test-instance";
import { costEstimator } from "../cost-estimator"; // your module that uses Tokenlens

const tokenlens = createTestTokenlens();

const result = await costEstimator({
  tokenlens,
  modelId: "openai/gpt-5",
  usage,
});
```

Alternatively, mock `tokenlens` helper imports using your test runner (e.g., Vitest’s `vi.mock`).

## Integration tests with Vercel AI SDK

Use Tokenlens' `package` source to seed data and pass the instance into the `tokenlensMiddleware` exported by `@tokenlens/vercel`.

```ts
import { createTestTokenlens } from "./tokenlens-test-instance";
import { tokenlensMiddleware } from "@tokenlens/vercel";
import { openai } from "@ai-sdk/openai";

const tokenlens = createTestTokenlens();

const model = openai("gpt-5").withMiddleware(tokenlensMiddleware(tokenlens));

const response = await model.invoke("hi");

expect(response.providerMetadata?.tokenlens?.costs?.totalTokenCostUSD).toBeCloseTo(0.0084, 6);
```

## Refreshing and invalidating during tests

Call `tokenlens.refresh(true)` to force a reload after mutating fixtures, or `tokenlens.invalidate()` to clear cached data between test cases.

```ts
tokenlens.invalidate();
await tokenlens.refresh(true);
```

## Summary
- Prefer the `package` source for deterministic fixture catalogs.
- Disable caching (`ttlMs: 0`) or invalidate as needed to keep tests isolated.
- Inject configured Tokenlens instances into the code under test to avoid hitting production loaders.
- Use middleware-friendly helpers when integrating with the Vercel AI SDK.
