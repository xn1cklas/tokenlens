import {
  Boxes,
  CheckCircle2,
  Code2,
  Gauge,
  Lock,
  Shield,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            Minimal by design. Powerful by nature.
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Everything you need for token counting. Nothing you don't.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 max-w-7xl mx-auto">
          <Card className="md:col-span-6 lg:col-span-7 p-8 bg-gradient-to-br from-accent/5 via-background to-background border-border hover:border-accent/50 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors" />
            <div className="relative">
              <div className="h-14 w-14 bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Multi-Source Catalog</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Auto-fetches from OpenRouter or models.dev with built-in
                caching. Configurable TTL with jitter to avoid cache stampedes.
                Always up-to-date model metadata.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-accent animate-pulse" />
                  <span className="text-muted-foreground">
                    24-hour cache with jitter
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="md:col-span-3 lg:col-span-5 p-8 bg-background border-border hover:border-accent/50 transition-all group">
            <div className="h-12 w-12 bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Code2 className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Simple API</h3>
            <p className="text-muted-foreground leading-relaxed text-sm mb-4">
              Six methods: computeCostUSD, getModelData, getContextLimits,
              getContextHealth, countTokens, estimateCostUSD. That's it.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 text-xs font-medium">
              Minimal API surface
            </div>
          </Card>

          <Card className="md:col-span-3 lg:col-span-4 p-6 bg-background border-border hover:border-accent/50 transition-all group">
            <div className="h-10 w-10 bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Strong TypeScript</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Full type safety for model IDs, usage objects, and return types
            </p>
          </Card>

          <Card className="md:col-span-3 lg:col-span-5 p-8 bg-gradient-to-br from-purple-500/5 via-background to-background border-border hover:border-accent/50 transition-all group relative overflow-hidden">
            <div className="absolute bottom-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
                role="img"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="8"
                  fill="currentColor"
                  className="text-accent"
                />
                <circle
                  cx="60"
                  cy="20"
                  r="8"
                  fill="currentColor"
                  className="text-accent"
                />
                <circle
                  cx="100"
                  cy="20"
                  r="8"
                  fill="currentColor"
                  className="text-accent"
                />
                <circle
                  cx="20"
                  cy="60"
                  r="8"
                  fill="currentColor"
                  className="text-accent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="8"
                  fill="currentColor"
                  className="text-accent"
                />
                <circle
                  cx="100"
                  cy="60"
                  r="8"
                  fill="currentColor"
                  className="text-accent"
                />
                <circle
                  cx="20"
                  cy="100"
                  r="8"
                  fill="currentColor"
                  className="text-accent"
                />
                <circle
                  cx="60"
                  cy="100"
                  r="8"
                  fill="currentColor"
                  className="text-accent"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="8"
                  fill="currentColor"
                  className="text-accent"
                />
              </svg>
            </div>
            <div className="relative">
              <div className="h-12 w-12 bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Boxes className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Model IDs</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Supports provider/model, model only, or separate provider
                parameter. Works however you need it to.
              </p>
            </div>
          </Card>

          <Card className="md:col-span-3 lg:col-span-3 p-6 bg-background border-border hover:border-accent/50 transition-all group">
            <div className="h-10 w-10 bg-orange-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Lock className="h-5 w-5 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Zero Dependencies</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              No external dependencies. Better security and smaller bundle size.
            </p>
          </Card>

          <Card className="md:col-span-6 lg:col-span-8 p-8 bg-background border-border hover:border-accent/50 transition-all group relative overflow-hidden">
            <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
                role="img"
              >
                <path
                  d="M100 20L180 60V140L100 180L20 140V60L100 20Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-accent"
                />
                <path
                  d="M100 50L150 75V125L100 150L50 125V75L100 50Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-accent"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="15"
                  fill="currentColor"
                  className="text-accent"
                />
              </svg>
            </div>
            <div className="relative">
              <div className="h-12 w-12 bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Gauge className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                Context Health Monitoring
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">
                Track context window usage with getContextHealth. Know when
                you're approaching limits before errors occur.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted text-xs font-medium">
                  <CheckCircle2 className="h-3 w-3 text-accent" />
                  Healthy (&lt;70%)
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted text-xs font-medium">
                  <CheckCircle2 className="h-3 w-3 text-accent" />
                  Warning (70-90%)
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted text-xs font-medium">
                  <CheckCircle2 className="h-3 w-3 text-accent" />
                  Critical (&gt;90%)
                </div>
              </div>
            </div>
          </Card>

          <Card className="md:col-span-3 lg:col-span-4 p-6 bg-background border-border hover:border-accent/50 transition-all group">
            <div className="h-10 w-10 bg-accent/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Accurate Tokenizers</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Matches official tokenizers exactly. No billing surprises.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
