"use client";

import { Clock } from "lucide-react";
import { formatLastUpdated } from "./utils";

export function LastUpdated({ lastUpdated }: { lastUpdated?: number }) {
  if (!lastUpdated) return null;
  const formatted = formatLastUpdated(lastUpdated);
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      <span>Last updated at {formatted}</span>
    </div>
  );
}
