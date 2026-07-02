"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { GroupedModels } from "./model-matrix/GroupedModels";
import { LastUpdated } from "./model-matrix/LastUpdated";
import { ProviderSidebar } from "./model-matrix/ProviderSidebar";
import { SearchControls } from "./model-matrix/SearchControls";
import type { ModelMatrixProps } from "./model-matrix/types";
import { useModelCatalog } from "./model-matrix/use-model-catalog";
import { groupModelsByProvider } from "./model-matrix/utils";

export function ModelMatrix({ initialCatalog }: ModelMatrixProps) {
  const {
    activeCatalog,
    handleProviderSelect,
    handleSearchChange,
    handleSourceChange,
    isCatalogQueryCurrent,
    isLoading,
    isLoadingMore,
    loadMore,
    models,
    search,
    selectedProvider,
    source,
  } = useModelCatalog(initialCatalog);

  const groupedModels = useMemo(() => groupModelsByProvider(models), [models]);
  const totalModels = activeCatalog?.totalModels ?? 0;
  const remainingModels = Math.max(0, totalModels - models.length);
  const hasMoreModels = isCatalogQueryCurrent && remainingModels > 0;

  return (
    <div className="space-y-4 lg:space-y-6">
      <SearchControls
        search={search}
        onSearchChange={handleSearchChange}
        source={source}
        onSourceChange={handleSourceChange}
      />

      <div className="space-y-2">
        <LastUpdated lastUpdated={activeCatalog?.lastUpdated} />
        {isLoading && (
          <p className="text-xs text-muted-foreground">Loading catalog...</p>
        )}
        {activeCatalog?.status === "fallback" && (
          <p className="text-xs text-muted-foreground">
            Showing OpenRouter data because the selected catalog is unavailable.
          </p>
        )}
        {activeCatalog?.status === "error" && (
          <p className="text-xs text-destructive">
            {activeCatalog.error ?? "Catalog is unavailable."}
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-0">
        <ProviderSidebar
          providers={activeCatalog?.providers ?? []}
          modelsCountByProvider={activeCatalog?.modelsCountByProvider ?? {}}
          selectedProvider={selectedProvider}
          onSelect={handleProviderSelect}
          totalModels={activeCatalog?.sourceTotalModels ?? 0}
        />

        <GroupedModels grouped={groupedModels} />
      </div>

      {hasMoreModels && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            disabled={isLoadingMore}
            onClick={loadMore}
          >
            {isLoadingMore
              ? "Loading..."
              : `Load more models (${remainingModels} remaining)`}
          </Button>
        </div>
      )}
    </div>
  );
}
