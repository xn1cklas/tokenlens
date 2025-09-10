import { createRegistry } from "@tokenlens/core/registry";
import type { Model } from "@tokenlens/core/types";
import { sourceFromCatalog } from "@tokenlens/helpers";
import { getModels } from "@tokenlens/models";

// Build a static registry from the generated catalog
const catalog = getModels();
const source = sourceFromCatalog(catalog);
const all = source.list();
const reg = createRegistry(all as unknown as readonly Model[]);

export const MODEL_IDS = reg.MODEL_IDS;
export const models = reg.models;
export const aliases = reg.aliases;
export const getModelRaw = reg.getModelRaw;
export const resolveModel = reg.resolveModel;
export const isModelId = (value: string): value is string =>
  (MODEL_IDS as readonly string[]).includes(value);
export const assertModelId = (value: string): asserts value is string => {
  if (!isModelId(value)) throw new Error(`Unknown model id: ${value}`);
};
export const listModels = reg.listModels;
