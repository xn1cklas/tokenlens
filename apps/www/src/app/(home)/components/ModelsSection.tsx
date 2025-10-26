import { AlertCircle } from "lucide-react";
import { ModelMatrix } from "@/components/model-matrix";
import type { SourceProvidersLite } from "@/components/model-matrix/types";

export function ModelsSection({
  openrouter,
  modelsdev,
  vercel,
  lastUpdated,
  modelsdevFallback = false,
  vercelFallback = false,
}: {
  openrouter: SourceProvidersLite;
  modelsdev: SourceProvidersLite;
  vercel: SourceProvidersLite;
  lastUpdated: number;
  modelsdevFallback?: boolean;
  vercelFallback?: boolean;
}) {
  const showFallbackWarning = modelsdevFallback || vercelFallback;
  const fallbackSources = [
    modelsdevFallback && "models.dev",
    vercelFallback && "Vercel AI Gateway",
  ]
    .filter(Boolean)
    .join(" and ");

  return (
    <section id="models" className="py-24 sm:py-32 bg-card/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
              50+ AI Models Supported
            </h2>
            <p className="text-lg text-muted-foreground text-balance mb-4">
              Accurate token counting for all major language models. Search,
              filter, and explore.
            </p>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border text-sm text-muted-foreground max-w-2xl mx-auto">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>
                  Model data sourced from public directories (OpenRouter,
                  models.dev, Vercel AI Gateway). While we strive for accuracy,
                  we cannot guarantee 100% correctness.
                </span>
              </div>
              {showFallbackWarning && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200 max-w-2xl mx-auto rounded">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Unable to fetch data from {fallbackSources}. Showing
                    OpenRouter models instead.
                  </span>
                </div>
              )}
            </div>
          </div>

          <ModelMatrix
            openrouter={openrouter}
            modelsdev={modelsdev}
            vercel={vercel}
            lastUpdated={lastUpdated}
          />
        </div>
      </div>
    </section>
  );
}
