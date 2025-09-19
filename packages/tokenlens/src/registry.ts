import { createRegistry } from "@tokenlens/core/registry";
import type { Model } from "@tokenlens/core/types";
import { sourceFromCatalog } from "@tokenlens/helpers";
import { getModels } from "@tokenlens/models";

// Build a static registry from the generated catalog
const catalog = getModels();
const source = sourceFromCatalog(catalog);
const all = source.list();
const reg = createRegistry(all as unknown as readonly Model[]);

/**
 * @deprecated Use `@tokenlens/core/registry` with a catalog from
 * `@tokenlens/models` or `@tokenlens/fetch` instead.
 */
export const MODEL_IDS = reg.MODEL_IDS;
/**
 * @deprecated Use `@tokenlens/core/registry` created from your own catalog.
 */
export const models = reg.models;
/**
 * @deprecated Use `@tokenlens/core/registry` created from your own catalog.
 */
export const aliases = reg.aliases;
/**
 * @deprecated Use `@tokenlens/core/registry` created from your own catalog.
 */
export const getModelRaw = reg.getModelRaw;
/**
 * @deprecated Use `@tokenlens/core/registry` created from your own catalog.
 */
export const resolveModel = reg.resolveModel;
/**
 * @deprecated Prefer calling `isModelId` on a registry you create via
 * `@tokenlens/core/registry`. Note: model ids are plain `string` in v1.3+;
 * this function is a runtime guard only.
 */
export const isModelId = (value: string): value is ModelId =>
  (MODEL_IDS as readonly string[]).includes(value);
/**
 * @deprecated Prefer `assertModelId` from a registry you create via
 * `@tokenlens/core/registry`. Note: model ids are plain `string` in v1.3+;
 * this is a runtime assertion only.
 */
export const assertModelId = (value: string): asserts value is ModelId => {
  if (!isModelId(value)) throw new Error(`Unknown model id: ${value}`);
};
/**
 * @deprecated Use `@tokenlens/core/registry` created from your own catalog.
 */
export const listModels = reg.listModels;

// Back-compat type: union of canonical model IDs
/**
 * @deprecated Model ids are plain `string` in v1.3+. Migrate to `string`.
 * If you need a literal union, derive it from your own curated catalog
 * array in application code (not from `createRegistry`).
 */
export type ModelId = (typeof MODEL_IDS)[number];
