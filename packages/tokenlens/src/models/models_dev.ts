/**
 * @deprecated Static bundled catalog access.
 * For new code:
 * - Fetch a live catalog via `fetchModels()` from `@tokenlens/fetch`.
 * - Or build a static catalog via `getModels()` from `@tokenlens/models`,
 *   or import specific providers from `@tokenlens/models/providers/*` and compose your own set.
 */
export { getModels } from "@tokenlens/models";
