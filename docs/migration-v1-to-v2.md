# Tokenlens v1 → v2 Migration Guide

Tokenlens v2 replaces the all-in-one helper bundle with a focused client that loads real-time provider data, handles caching, and exposes a minimal helper surface. This guide maps each common v1 pattern to its v2 counterpart, explains the rationale, and lists the precise migration steps.

## Quick Checklist
- Replace legacy helpers with `describeModel`, `estimateCostUSD`, and `getContextLimits` (either via dedicated `Tokenlens` instances or top-level helpers that reuse the shared instance internally).
- Swap static catalog imports for your own `Tokenlens` instance when you need custom sources/loaders.
- Remove conversation/compaction helpers (`shouldCompact`, `contextHealth`, etc.) from production code; re-implement app-specific logic on top of `describeModel`.
- Delete usages of registry globals (`MODEL_IDS`, `resolveModel`, etc.); rely on `Tokenlens#getProviders()` if you truly need the raw catalog.
- Update docs/README snippets to use the new API names and the default OpenRouter source.

## The Tokenlens class at a glance
- **Single responsibility**: load provider data from one or more *sources* (OpenRouter by default) and expose consistent helpers (`estimateCostUSD`, `describeModel`, `getContextLimits`).
- **Lazy shared instance**: module-level helpers create a default instance on first use so you can call them without setup.
- **Custom instances**: `createTokenlens(options)` lets you choose sources, provide custom loaders, tweak TTL, or plug in your own cache adapter.
- **Caching**: by default, provider catalogs are cached in-memory for 24 hours with jitter. Control this via `ttlMs` or a custom `cache`. Errors fall back to the last cached value when possible.
- **Multiple sources**: instances can merge data from several sources. Sources are applied in order—earlier sources can override models, later sources fill gaps.

See the README for end-to-end examples of both standalone helpers and configured instances.

## What Changed and Why

| Area                 | v1 pattern                                                                                                                       | v2 replacement                                                                                                                                                                                       | Why it changed / Benefit                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| API surface          | Root module re-exported most scoped packages plus legacy sync helpers.                                                           | Root module exports `Tokenlens`, `createTokenlens`, `describeModel`, `estimateCostUSD`, `getContextLimits`, and type-only exports (`Usage`, `ModelDetails`, `TokenCosts`, `TokenlensOptions`, etc.). | Smaller surface, clear entry point, no accidental coupling to internals.                    |
| Source data          | Bundled static catalog (`defaultCatalog`, registry wrappers).                                                                    | Sources are loaded via configurable loaders; `openrouter` is the default.                                                                                                                            | Avoids stale data, shrinks bundle size, lets apps decide which datasets to load.            |
| Cost/context helpers | Sync helpers that implicitly read the bundled catalog (`getContext`, `estimateCost`, `remainingContext`, `shouldCompact`, etc.). | Use `describeModel`, `getContextLimits`, `estimateCostUSD`; implement conversation heuristics yourself.                                                                                              | Ensures helpers operate on the same resolved metadata and encourages app-specific policies. |
| Registry helpers     | Global listings (`MODEL_IDS`, `resolveModel`, `listModels`).                                                                     | Access provider catalogs through `Tokenlens#getProviders()` or via `@tokenlens/core` if you need the raw DTOs.                                                                                       | Keeps v2 runtime lean and makes registry logic explicit.                                    |
| Fetch utilities      | Dedicated `fetchModels` helper.                                                                                                  | Call `tokenlens.getProviders()` (auto loads default source) or configure `createTokenlens({ sources: [...] })`.                                                                                      | One code path handles loading, caching, retries.                                            |

## Side-by-Side Imports

```ts
// v1 usage
import {
  getContext,
  estimateCost,
  remainingContext,
  fetchModels,
  MODEL_IDS,
} from "tokenlens";

// v2 usage
import {
  createTokenlens,
  describeModel,
  estimateCostUSD,
  getContextLimits,
  getShared,
} from "tokenlens";

// optional singleton if you don't need custom loaders
const tokenlens = getShared();
const details = await describeModel({ modelId: "openai/gpt-4o", usage });
const cost = await estimateCostUSD({ modelId: "openai/gpt-4o", usage });
const context = await getContextLimits({ modelId: "openai/gpt-4o" });
```

## Migration Steps

### 1. Instantiate or reuse the client

**Old**
```ts
// Helpers implicitly used the bundled catalog
import { getContext, estimateCost } from "tokenlens";
const context = getContext("openai/gpt-4o");
const cost = estimateCost({ modelId: "openai/gpt-4o", usage });
```

**New**
```ts
import { createTokenlens } from "tokenlens";

const tokenlens = createTokenlens();
const details = await tokenlens.describeModel({ modelId: "openai/gpt-4o", usage });
const context = await tokenlens.getContextLimits({ modelId: "openai/gpt-4o" });
const cost = await tokenlens.estimateCostUSD({ modelId: "openai/gpt-4o", usage });
```

**Why**: The client keeps provider catalogs in sync, enforces loader availability, and caches responses so all helper calls share the same data. If you don't need custom options and are comfortable with defaults, the module-level helpers will reuse a shared instance automatically.

### 2. Replace catalog-dependent helpers

Focus on re-implementing only the app-specific bits you truly need. `describeModel` already returns contextual hints and cost breakdowns.

**Old**
```ts
import { remainingContext, shouldCompact } from "tokenlens";
const { remainingCombined, percentUsed } = remainingContext({ modelId, usage });
const compact = shouldCompact({ modelId, usage, threshold: 0.85 });
```

**New**
```ts
const { limit, costs } = await tokenlens.describeModel({ modelId, usage });
const totalTokens = usage.prompt_tokens! + usage.completion_tokens!;
const remainingCombined = limit?.context ? Math.max(0, limit.context - totalTokens) : undefined;
const percentUsed = limit?.context ? totalTokens / limit.context : 1;
const compact = percentUsed >= 0.85;
const totalUsd = costs?.totalTokenCostUSD ?? 0;
```

**Why**: v2 intentionally drops opinionated compaction/budgeting helpers. Consumers own the heuristics; Tokenlens supplies accurate metadata and costs.

### 3. Drop registry globals

**Old**
```ts
import { MODEL_IDS, resolveModel } from "tokenlens";
const alts = MODEL_IDS.filter((id) => id.startsWith("openai:"));
const model = resolveModel("gpt-4o");
```

**New**
```ts
const providers = await tokenlens.getProviders();
const model = providers.openai?.models?.["openai/gpt-4o"];
const allIds = Object.values(providers)
  .flatMap((p) => Object.keys(p.models ?? {}));
```

**Why**: Removing the bundled registry keeps installs small and guarantees you work with the same catalog that powered your helper calls.

### 4. Swap asynchronous fetch helpers

**Old**
```ts
import { fetchModels } from "tokenlens";
const catalog = await fetchModels();
```

**New**
```ts
const providers = await tokenlens.getProviders(); // defaults to OpenRouter source
// or configure: createTokenlens({ sources: ["models.dev"], loaders: { ... } })
```

### 5. Recreate conversation/cost rollups as needed

Helpers such as `estimateConversationCost`, `nextTurnBudget`, `contextHealth`, `tokensRemaining`, and `shouldCompact` were frequently tailored downstream. With v2:

- Use `tokenlens.describeModel({ modelId, usage })` to obtain limits, costs, and hints.
- Aggregate usage metrics in your domain objects.
- Apply your own heuristics for compaction, leak warnings, or budgeting.

Tokenlens no longer ships replacements for these helpers. This is intentional: they deferred too many policy decisions to the library and became hard to maintain.

## Benefits Recap

- **Smaller install & clearer API**: No more accidental pulls of scoped packages or large static catalogs.
- **Explicit data ownership**: Apps decide which sources load and when they refresh, reducing surprise updates.
- **Consistent helper behaviour**: `describeModel`, `estimateCostUSD`, and `getContextLimits` all operate on the same cached provider data.
- **Easier customization**: With opinionated conversation helpers removed, you can tailor budgeting, compaction, and reporting to your product.

## FAQ

**Do I need to import other packages now?**
No. Creating a client, inspecting models, and estimating costs are all exposed directly from `tokenlens` v2. Additional DTO types (`Usage`, `ModelDetails`, `TokenlensOptions`, etc.) are re-exported for convenience.

**Can I keep a singleton?**
Yes. The module helpers (`estimateCostUSD`, etc.) reuse a shared client internally. If you need custom options, create your own `createTokenlens()` factory and reuse that instance.

**How do I seed tests without hitting the network?**
Pass `sources: ["package"]` and provide a `package` loader that returns your fixture catalog.

---

If anything is missing or unclear, please open an issue so we can refine this guide.


