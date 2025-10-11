"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

export function ProviderSidebar({
  providers,
  modelsCountByProvider,
  selectedProvider,
  onSelect,
  totalModels,
}: {
  providers: string[];
  modelsCountByProvider: Record<string, number>;
  selectedProvider: string | null;
  onSelect: (provider: string | null) => void;
  totalModels: number;
}) {
  return (
    <div className="lg:w-48 flex-shrink-0">
      <div className="sticky top-24">
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Providers
        </h3>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onSelect(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                !selectedProvider
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              All Providers
              <span className="ml-2 text-xs opacity-60">({totalModels})</span>
            </button>
            {providers.map((provider) => {
              const count = modelsCountByProvider[provider] ?? 0;
              return (
                <button
                  type="button"
                  key={provider}
                  onClick={() => onSelect(provider)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedProvider === provider
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {provider}
                  <span className="ml-2 text-xs opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
