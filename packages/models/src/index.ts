import { modelsdevProviders } from "./modelsdev/index.js";
import { openrouterProviders } from "./openrouter/index.js";
import { sourceProvidersFromArray } from "./api.js";
import type { SourceProviders } from "@tokenlens/core";

/**
 * Return the models.dev providers catalog as a `SourceProviders` map.
 * @public
 */
export function getModels(): SourceProviders {
  return sourceProvidersFromArray(Object.values(modelsdevProviders));
}

/**
 * Return the OpenRouter providers catalog as a `SourceProviders` map.
 * @public
 */
export function getOpenrouterModels(): SourceProviders {
  return sourceProvidersFromArray(Object.values(openrouterProviders));
}

export { modelsdevProviders };
export { openrouterProviders };
