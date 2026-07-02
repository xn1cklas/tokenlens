import type {
  SourceModel,
  SourceProvider,
  SourceProviders,
} from "@tokenlens/core";
import { toModelId } from "@tokenlens/core";

export type ResolveModelResult = {
  providerId: string;
  modelId: string; // canonical provider/model
  model: SourceModel | undefined;
  candidates?: readonly string[];
};

export type ModelResolver = {
  resolveModel(args: {
    providerId?: string;
    modelId: string;
  }): ResolveModelResult;
};

type ScopedModelId = {
  rawProvider: string;
  bareModelId: string;
};

type ModelLookupEntry = {
  candidateId: string;
  bareModelId: string;
  model: SourceModel;
};

type ProviderLookupEntry = {
  catalogKey: string;
  provider: SourceProvider;
  providerKeys: readonly string[];
  modelLookup: Map<string, ModelLookupEntry>;
};

function normalizeProviderLookup(providerId?: string): string | undefined {
  const normalized = providerId?.trim().toLowerCase();
  return normalized ? normalized : undefined;
}

function normalizeModelLookup(modelId?: string): string | undefined {
  const normalized = modelId?.trim();
  return normalized ? normalized : undefined;
}

function uniqueStrings(values: Iterable<string | undefined>): string[] {
  const out: string[] = [];
  for (const value of values) {
    const normalized = normalizeModelLookup(value);
    if (normalized && !out.includes(normalized)) {
      out.push(normalized);
    }
  }
  return out;
}

function splitScopedModelId(
  modelId: string,
  options?: { allowLegacyColon?: boolean },
): ScopedModelId | undefined {
  const slashIndex = modelId.indexOf("/");
  const colonIndex =
    options?.allowLegacyColon === false ? -1 : modelId.indexOf(":");
  const separatorIndex =
    slashIndex > 0 ? slashIndex : colonIndex > 0 ? colonIndex : -1;
  if (separatorIndex <= 0) return undefined;
  return {
    rawProvider: modelId.slice(0, separatorIndex),
    bareModelId: modelId.slice(separatorIndex + 1),
  };
}

function providerKeys(catalogKey: string, provider: SourceProvider): string[] {
  return uniqueStrings([catalogKey, provider.id, ...(provider.aliases ?? [])]);
}

function addModelLookup(
  lookup: Map<string, ModelLookupEntry>,
  key: string | undefined,
  entry: ModelLookupEntry,
) {
  const normalized = normalizeModelLookup(key);
  if (normalized && !lookup.has(normalized)) {
    lookup.set(normalized, entry);
  }
}

function addScopedModelLookupKeys(args: {
  lookup: Map<string, ModelLookupEntry>;
  providerKeys: readonly string[];
  bareModelId: string;
  entry: ModelLookupEntry;
}) {
  for (const providerKey of args.providerKeys) {
    const scoped = `${providerKey}/${args.bareModelId}`;
    addModelLookup(args.lookup, scoped, args.entry);
    addModelLookup(args.lookup, toModelId(scoped), args.entry);
    addModelLookup(
      args.lookup,
      `${providerKey}:${args.bareModelId}`,
      args.entry,
    );
  }
}

function addCatalogModel(args: {
  lookup: Map<string, ModelLookupEntry>;
  providerKeys: readonly string[];
  candidateId: string;
  model: SourceModel;
}) {
  const sourceKeys = uniqueStrings([
    args.candidateId,
    args.model.id,
    args.model.canonical_id,
  ]);
  const bareModelIds = new Set<string>();

  for (const sourceKey of sourceKeys) {
    const entry: ModelLookupEntry = {
      candidateId: sourceKey,
      bareModelId:
        splitScopedModelId(sourceKey, { allowLegacyColon: true })
          ?.bareModelId ?? sourceKey,
      model: args.model,
    };
    addModelLookup(args.lookup, sourceKey, entry);
    addModelLookup(args.lookup, toModelId(sourceKey), entry);

    const split = splitScopedModelId(sourceKey, { allowLegacyColon: true });
    const bareModelId = split?.bareModelId ?? sourceKey;
    bareModelIds.add(bareModelId);
    addModelLookup(args.lookup, bareModelId, {
      ...entry,
      bareModelId,
    });
  }

  for (const bareModelId of bareModelIds) {
    addScopedModelLookupKeys({
      lookup: args.lookup,
      providerKeys: args.providerKeys,
      bareModelId,
      entry: {
        candidateId: args.candidateId,
        bareModelId,
        model: args.model,
      },
    });
  }
}

function buildProviderLookup(catalog: SourceProviders): ProviderLookupEntry[] {
  return Object.entries(catalog).map(([catalogKey, provider]) => {
    const keys = providerKeys(catalogKey, provider);
    const modelLookup = new Map<string, ModelLookupEntry>();

    for (const [candidateId, model] of Object.entries(provider.models)) {
      addCatalogModel({
        lookup: modelLookup,
        providerKeys: keys,
        candidateId,
        model,
      });
    }

    return {
      catalogKey,
      provider,
      providerKeys: keys,
      modelLookup,
    };
  });
}

function providerCandidates(
  providers: readonly ProviderLookupEntry[],
  rawProvider?: string,
): ProviderLookupEntry[] {
  const lookup = normalizeProviderLookup(rawProvider);
  if (!lookup) return [];
  return providers.filter((entry) =>
    entry.providerKeys
      .map(normalizeProviderLookup)
      .filter((key): key is string => key !== undefined)
      .includes(lookup),
  );
}

function requestModelKeys(args: {
  providerKeys: readonly string[];
  modelId: string;
  canonicalModelId: string;
  bareModelId: string;
  originalBareModelId: string;
}): string[] {
  const keys = uniqueStrings([
    args.modelId,
    args.canonicalModelId,
    args.bareModelId,
    args.originalBareModelId,
  ]);

  for (const bareModelId of uniqueStrings([
    args.bareModelId,
    args.originalBareModelId,
  ])) {
    for (const providerKey of args.providerKeys) {
      const scoped = `${providerKey}/${bareModelId}`;
      keys.push(scoped);
      const normalizedScoped = toModelId(scoped);
      if (normalizedScoped) keys.push(normalizedScoped);
      keys.push(`${providerKey}:${bareModelId}`);
    }
  }

  return uniqueStrings(keys);
}

function resolvedModelId(args: {
  providerId: string;
  candidateId: string;
  bareModelId: string;
  model: SourceModel;
}): string {
  const { providerId, candidateId, bareModelId, model } = args;
  if (model.canonical_id) return model.canonical_id;
  if (model.id) return model.id;
  return candidateId.includes("/")
    ? candidateId
    : `${providerId}/${bareModelId}`;
}

function resolveFromProvider(
  provider: ProviderLookupEntry,
  modelKeys: readonly string[],
): ResolveModelResult | undefined {
  for (const modelKey of modelKeys) {
    const entry = provider.modelLookup.get(modelKey);
    if (!entry) continue;
    return {
      providerId: provider.catalogKey,
      modelId: resolvedModelId({
        providerId: provider.catalogKey,
        candidateId: entry.candidateId,
        bareModelId: entry.bareModelId,
        model: entry.model,
      }),
      model: entry.model,
    };
  }
  return undefined;
}

function resolveExactAcrossProviders(
  providers: readonly ProviderLookupEntry[],
  modelKeys: readonly string[],
): ResolveModelResult | undefined {
  for (const provider of providers) {
    const resolved = resolveFromProvider(provider, modelKeys);
    if (resolved) return resolved;
  }
  return undefined;
}

function resolveAllAcrossProviders(
  providers: readonly ProviderLookupEntry[],
  args: Omit<Parameters<typeof requestModelKeys>[0], "providerKeys">,
): ResolveModelResult[] {
  const results: ResolveModelResult[] = [];
  const seen = new Set<string>();
  for (const provider of providers) {
    const resolved = resolveFromProvider(
      provider,
      requestModelKeys({ ...args, providerKeys: provider.providerKeys }),
    );
    if (!resolved) continue;
    const key = `${resolved.providerId}/${resolved.modelId}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push(resolved);
    }
  }
  return results;
}

function resolveWithProviderLookup(
  providers: readonly ProviderLookupEntry[],
  args: {
    providerId?: string;
    modelId: string; // may be provider/model or bare model id
  },
): ResolveModelResult {
  const { providerId, modelId } = args;
  const explicitProvider = normalizeProviderLookup(providerId);
  const modelIdHasSlash = modelId.includes("/");
  const split = splitScopedModelId(modelId, {
    allowLegacyColon: explicitProvider === undefined,
  });
  const canonicalModelId =
    modelIdHasSlash || !explicitProvider
      ? (toModelId(modelId) ?? modelId)
      : modelId;
  const canonicalSplit = splitScopedModelId(canonicalModelId, {
    allowLegacyColon: explicitProvider === undefined,
  });
  const bareModelId =
    (explicitProvider ? split?.bareModelId : canonicalSplit?.bareModelId) ??
    canonicalModelId;
  const originalBareModelId = split?.bareModelId ?? modelId;
  const rawProvider =
    explicitProvider !== undefined ? providerId : canonicalSplit?.rawProvider;
  const request = {
    modelId,
    canonicalModelId,
    bareModelId,
    originalBareModelId,
  };
  const exactScopedModelKeys = uniqueStrings([
    modelId,
    canonicalModelId,
    toModelId(modelId),
    toModelId(canonicalModelId),
  ]);

  if (rawProvider) {
    const candidates = providerCandidates(providers, rawProvider);
    for (const candidate of candidates) {
      const resolved = resolveFromProvider(
        candidate,
        requestModelKeys({ ...request, providerKeys: candidate.providerKeys }),
      );
      if (resolved) return resolved;
    }

    if (!providerId && (candidates.length > 0 || !rawProvider.includes("."))) {
      const resolved = resolveExactAcrossProviders(
        providers,
        exactScopedModelKeys,
      );
      if (resolved) return resolved;
    }

    const provider =
      candidates[0]?.catalogKey ?? normalizeProviderLookup(rawProvider) ?? "";
    return {
      providerId: provider,
      modelId: provider ? `${provider}/${bareModelId}` : modelId,
      model: undefined,
    };
  }

  const matches = resolveAllAcrossProviders(providers, request);
  if (matches.length === 1) return matches[0] as ResolveModelResult;
  if (matches.length > 1) {
    return {
      providerId: "",
      modelId,
      model: undefined,
      candidates: matches.map((match) => match.modelId),
    };
  }

  const firstProvider = providers[0]?.catalogKey;
  return {
    providerId: firstProvider ?? "",
    modelId: firstProvider ? `${firstProvider}/${bareModelId}` : bareModelId,
    model: undefined,
  };
}

export function createModelResolver(catalog: SourceProviders): ModelResolver {
  const providers = buildProviderLookup(catalog);
  return {
    resolveModel(args) {
      return resolveWithProviderLookup(providers, args);
    },
  };
}

export function resolveModel(args: {
  catalog: SourceProviders;
  providerId?: string;
  modelId: string; // may be provider/model or bare model id
}): ResolveModelResult {
  return createModelResolver(args.catalog).resolveModel(args);
}
