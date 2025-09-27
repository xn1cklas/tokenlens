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

1. **Provide loaders** via `TokenlensOptions.loaders`:
   ```ts
   createTokenlens({
     loaders: {
       "models.dev": customModelsDevLoader,
     },
   });
   ```
2. **Install new sources** by adding identifiers to `sources` and providing corresponding loaders.

### Writing a custom loader

```ts
import type { SourceProviders } from "tokenlens";
import type { SourceLoader } from "tokenlens/internal"; // or replicate the signature

const packageLoader: SourceLoader = async () => {
  // Return SourceProviders: { providerId: SourceProvider }
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
  } satisfies SourceProviders;
};
```

## Fetch implementation

Tokenlens requires a `fetch` function to load remote sources. By default it reads from the global environment (`globalThis.fetch`). If your runtime lacks a global fetch (older Node versions, custom environments), pass your own implementation via `TokenlensOptions.fetch`:

```ts
import fetch from "cross-fetch";

const tokenlens = createTokenlens({
  fetch,
});
```

## Caching

Tokenlens caches the merged provider catalog to avoid repeated network calls. The default adapter is an in-memory `MemoryCache` with a 24h TTL.

### Key options

- `ttlMs`: cache duration in milliseconds (default `24 * 60 * 60 * 1000`).
- `cacheKey`: unique identifier for the cached entry. When running multiple instances with different source sets, specify unique keys to avoid collisions.
- `cache`: custom adapter implementing `{ get(key), set(key, entry), delete?(key) }`.

### Example: Redis-backed cache adapter

```ts
import { createClient as createRedisClient } from "redis";
import type { CacheAdapter, CacheEntry } from "tokenlens/internal";

const redis = createRedisClient();
await redis.connect();

const redisCache: CacheAdapter = {
  async get(key) {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as CacheEntry) : undefined;
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

### Error handling

If a loader throws an error and a cached value is available, Tokenlens returns the cached value instead of propagating the error. To force a fresh load, call `Tokenlens#refresh(true)`.

## Refreshing & invalidation

Instances expose:

- `tokenlens.refresh(force?: boolean)`: reloads sources when the cache is stale, or immediately when `force` is true.
- `tokenlens.invalidate()`: clears the cache entry so the next call triggers a reload.

These hooks are useful when you know provider metadata has changed and you want the new values immediately.

## Summary

- Specify sources in the order you want them merged.
- Override or add loaders for custom datasets.
- Configure caching behaviour with `ttlMs`, `cache`, and `cacheKey`.
- Use `refresh()` / `invalidate()` for manual control when needed.

Next: [Integration with Vercel AI SDK](./integrations/vercel-ai-sdk.md)
