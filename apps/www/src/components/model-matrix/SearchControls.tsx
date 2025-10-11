"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SourceValue = "openrouter" | "modelsdev";

export function SearchControls({
  search,
  onSearchChange,
  source,
  onSourceChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  source: SourceValue;
  onSourceChange: (value: SourceValue) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 sm:order-1">
        <label
          htmlFor="source-select"
          className="text-xs sm:text-sm font-medium whitespace-nowrap"
        >
          Catalog:
        </label>
        <Select
          value={source}
          onValueChange={(v: string) => onSourceChange(v as SourceValue)}
        >
          <SelectTrigger id="source-select" className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openrouter">OpenRouter</SelectItem>
            <SelectItem value="modelsdev">Models.dev</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="relative flex-1 sm:order-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search models, providers, or features..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-background rounded-none"
        />
      </div>
    </div>
  );
}
