import { TokenlensError } from "./error.js";

// Unified DTO shared across live fetchers and user-authored catalogs.

export type SourceId = "models.dev" | "openrouter" | "vercel" | "package";

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
  // Source-specific model metadata that is not safe to use in generic helpers.
  extras?: Record<string, unknown>;
};

export type SourceProvider = {
  id: string; // provider id (e.g., 'openai')
  aliases?: readonly string[];
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function invalidCatalog(target: string, meta: Record<string, unknown>): never {
  throw new TokenlensError.InvalidCatalog(target, { meta });
}

function assertStringField(args: {
  target: string;
  value: Record<string, unknown>;
  field: string;
  providerId?: string;
  modelId?: string;
}) {
  if (typeof args.value[args.field] !== "string" || !args.value[args.field]) {
    invalidCatalog(args.target, {
      reason: "INVALID_FIELD",
      field: args.field,
      ...(args.providerId ? { providerId: args.providerId } : {}),
      ...(args.modelId ? { modelId: args.modelId } : {}),
    });
  }
}

function assertOptionalNumberMap(args: {
  target: string;
  value: Record<string, unknown>;
  field: "cost" | "limit";
  providerId: string;
  modelId: string;
}) {
  const nested = args.value[args.field];
  if (nested === undefined) return;
  if (!isRecord(nested)) {
    invalidCatalog(args.target, {
      reason: "INVALID_FIELD",
      field: args.field,
      providerId: args.providerId,
      modelId: args.modelId,
    });
  }

  for (const [key, value] of Object.entries(nested)) {
    if (
      value !== undefined &&
      (typeof value !== "number" || !Number.isFinite(value) || value < 0)
    ) {
      invalidCatalog(args.target, {
        reason: "INVALID_FIELD",
        field: `${args.field}.${key}`,
        providerId: args.providerId,
        modelId: args.modelId,
      });
    }
  }
}

export function assertSourceProviders(
  value: unknown,
  target = "catalog",
): asserts value is SourceProviders {
  if (!isRecord(value)) {
    invalidCatalog(target, { reason: "INVALID_ROOT" });
  }

  for (const [providerKey, provider] of Object.entries(value)) {
    if (!isRecord(provider)) {
      invalidCatalog(target, {
        reason: "INVALID_PROVIDER",
        providerId: providerKey,
      });
    }
    assertStringField({
      target,
      value: provider,
      field: "id",
      providerId: providerKey,
    });

    const models = provider["models"];
    if (!isRecord(models)) {
      invalidCatalog(target, {
        reason: "INVALID_FIELD",
        field: "models",
        providerId: providerKey,
      });
    }

    for (const [modelKey, model] of Object.entries(models)) {
      if (!isRecord(model)) {
        invalidCatalog(target, {
          reason: "INVALID_MODEL",
          providerId: providerKey,
          modelId: modelKey,
        });
      }
      assertStringField({
        target,
        value: model,
        field: "id",
        providerId: providerKey,
        modelId: modelKey,
      });
      assertStringField({
        target,
        value: model,
        field: "canonical_id",
        providerId: providerKey,
        modelId: modelKey,
      });
      assertStringField({
        target,
        value: model,
        field: "name",
        providerId: providerKey,
        modelId: modelKey,
      });
      assertOptionalNumberMap({
        target,
        value: model,
        field: "cost",
        providerId: providerKey,
        modelId: modelKey,
      });
      assertOptionalNumberMap({
        target,
        value: model,
        field: "limit",
        providerId: providerKey,
        modelId: modelKey,
      });
    }
  }
}
