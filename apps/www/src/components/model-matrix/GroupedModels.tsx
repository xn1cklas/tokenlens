"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { Model } from "./types";
import { ModelCard } from "./ModelCard";

export function GroupedModels({
  grouped,
}: {
  grouped: Record<string, Model[]>;
}) {
  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-8">
        {Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([provider, providerModels]) => (
            <div key={provider}>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent">
                    {provider[0]}
                  </span>
                </div>
                {provider}
                <span className="text-sm font-normal text-muted-foreground">
                  ({providerModels.length} models)
                </span>
              </h3>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {providerModels.map((model) => (
                  <ModelCard key={model.id} model={model} />
                ))}
              </div>
            </div>
          ))}
      </div>
    </ScrollArea>
  );
}
