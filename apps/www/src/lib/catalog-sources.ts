import {
  CATALOG_SOURCE_OPTIONS,
  type CatalogSourceId,
  isCatalogSourceId,
} from "@tokenlens/fetch";

export type CatalogSource = CatalogSourceId;

export { CATALOG_SOURCE_OPTIONS };

export function isCatalogSource(value: string): value is CatalogSource {
  return isCatalogSourceId(value);
}
