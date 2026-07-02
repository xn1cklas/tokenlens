import type { SourceProviders } from "@tokenlens/core";
import { fetchModelsDev } from "./models-dev.js";
import { fetchOpenrouter } from "./openrouter.js";
import type { CommonOptions } from "./types.js";
import { fetchVercel } from "./vercel.js";

export const CATALOG_SOURCE_OPTIONS = [
  { value: "openrouter", label: "OpenRouter" },
  { value: "models.dev", label: "Models.dev" },
  { value: "vercel", label: "Vercel AI Gateway" },
] as const;

export type CatalogSourceId = (typeof CATALOG_SOURCE_OPTIONS)[number]["value"];
export type CatalogGatewayId = "auto" | CatalogSourceId;
export type CatalogSource = {
  id: string;
  cacheKey?: string;
  load(options?: CommonOptions): Promise<SourceProviders>;
};
export type CatalogInput = CatalogGatewayId | CatalogSource;

const CATALOG_SOURCE_IDS = CATALOG_SOURCE_OPTIONS.map((source) => source.value);

export function isCatalogSourceId(value: string): value is CatalogSourceId {
  return CATALOG_SOURCE_IDS.includes(value as CatalogSourceId);
}

export function normalizeCatalogGateway(
  gateway: CatalogGatewayId,
): CatalogSourceId {
  return gateway === "auto" ? "openrouter" : gateway;
}

export function isCatalogSource(value: unknown): value is CatalogSource {
  return (
    !!value &&
    typeof value === "object" &&
    "load" in value &&
    typeof (value as { load?: unknown }).load === "function" &&
    "id" in value &&
    typeof (value as { id?: unknown }).id === "string"
  );
}

export function catalogInputCacheKey(source: CatalogInput): string {
  return typeof source === "string" ? source : (source.cacheKey ?? source.id);
}

export function fetchCatalogSource(
  source: CatalogInput,
  options?: CommonOptions,
): Promise<SourceProviders> {
  if (isCatalogSource(source)) {
    return source.load(options);
  }

  switch (normalizeCatalogGateway(source)) {
    case "models.dev":
      return fetchModelsDev(options);
    case "vercel":
      return fetchVercel(options);
    case "openrouter":
      return fetchOpenrouter(options);
  }
}
