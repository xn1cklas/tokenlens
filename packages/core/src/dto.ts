// Unified DTO shared across live fetchers and static generators

export type SourceId = "models.dev" | "openrouter" | "package";

export type SourceModel = {
  id: string;
  canonical_id: string;
  name: string;
  // Timeline
  created?: number;
  release_date?: string;
  last_updated?: string;
  cost?: {
    input?: number; // USD per 1M prompt tokens
    output?: number; // USD per 1M completion tokens
    reasoning?: number; // USD per 1M reasoning tokens
    cache_read?: number; // USD per 1M cache read tokens
    cache_write?: number; // USD per 1M cache write tokens
  };
  limit?: {
    context?: number;
    input?: number;
    output?: number;
  };
};

export type SourceProvider = {
  id: string; // provider id (e.g., 'openai')
  name?: string;
  api?: string;
  doc?: string;
  npm?: string;
  env?: readonly string[];
  source?: SourceId;
  schemaVersion?: number;
  models: Record<string, SourceModel>; // key is canonical model id (e.g., 'openai/gpt-4o')
  // Source-specific additional fields to avoid losing information
  extras?: Record<string, unknown>;
};

export type SourceProviders = Record<string, SourceProvider>;
