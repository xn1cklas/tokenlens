---
title: Sources and Caching
description: How sources and loaders work in TokenLens
---

# Sources and Caching in Tokenlens

Tokenlens fetches provider catalogs via *sources*. This document explains how sources and loaders work, how catalogs are merged, and how you can customise caching to fit your runtime.

## Sources

| Source id      | Description                            | Loader behaviour                                                |
| -------------- | -------------------------------------- | --------------------------------------------------------------- |
| `"openrouter"` | Live model metadata from openrouter.ai | Fetches over HTTP using the provided `fetch` implementation.    |
| `"models.dev"` | Static dataset derived from models.dev | Fetches and transforms the packaged JSON dataset.               |
| `"package"`    | User-defined/local data                | Requires you to supply a loader that returns `SourceProviders`. |

### Ordering & precedence

When you pass multiple sources (e.g. `sources: ["package", "openrouter"]`), Tokenlens loads them in order and merges the results. Providers/models defined in earlier sources take precedence when identifiers collide; later sources fill in gaps.

```ts
const tokenlens = createTokenlens({
  sources: ["package", "openrouter"],
  loaders: {
    package: async () => fixtureProviders,
  },
});
```

In this example, `fixtureProviders` overrides specific models, while OpenRouter supplies the rest.

## Loaders

Each source is backed by a loader: `(fetchImpl: FetchLike) => Promise<SourceProviders>`. Built-in loaders live in `packages/tokenlens/src/default-loaders.ts`. You can override them in two ways:

1. **Provide loaders** via `TokenlensOptions.loaders`
2. **Install new sources** by adding identifiers to `sources` and providing corresponding loaders

### Writing a custom loader

```ts
import type { SourceProviders } from "tokenlens";

const packageLoader = async () => {
  return {
    demo: {
      id: "demo",
      source: "package",
      models: {
        "demo/chat": {
          id: "demo/chat",
          name: "Chat Demo",
          cost: { input: 1, output: 1 },
          limit: { context: 128_000 },
        },
      },
    },
  };
};
```

## Caching

Tokenlens caches the merged provider catalog to avoid repeated network calls. The default adapter is an in-memory `MemoryCache` with a 24h TTL.

### Key options

- `ttlMs`: cache duration in milliseconds (default `24 * 60 * 60 * 1000`)
- `cacheKey`: unique identifier for the cached entry
- `cache`: custom adapter implementing `{ get(key), set(key, entry), delete?(key) }`

### Example: Redis-backed cache adapter

```ts
import { createClient as createRedisClient } from "redis";

const redis = createRedisClient();
await redis.connect();

const redisCache = {
  async get(key) {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : undefined;
  },
  async set(key, entry) {
    await redis.set(key, JSON.stringify(entry));
  },
  async delete(key) {
    await redis.del(key);
  },
};

const tokenlens = createTokenlens({
  cache: redisCache,
  cacheKey: "tokenlens:openrouter",
  ttlMs: 30 * 60 * 1000,
});
```

### No caching

Set `ttlMs: 0` to force Tokenlens to reload sources on every call—useful for short-lived test runs.

## Refreshing & invalidation

Instances expose:

- `tokenlens.refresh(force?: boolean)`: reloads sources when the cache is stale
- `tokenlens.invalidate()`: clears the cache entry so the next call triggers a reload

These hooks are useful when you know provider metadata has changed and you want the new values immediately.

