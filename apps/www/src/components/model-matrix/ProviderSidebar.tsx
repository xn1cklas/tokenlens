"use client";

import { Filter, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

function ProviderList({
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
  );
}

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
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (provider: string | null) => {
    onSelect(provider);
    setMobileOpen(false);
  };

  // Handle escape key to close modal
  useEffect(() => {
    if (mobileOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setMobileOpen(false);
        }
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile Filter Button */}
      <Button
        variant="outline"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="w-full justify-between lg:hidden"
      >
        <span className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          {selectedProvider || "All Providers"}
        </span>
        <span className="text-xs opacity-60">
          (
          {selectedProvider
            ? modelsCountByProvider[selectedProvider]
            : totalModels}
          )
        </span>
      </Button>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-0 bottom-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-background">
              <h3 className="text-lg font-semibold">Filter by Provider</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileOpen(false)}
                aria-label="Close filter"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[60vh] p-4 bg-background">
              <ProviderList
                providers={providers}
                modelsCountByProvider={modelsCountByProvider}
                selectedProvider={selectedProvider}
                onSelect={handleSelect}
                totalModels={totalModels}
              />
            </ScrollArea>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-48 flex-shrink-0">
        <div className="sticky top-24">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Providers
          </h3>
          <ScrollArea className="h-[600px] border border-border pr-4">
            <ProviderList
              providers={providers}
              modelsCountByProvider={modelsCountByProvider}
              selectedProvider={selectedProvider}
              onSelect={onSelect}
              totalModels={totalModels}
            />
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
