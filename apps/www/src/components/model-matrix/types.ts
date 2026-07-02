import type { CatalogViewState } from "@/lib/model-catalog";

export type {
  CatalogSource,
  CatalogStatus,
  CatalogViewState,
  Model,
} from "@/lib/model-catalog";

export interface ModelMatrixProps {
  initialCatalog: CatalogViewState;
}
