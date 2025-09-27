import type { CacheAdapter, CacheEntry } from "./types.js";

export class MemoryCache implements CacheAdapter {
  private store = new Map<string, CacheEntry>();
  get(key: string) {
    return this.store.get(key);
  }
  set(key: string, entry: CacheEntry) {
    this.store.set(key, entry);
  }
  delete(key: string) {
    this.store.delete(key);
  }
}

export function jitter(ms: number): number {
  const j = Math.floor(ms * 0.05);
  return ms + Math.floor((Math.random() * 2 - 1) * j);
}
