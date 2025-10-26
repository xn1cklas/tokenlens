"use client";

import { Crown, DollarSign, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Model } from "./types";
import { formatContextK, tierColors } from "./utils";

const icons = {
  free: DollarSign,
  low: Zap,
  mid: Sparkles,
  high: Crown,
} as const;

export function ModelCard({ model }: { model: Model }) {
  const TierIcon = icons[model.tier];
  return (
    <Card className="p-4 lg:p-5 bg-card border-border hover:border-accent/50 transition-all group rounded-none">
      <div className="flex items-start justify-between mb-3 gap-2">
        <h4 className="font-semibold text-sm lg:text-base group-hover:text-accent transition-colors break-words flex-1">
          {model.name}
        </h4>
        <TierIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </div>

      <div className="space-y-2.5 lg:space-y-3">
        <div className="flex items-center justify-between text-xs lg:text-sm">
          <span className="text-muted-foreground">Context</span>
          <span className="font-mono font-medium">
            {formatContextK(model.contextWindow)}
          </span>
        </div>

        {model.pricing &&
          (model.pricing.prompt > 0 || model.pricing.completion > 0) && (
            <div className="space-y-1 lg:space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Input</span>
                <span className="font-mono">
                  ${model.pricing.prompt.toFixed(2)}/1M
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Output</span>
                <span className="font-mono">
                  ${model.pricing.completion.toFixed(2)}/1M
                </span>
              </div>
            </div>
          )}

        <div
          className={`inline-flex items-center gap-1.5 px-2 lg:px-2.5 py-1 rounded-full text-xs font-medium border ${tierColors[model.tier]}`}
        >
          {model.tier === "free" && "Free"}
          {model.tier === "low" && "Low Cost"}
          {model.tier === "mid" && "Mid Tier"}
          {model.tier === "high" && "Premium"}
        </div>

        {model.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {model.features.slice(0, 3).map((feature) => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
