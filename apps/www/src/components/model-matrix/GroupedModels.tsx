"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ModelCard } from "./ModelCard";
import type { Model } from "./types";

export function GroupedModels({
  grouped,
}: {
  grouped: Record<string, Model[]>;
}) {
  const nonEmptyGroups = Object.entries(grouped).filter(
    ([, models]) => models.length > 0,
  );
  const hasResults = nonEmptyGroups.length > 0;

  return (
    <div className="flex-1">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
        Models
      </h3>
      <ScrollArea className="h-[70vh] lg:h-[600px] lg:border lg:border-border lg:border-l-0 pr-2 lg:pr-4 lg:p-4">
        <div className="space-y-6 lg:space-y-8 pb-4">
          {hasResults ? (
            nonEmptyGroups
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([provider, providerModels]) => (
                <div key={provider}>
                  <h3 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4 flex items-center gap-2 lg:gap-3 flex-wrap">
                    <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs lg:text-sm font-bold text-accent">
                        {(provider?.[0] ?? "?").toUpperCase()}
                      </span>
                    </div>
                    <span className="break-words">{provider}</span>
                    <span className="text-xs lg:text-sm font-normal text-muted-foreground">
                      ({providerModels.length}{" "}
                      {providerModels.length === 1 ? "model" : "models"})
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                    {providerModels.map((model) => (
                      <ModelCard key={model.id} model={model} />
                    ))}
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No models found matching your search.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
