import {
  assertSourceProviders,
  type SourceModel,
  type SourceProviders,
  TokenlensError,
} from "@tokenlens/core";
import type { CatalogModelOverride, CatalogOverrides } from "./types.js";

const SOURCE_IDS = new Set(["models.dev", "openrouter", "package", "vercel"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function invalidOverrides(meta: Record<string, unknown>): never {
  throw new TokenlensError.InvalidCatalog("overrides", { meta });
}

function invalidOverrideField(args: {
  field: string;
  providerId?: string;
  modelId?: string;
}): never {
  invalidOverrides({
    reason: "INVALID_FIELD",
    field: args.field,
    ...(args.providerId ? { providerId: args.providerId } : {}),
    ...(args.modelId ? { modelId: args.modelId } : {}),
  });
}

function assertOptionalStringField(args: {
  value: Record<string, unknown>;
  field: string;
  providerId?: string;
  modelId?: string;
}) {
  const fieldValue = args.value[args.field];
  if (
    fieldValue !== undefined &&
    (typeof fieldValue !== "string" || fieldValue.length === 0)
  ) {
    invalidOverrideField(args);
  }
}

function assertOptionalNumberField(args: {
  value: Record<string, unknown>;
  field: string;
  providerId: string;
  modelId?: string;
}) {
  const fieldValue = args.value[args.field];
  if (
    fieldValue !== undefined &&
    (typeof fieldValue !== "number" ||
      !Number.isFinite(fieldValue) ||
      fieldValue < 0)
  ) {
    invalidOverrideField(args);
  }
}

function assertOptionalSchemaVersionField(args: {
  value: Record<string, unknown>;
  providerId: string;
}) {
  const fieldValue = args.value["schemaVersion"];
  if (
    fieldValue !== undefined &&
    (typeof fieldValue !== "number" ||
      !Number.isInteger(fieldValue) ||
      fieldValue < 1)
  ) {
    invalidOverrideField({ ...args, field: "schemaVersion" });
  }
}

function assertOptionalSourceField(args: {
  value: Record<string, unknown>;
  providerId: string;
}) {
  const fieldValue = args.value["source"];
  if (
    fieldValue !== undefined &&
    (typeof fieldValue !== "string" || !SOURCE_IDS.has(fieldValue))
  ) {
    invalidOverrideField({ ...args, field: "source" });
  }
}

function assertOptionalStringArrayField(args: {
  value: Record<string, unknown>;
  field: string;
  providerId: string;
}) {
  const fieldValue = args.value[args.field];
  if (fieldValue === undefined) return;
  if (!Array.isArray(fieldValue)) {
    invalidOverrideField(args);
  }

  const invalidIndex = fieldValue.findIndex(
    (entry) => typeof entry !== "string" || entry.length === 0,
  );
  if (invalidIndex >= 0) {
    invalidOverrideField({ ...args, field: `${args.field}[${invalidIndex}]` });
  }
}

function assertOptionalRecordField(args: {
  value: Record<string, unknown>;
  field: string;
  providerId: string;
  modelId?: string;
}) {
  const fieldValue = args.value[args.field];
  if (fieldValue !== undefined && !isRecord(fieldValue)) {
    invalidOverrideField(args);
  }
}

function assertOptionalNumberMap(args: {
  value: Record<string, unknown>;
  field: "cost" | "limit";
  providerId: string;
  modelId: string;
}) {
  const nested = args.value[args.field];
  if (nested === undefined) return;
  if (!isRecord(nested)) {
    invalidOverrides({
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
      invalidOverrides({
        reason: "INVALID_FIELD",
        field: `${args.field}.${key}`,
        providerId: args.providerId,
        modelId: args.modelId,
      });
    }
  }
}

function assertCatalogOverrides(
  value: unknown,
): asserts value is CatalogOverrides {
  if (!isRecord(value)) {
    invalidOverrides({ reason: "INVALID_ROOT" });
  }

  for (const [providerKey, provider] of Object.entries(value)) {
    if (!isRecord(provider)) {
      invalidOverrides({
        reason: "INVALID_PROVIDER",
        providerId: providerKey,
      });
    }
    assertOptionalStringField({
      value: provider,
      field: "id",
      providerId: providerKey,
    });
    for (const field of ["name", "api", "doc", "npm"] as const) {
      assertOptionalStringField({
        value: provider,
        field,
        providerId: providerKey,
      });
    }
    assertOptionalStringArrayField({
      value: provider,
      field: "aliases",
      providerId: providerKey,
    });
    assertOptionalStringArrayField({
      value: provider,
      field: "env",
      providerId: providerKey,
    });
    assertOptionalSourceField({
      value: provider,
      providerId: providerKey,
    });
    assertOptionalSchemaVersionField({
      value: provider,
      providerId: providerKey,
    });
    assertOptionalRecordField({
      value: provider,
      field: "extras",
      providerId: providerKey,
    });

    const models = provider["models"];
    if (models === undefined) {
      continue;
    }
    if (!isRecord(models)) {
      invalidOverrides({
        reason: "INVALID_FIELD",
        field: "models",
        providerId: providerKey,
      });
    }

    for (const [modelKey, model] of Object.entries(models)) {
      if (!isRecord(model)) {
        invalidOverrides({
          reason: "INVALID_MODEL",
          providerId: providerKey,
          modelId: modelKey,
        });
      }
      assertOptionalStringField({
        value: model,
        field: "id",
        providerId: providerKey,
        modelId: modelKey,
      });
      assertOptionalStringField({
        value: model,
        field: "canonical_id",
        providerId: providerKey,
        modelId: modelKey,
      });
      assertOptionalStringField({
        value: model,
        field: "name",
        providerId: providerKey,
        modelId: modelKey,
      });
      assertOptionalNumberField({
        value: model,
        field: "created",
        providerId: providerKey,
        modelId: modelKey,
      });
      for (const field of ["release_date", "last_updated"] as const) {
        assertOptionalStringField({
          value: model,
          field,
          providerId: providerKey,
          modelId: modelKey,
        });
      }
      assertOptionalNumberMap({
        value: model,
        field: "cost",
        providerId: providerKey,
        modelId: modelKey,
      });
      assertOptionalNumberMap({
        value: model,
        field: "limit",
        providerId: providerKey,
        modelId: modelKey,
      });
      assertOptionalRecordField({
        value: model,
        field: "extras",
        providerId: providerKey,
        modelId: modelKey,
      });
    }
  }
}

function definedObject<T extends Record<string, unknown>>(
  value: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>;
}

function completeOverrideModel(
  modelId: string,
  modelOverride: CatalogModelOverride,
): SourceModel {
  const fields = definedObject(modelOverride);
  return {
    id: modelOverride.id ?? modelId,
    canonical_id: modelOverride.canonical_id ?? modelOverride.id ?? modelId,
    name:
      modelOverride.name ??
      modelOverride.canonical_id ??
      modelOverride.id ??
      modelId,
    ...fields,
  };
}

function mergeCatalogs(
  base: SourceProviders,
  overrides: CatalogOverrides,
): SourceProviders {
  const merged: SourceProviders = {};
  for (const [providerId, provider] of Object.entries(base)) {
    merged[providerId] = {
      ...provider,
      models: { ...provider.models },
      ...(provider.extras ? { extras: { ...provider.extras } } : {}),
    };
  }

  for (const [providerId, providerOverride] of Object.entries(overrides)) {
    const { models: overrideModels = {}, ...providerFields } = providerOverride;
    const existingProvider = merged[providerId];
    if (!existingProvider) {
      merged[providerId] = {
        id: providerOverride.id ?? providerId,
        ...definedObject(providerFields),
        models: Object.fromEntries(
          Object.entries(overrideModels).map(([modelId, modelOverride]) => [
            modelId,
            completeOverrideModel(modelId, modelOverride),
          ]),
        ),
        ...(providerOverride.extras
          ? { extras: { ...providerOverride.extras } }
          : {}),
      };
      continue;
    }

    const nextModels = { ...existingProvider.models };
    for (const [modelId, modelOverride] of Object.entries(overrideModels)) {
      const existingModel = nextModels[modelId];
      if (!existingModel) {
        nextModels[modelId] = completeOverrideModel(modelId, modelOverride);
        continue;
      }

      const mergedModel = { ...existingModel, ...definedObject(modelOverride) };
      if (existingModel.cost || modelOverride.cost) {
        mergedModel.cost = { ...existingModel.cost, ...modelOverride.cost };
      }
      if (existingModel.limit || modelOverride.limit) {
        mergedModel.limit = { ...existingModel.limit, ...modelOverride.limit };
      }
      nextModels[modelId] = mergedModel;
    }

    const mergedProvider = {
      ...existingProvider,
      ...definedObject(providerFields),
      models: nextModels,
    };
    const env = providerOverride.env ?? existingProvider.env;
    if (env) {
      mergedProvider.env = env;
    }
    if (existingProvider.extras || providerOverride.extras) {
      mergedProvider.extras = {
        ...existingProvider.extras,
        ...providerOverride.extras,
      };
    }
    merged[providerId] = mergedProvider;
  }

  return merged;
}

export function applyCatalogOverrides(
  catalog: SourceProviders,
  overrides: CatalogOverrides,
): SourceProviders {
  assertCatalogOverrides(overrides);
  const merged = mergeCatalogs(catalog, overrides);
  assertSourceProviders(merged, "merged catalog");
  return merged;
}
