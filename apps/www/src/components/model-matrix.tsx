"use client";

import { useMemo, useState } from "react";
import { GroupedModels } from "./model-matrix/GroupedModels";
import { LastUpdated } from "./model-matrix/LastUpdated";
import { ProviderSidebar } from "./model-matrix/ProviderSidebar";
import {
  SearchControls,
  type SourceValue,
} from "./model-matrix/SearchControls";
import type { ModelMatrixProps } from "./model-matrix/types";
import {
  buildModelsFromCatalog,
  countModelsByProvider,
  filterModels,
  getProviders,
  groupModelsByProvider,
} from "./model-matrix/utils";

export function ModelMatrix({
  openrouter,
  modelsdev,
  lastUpdated,
}: ModelMatrixProps) {
  const [source, setSource] = useState<SourceValue>("openrouter");
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const currentCatalog = useMemo(
    () => (source === "openrouter" ? openrouter : modelsdev),
    [source, openrouter, modelsdev],
  );

  const models = useMemo(
    () => buildModelsFromCatalog(currentCatalog),
    [currentCatalog],
  );

  const providers = useMemo(() => getProviders(models), [models]);
  const modelsCountByProvider = useMemo(
    () => countModelsByProvider(models),
    [models],
  );

  const filteredModels = useMemo(
    () => filterModels(models, search, selectedProvider),
    [models, search, selectedProvider],
  );

  const groupedModels = useMemo(
    () => groupModelsByProvider(filteredModels),
    [filteredModels],
  );

  return (
    <div className="space-y-6">
      <SearchControls
        search={search}
        onSearchChange={setSearch}
        source={source}
        onSourceChange={setSource}
      />

      <LastUpdated lastUpdated={lastUpdated} />

      {
        <>
          <div className="flex flex-col lg:flex-row gap-6">
            <ProviderSidebar
              providers={providers}
              modelsCountByProvider={modelsCountByProvider}
              selectedProvider={selectedProvider}
              onSelect={setSelectedProvider}
              totalModels={models.length}
            />

            <div className="flex-1">
              <GroupedModels grouped={groupedModels} />

              {filteredModels.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No models found matching your search.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      }
    </div>
  );
}
