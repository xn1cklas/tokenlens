/**
 * Provider identifier. We accept any provider string so we can ingest the full
 * models.dev catalog without maintaining a hardcoded allowlist here.
 */
export * from "@tokenlens/core/types";

// Back-compat type aliases (pre-scoped package names)
// These mapped to the models.dev schema in v1.2.x
/**
 * @deprecated Import `ProviderModel` from `@tokenlens/core` instead.
 */
export type ModelsDevModel = import("@tokenlens/core").ProviderModel;
/**
 * @deprecated Import `ProviderInfo` from `@tokenlens/core` instead.
 */
export type ModelsDevProvider = import("@tokenlens/core").ProviderInfo;
/**
 * @deprecated Import `ModelCatalog` from `@tokenlens/core` instead.
 */
export type ModelsDevApi = import("@tokenlens/core").ModelCatalog;
