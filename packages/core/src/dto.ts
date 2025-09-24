// Unified DTO shared across live fetchers and static generators

export type SourceId = "models.dev" | "openrouter";

export type Model = {
  id: string;
  name: string;
  description?: string;
  // Capabilities and flags
  attachment?: boolean;
  reasoning?: boolean;
  temperature?: boolean;
  tool_call?: boolean;
  knowledge?: string;
  // Timeline
  created?: number;
  release_date?: string;
  last_updated?: string;
  // Modalities and limits (combined + optional splits)
  modalities?: { input?: readonly string[]; output?: readonly string[] };
  open_weights?: boolean;
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
  // Source-specific additional fields to avoid losing information
  extras?: Record<string, unknown>;
};

export type Provider = {
  id: string; // provider id (e.g., 'openai')
  name?: string;
  api?: string;
  doc?: string;
  npm?: string;
  env?: readonly string[];
  source?: SourceId;
  schemaVersion?: number;
  models: Record<string, Model>; // key is canonical model id (e.g., 'openai/gpt-4o')
  // Source-specific additional fields to avoid losing information
  extras?: Record<string, unknown>;
};

export type Providers = Record<string, Provider>;
