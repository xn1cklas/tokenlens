import type { Model } from "./types";

export const tierColors: Record<Model["tier"], string> = {
  unknown: "bg-muted text-muted-foreground border-border",
  free: "bg-green-500/10 text-green-500 border-green-500/20",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  mid: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

export const tierIconsMap = {
  unknown: "Sparkles",
  free: "DollarSign",
  low: "Zap",
  mid: "Sparkles",
  high: "Sparkles",
} as const;

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
