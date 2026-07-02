import { Tokenlens } from "./client.js";
import type { GatewayId } from "./types.js";

const instances = new Map<GatewayId, Tokenlens>();

/**
 * Lazily creates or returns the shared Tokenlens instance for a given catalog.
 */
export function getTokenlens(catalog?: GatewayId): Tokenlens {
  const key = catalog ?? "auto";
  let instance = instances.get(key);
  if (!instance) {
    instance = new Tokenlens({ catalog: key });
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
    instances.set("auto", tokenlens);
  }
}
