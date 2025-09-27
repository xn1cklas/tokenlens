import { describe, expect, it, beforeEach } from "vitest";

import { MemoryCache, jitter } from "../src/cache.js";
import type { CacheAdapter, CacheEntry } from "../src/types.js";

function makeEntry(
  value: CacheEntry["value"],
  expiresInMs: number,
): CacheEntry {
  return {
    value,
    expiresAt: Date.now() + expiresInMs,
  } satisfies CacheEntry;
}

describe("MemoryCache", () => {
  let cache: CacheAdapter;

  beforeEach(() => {
    cache = new MemoryCache();
  });

  it("stores and retrieves entries", () => {
    const entry = makeEntry({ hello: "world" }, 1_000);
    cache.set("key", entry);
    expect(cache.get("key")).toEqual(entry);
  });

  it("deletes entries", () => {
    const entry = makeEntry({ ok: true }, 1_000);
    cache.set("key", entry);
    cache.delete?.("key");
    expect(cache.get("key")).toBeUndefined();
  });

  it("overrides existing entries", () => {
    const first = makeEntry({ value: 1 }, 1_000);
    const second = makeEntry({ value: 2 }, 1_000);
    cache.set("key", first);
    cache.set("key", second);
    expect(cache.get("key")).toEqual(second);
  });

  it("returns undefined for missing keys", () => {
    expect(cache.get("missing")).toBeUndefined();
  });
});

describe("jitter", () => {
  it("stays within ±5% bounds for many samples", () => {
    const base = 1_000;
    const min = base - Math.floor(base * 0.05);
    const max = base + Math.floor(base * 0.05);
    for (let i = 0; i < 1_000; i++) {
      const sampled = jitter(base);
      expect(sampled).toBeGreaterThanOrEqual(min);
      expect(sampled).toBeLessThanOrEqual(max);
    }
  });

  it("returns integers", () => {
    const base = 1_234;
    for (let i = 0; i < 100; i++) {
      const sampled = jitter(base);
      expect(Number.isInteger(sampled)).toBe(true);
    }
  });

  it("leaves zero unchanged", () => {
    expect(jitter(0)).toBe(0);
  });

  it("handles negative inputs by mirroring bounds", () => {
    const base = -1_000;
    const min = base - Math.floor(Math.abs(base) * 0.05);
    const max = base + Math.floor(Math.abs(base) * 0.05);
    for (let i = 0; i < 100; i++) {
      const sampled = jitter(base);
      expect(sampled).toBeGreaterThanOrEqual(min);
      expect(sampled).toBeLessThanOrEqual(max);
    }
  });
});
