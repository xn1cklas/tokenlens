import { modelsDev } from "./models/models_dev.js";
import type { Model, Provider, Status } from "./types.js";

/**
 * Canonical registry backing array ordered by declaration.
 */
const all = [
  // Sourced from models.dev
  ...modelsDev,
] as const;

export type ModelId = (typeof all)[number]["id"];

/**
 * Readonly list of supported canonical model ids. Useful for autocomplete.
 */
export const MODEL_IDS = all.map((m) => m.id) as readonly ModelId[];

/**
 * Map of canonical id → model metadata, frozen for safety.
 */
export const models: Readonly<Record<ModelId, Model>> = Object.freeze(
  Object.fromEntries(all.map((m) => [m.id, m as Model])) as Record<
    ModelId,
    Model
  >,
);

// Build alias map. Aliases can be (1) provider-less canonical strings or (2) vendor ids.
const aliasEntries: Array<[string, string]> = [];
for (const m of all) {
  const providerPrefix = m.provider + ":";
  // Self entries for convenience (allow resolving raw vendor ids and family names)
  if (m.vendorId) aliasEntries.push([m.vendorId.toLowerCase(), m.id]);
  if (m.family) aliasEntries.push([m.family.toLowerCase(), m.id]);
  // Strip provider prefix for a short alias (e.g. 'gpt-4o')
  if (m.id.startsWith(providerPrefix)) {
    aliasEntries.push([m.id.slice(providerPrefix.length).toLowerCase(), m.id]);
  }
  // Custom aliases
  for (const a of m.aliases ?? []) aliasEntries.push([a.toLowerCase(), m.id]);
}

// If duplicates exist, keep the first in order of declaration
const aliasMap = new Map<string, string>();
for (const [k, v] of aliasEntries) if (!aliasMap.has(k)) aliasMap.set(k, v);

/**
 * Map of case-insensitive alias → canonical id. Includes provider-less ids,
 * vendor ids, family names, and any custom aliases declared on entries.
 */
export const aliases: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(aliasMap),
);

/**
 * Get a model by its canonical id without alias resolution.
 */
export function getModelRaw(id: string): Model | undefined {
  return (models as Record<string, Model>)[id];
}

/**
 * Resolve a model by canonical id or any known alias. Comparison is case-insensitive.
 */
export function resolveModel(idOrAlias: string): Model | undefined {
  const key = idOrAlias.trim().toLowerCase();
  const canonical = (models as Record<string, Model>)[key] ? key : aliases[key];
  return canonical ? (models as Record<string, Model>)[canonical] : undefined;
}

/**
 * Type guard for canonical model ids.
 */
export function isModelId(value: string): value is ModelId {
  return (MODEL_IDS as readonly string[]).includes(value);
}

/**
 * Asserts a value is a `ModelId`, otherwise throws with a helpful error.
 */
export function assertModelId(value: string): asserts value is ModelId {
  if (!isModelId(value)) {
    throw new Error(`Unknown model id: ${value}`);
  }
}

/**
 * List models with optional filtering by provider and/or status.
 */
export function listModels(filter?: {
  provider?: Provider;
  status?: Status;
}): Model[] {
  const arr = Object.values(models);
  return arr.filter((m) => {
    if (filter?.provider && m.provider !== filter.provider) return false;
    if (filter?.status && m.status !== filter.status) return false;
    return true;
  });
}
