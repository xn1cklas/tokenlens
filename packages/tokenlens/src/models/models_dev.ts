/**
 * @deprecated Static bundled catalog access. Prefer the DI-based approach:
 * - fetch live data via `fetchModels()` (async)
 * - or import specific provider modules from `@tokenlens/models/providers/*` and build a small catalog
 *   with `catalogFromModelArrays([...])`.
 */
export { getModels } from "@tokenlens/models";
