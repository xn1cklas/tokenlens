"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Zap, DollarSign, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Model {
  id: string;
  name: string;
  provider: string;
  contextWindow: string;
  tier: "free" | "low" | "mid" | "high";
  features: string[];
  pricing?: {
    prompt: number;
    completion: number;
    currency: string;
  };
}

type SourceModelLite = {
  id?: string;
  name?: string;
  cost?: { input?: number; output?: number };
  limit?: { context?: number };
};

type SourceProvidersLite = Record<string, { models: Record<string, SourceModelLite> }>;

interface ModelMatrixProps {
  openrouter: SourceProvidersLite;
  modelsdev: SourceProvidersLite;
  lastUpdated: number;
}

const tierColors = {
  free: "bg-green-500/10 text-green-500 border-green-500/20",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  mid: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

const tierIcons = {
  free: DollarSign,
  low: Zap,
  mid: Sparkles,
  high: Sparkles,
};

export function ModelMatrix({ openrouter, modelsdev, lastUpdated }: ModelMatrixProps) {
  const [source, setSource] = useState<"openrouter" | "modelsdev">(
    "openrouter",
  );

  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const currentCatalog = useMemo(
    () => (source === "openrouter" ? openrouter : modelsdev),
    [source, openrouter, modelsdev],
  );

  const models = useMemo<Model[]>(() => {
    const out: Model[] = [];
    for (const [providerId, provider] of Object.entries(currentCatalog ?? {})) {
      const modelEntries = provider?.models ?? {};
      for (const [canonicalId, m] of Object.entries(modelEntries)) {
        const id = String(canonicalId ?? m.id ?? "");
        const name = m.name ?? id;
        const context = m.limit?.context ?? 0;
        const prompt = Number.isFinite(m.cost?.input ?? 0)
          ? Number(m.cost?.input)
          : 0;
        const completion = Number.isFinite(m.cost?.output ?? 0)
          ? Number(m.cost?.output)
          : 0;
        out.push({
          id,
          name,
          provider: providerId,
          contextWindow: context ? `${context}` : "-",
          tier:
            prompt === 0 ? "free" : prompt < 0.5 ? "low" : prompt < 3 ? "mid" : "high",
          features: [],
          pricing: { prompt, completion, currency: "USD" },
        });
      }
    }
    return out;
  }, [currentCatalog]);

  const providers = useMemo(() => {
    return Array.from(new Set(models.map((m) => m.provider))).sort();
  }, [models]);

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesSearch =
        model.name.toLowerCase().includes(search.toLowerCase()) ||
        model.provider.toLowerCase().includes(search.toLowerCase()) ||
        model.features.some((f) =>
          f.toLowerCase().includes(search.toLowerCase()),
        );
      const matchesProvider =
        !selectedProvider || model.provider === selectedProvider;
      return matchesSearch && matchesProvider;
    });
  }, [models, search, selectedProvider]);

  const groupedModels = useMemo(() => {
    const groups: Record<string, Model[]> = {};
    filteredModels.forEach((model) => {
      if (!groups[model.provider]) {
        groups[model.provider] = [];
      }
      groups[model.provider].push(model);
    });
    return groups;
  }, [filteredModels]);

  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) return "";
    const date = new Date(lastUpdated);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [lastUpdated]);

  const formatContextK = (value: string): string => {
    const n = Number(value);
    if (!Number.isFinite(n)) return value;
    if (n >= 1000) {
      return `${Math.round(n / 1000)}k`;
    }
    return `${n}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search models, providers, or features..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-background rounded-none"
          />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <label
            htmlFor="source-select"
            className="text-sm font-medium whitespace-nowrap"
          >
            Catalog:
          </label>
          <Select
            value={source}
            onValueChange={(value) =>
              setSource(value as "openrouter" | "modelsdev")
            }
          >
            <SelectTrigger id="source-select" className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openrouter">OpenRouter</SelectItem>
              <SelectItem value="modelsdev">Models.dev</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {lastUpdated && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Last updated at {formattedLastUpdated}</span>
        </div>
      )}

      {
        <>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-48 flex-shrink-0">
              <div className="sticky top-24">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                  Providers
                </h3>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setSelectedProvider(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!selectedProvider
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    >
                      All Providers
                      <span className="ml-2 text-xs opacity-60">
                        ({models.length})
                      </span>
                    </button>
                    {providers.map((provider) => {
                      const count = models.filter(
                        (m) => m.provider === provider,
                      ).length;
                      return (
                        <button
                          type="button"
                          key={provider}
                          onClick={() => setSelectedProvider(provider)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedProvider === provider
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                        >
                          {provider}
                          <span className="ml-2 text-xs opacity-60">
                            ({count})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="flex-1">
              <ScrollArea className="h-[700px] pr-4">
                <div className="space-y-8">
                  {Object.entries(groupedModels)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(
                      ([provider, providerModels]) => (
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
                            {providerModels.map((model) => {
                              const TierIcon = tierIcons[model.tier];
                              return (
                                <Card
                                  key={model.id}
                                  className="p-5 bg-background border-border hover:border-accent/50 transition-all group hover:shadow-lg rounded-none"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <h4 className="font-semibold text-base group-hover:text-accent transition-colors">
                                      {model.name}
                                    </h4>
                                    <TierIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  </div>

                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        Context
                                      </span>
                                      <span className="font-mono font-medium">
                                        {formatContextK(model.contextWindow)}
                                      </span>
                                    </div>

                                    {model.pricing &&
                                      (model.pricing.prompt > 0 ||
                                        model.pricing.completion > 0) && (
                                        <div className="space-y-1.5 text-xs">
                                          <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                              Input
                                            </span>
                                            <span className="font-mono">
                                              ${model.pricing.prompt.toFixed(2)}
                                              /1M
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                              Output
                                            </span>
                                            <span className="font-mono">
                                              $
                                              {model.pricing.completion.toFixed(
                                                2,
                                              )}
                                              /1M
                                            </span>
                                          </div>
                                        </div>
                                      )}

                                    <div
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${tierColors[model.tier]}`}
                                    >
                                      {model.tier === "free" && "Free"}
                                      {model.tier === "low" && "Low Cost"}
                                      {model.tier === "mid" && "Mid Tier"}
                                      {model.tier === "high" && "Premium"}
                                    </div>

                                    {model.features.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5">
                                        {model.features
                                          .slice(0, 3)
                                          .map((feature) => (
                                            <Badge
                                              key={feature}
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              {feature}
                                            </Badge>
                                          ))}
                                      </div>
                                    )}
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      ),
                    )}
                </div>

                {filteredModels.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No models found matching your search.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </>
      }
    </div>
  );
}
