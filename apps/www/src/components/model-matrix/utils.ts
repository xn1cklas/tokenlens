import type { Model, SourceProvidersLite } from "./types";

export const tierColors: Record<Model["tier"], string> = {
  free: "bg-green-500/10 text-green-500 border-green-500/20",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  mid: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

export const tierIconsMap = {
  free: "DollarSign",
  low: "Zap",
  mid: "Sparkles",
  high: "Crown",
} as const;

function calculateTier(promptCost: number): Model["tier"] {
  if (promptCost === 0) return "free";
  if (promptCost < 0.5) return "low";
  if (promptCost < 3) return "mid";
  return "high";
}

export function buildModelsFromCatalog(catalog?: SourceProvidersLite): Model[] {
  const models: Model[] = [];
  for (const [providerId, provider] of Object.entries(catalog ?? {})) {
    const modelEntries = provider?.models ?? {};
    for (const [canonicalId, m] of Object.entries(modelEntries)) {
      const id = String(canonicalId ?? m.id ?? "");
      const name = m.name ?? id;
      const context = m.limit?.context ?? 0;
      const prompt =
        typeof m.cost?.input === "number" && Number.isFinite(m.cost.input)
          ? m.cost.input
          : 0;
      const completion =
        typeof m.cost?.output === "number" && Number.isFinite(m.cost.output)
          ? m.cost.output
          : 0;
      models.push({
        id,
        name,
        provider: providerId,
        contextWindow: context ? `${context}` : "-",
        tier: calculateTier(prompt),
        features: [],
        pricing: { prompt, completion, currency: "USD" },
      });
    }
  }
  return models;
}

export function getProviders(models: Model[]): string[] {
  return Array.from(new Set(models.map((m) => m.provider))).sort();
}

export function countModelsByProvider(models: Model[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const model of models) {
    counts[model.provider] = (counts[model.provider] ?? 0) + 1;
  }
  return counts;
}

export function filterModels(
  models: Model[],
  search: string,
  selectedProvider: string | null,
): Model[] {
  const query = search.toLowerCase();
  return models.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(query) ||
      model.provider.toLowerCase().includes(query) ||
      model.features.some((f) => f.toLowerCase().includes(query));
    const matchesProvider =
      !selectedProvider || model.provider === selectedProvider;
    return matchesSearch && matchesProvider;
  });
}

export function groupModelsByProvider(
  models: Model[],
): Record<string, Model[]> {
  const groups: Record<string, Model[]> = {};
  for (const model of models) {
    if (!groups[model.provider]) {
      groups[model.provider] = [];
    }
    groups[model.provider].push(model);
  }
  return groups;
}

export function formatContextK(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  if (n >= 1000) {
    return `${Math.round(n / 1000)}k`;
  }
  return `${n}`;
}

export function formatLastUpdated(lastUpdated?: number): string {
  if (!lastUpdated) return "";
  const date = new Date(lastUpdated);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
