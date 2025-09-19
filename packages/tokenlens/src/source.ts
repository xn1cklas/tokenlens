import type { ModelCatalog } from "@tokenlens/core";
import { getModels } from "@tokenlens/models";

/**
 * Default static catalog built from `@tokenlens/models` (models.dev-compatible shape).
 *
 * @deprecated Prefer a smaller catalog: import specific providers from
 * `@tokenlens/models/providers/*` and compose your own set, or use
 * `getModels()` from `@tokenlens/models` and filter.
 */
export const defaultCatalog: ModelCatalog = getModels() as ModelCatalog;
