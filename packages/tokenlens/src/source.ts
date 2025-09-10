import { getModels } from "@tokenlens/models";

/**
 * Default static catalog built from @tokenlens/models (models.dev-compatible shape).
 *
 * @deprecated Prefer constructing a smaller catalog via `catalogFromModelArrays([...])` from
 * `@tokenlens/models/api` or importing specific providers and building a tiny catalog.
 */
export const defaultCatalog = getModels();
