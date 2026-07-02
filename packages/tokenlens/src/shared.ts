import { Tokenlens } from "./client.js";
import type { TokenlensOptions } from "./types.js";

const instances = new Map<string, Tokenlens>();

function primitiveSharedKey(options?: TokenlensOptions): string | undefined {
  if (!options) return "default";
  const catalog = options.catalog ?? "openrouter";
  if (typeof catalog !== "string") return undefined;
  if (
    options.overrides ||
    (options.cache !== undefined && options.cache !== false) ||
    options.fetch ||
    options.signal ||
    options.tokenizer
  ) {
    return undefined;
  }

  return JSON.stringify({
    cacheKey: options.cacheKey,
    catalog,
    cache: options.cache,
    staleIfError: options.staleIfError,
    sourceOptions: options.sourceOptions,
    timeoutMs: options.timeoutMs,
    ttlMs: options.ttlMs,
  });
}

/**
 * Lazily creates or returns a shared Tokenlens instance for primitive options.
 * Complex DI options are intentionally not globally cached; pass a configured
 * client to top-level helpers when reuse matters.
 */
export function getTokenlens(options?: TokenlensOptions): Tokenlens {
  const key = primitiveSharedKey(options);
  if (!key) {
    return new Tokenlens(options);
  }

  let instance = instances.get(key);
  if (!instance) {
    instance = new Tokenlens(options);
    instances.set(key, instance);
  }
  return instance;
}

/**
 * Utility for tests to override the shared Tokenlens instance.
 */
export function setSharedTokenlens(tokenlens?: Tokenlens) {
  instances.clear();
  if (tokenlens) {
    instances.set("default", tokenlens);
  }
}
