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
import { CATALOG_SOURCE_OPTIONS } from "@/lib/catalog-sources";
import type { CatalogSource } from "./types";

export function SearchControls({
  search,
  onSearchChange,
  source,
  onSourceChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  source: CatalogSource;
  onSourceChange: (value: CatalogSource) => void;
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
          onValueChange={(v: string) => onSourceChange(v as CatalogSource)}
        >
          <SelectTrigger id="source-select" className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATALOG_SOURCE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
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
