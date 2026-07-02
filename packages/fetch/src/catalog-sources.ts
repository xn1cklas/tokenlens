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

const CATALOG_SOURCE_IDS = CATALOG_SOURCE_OPTIONS.map((source) => source.value);

export function isCatalogSourceId(value: string): value is CatalogSourceId {
  return CATALOG_SOURCE_IDS.includes(value as CatalogSourceId);
}

export function normalizeCatalogGateway(
  gateway: CatalogGatewayId,
): CatalogSourceId {
  return gateway === "auto" ? "openrouter" : gateway;
}

export function fetchCatalogSource(
  source: CatalogGatewayId,
  options?: CommonOptions,
): Promise<SourceProviders> {
  switch (normalizeCatalogGateway(source)) {
    case "models.dev":
      return fetchModelsDev(options);
    case "vercel":
      return fetchVercel(options);
    case "openrouter":
      return fetchOpenrouter(options);
  }
}
