import type { SourceProviders, SourceModel } from "@tokenlens/core";

export type ResolveModelResult = {
  providerId: string;
  modelId: string; // canonical provider/model
  model: SourceModel | undefined;
};

function normalizeProviderId(providerId?: string): string | undefined {
  if (!providerId) return providerId;
  const lower = providerId.toLowerCase();
  if (lower.startsWith("openai")) return "openai";
  if (lower.startsWith("anthropic")) return "anthropic";
  if (lower.startsWith("xai")) return "xai";
  if (lower.includes("/")) return lower.split("/")[0];
  if (lower.includes(".")) return lower.split(".")[0];
  return lower;
}

export function resolveModel(args: {
  providers: SourceProviders;
  providerId?: string;
  modelId: string; // may be provider/model or bare model id
}): ResolveModelResult {
  const { providers, providerId, modelId } = args;
  const hasSlash = modelId.includes("/");
  const normalizedProvider = normalizeProviderId(providerId);
  const provider =
    normalizedProvider || (hasSlash ? modelId.split("/")[0] : undefined);
  const id = hasSlash ? modelId : provider ? `${provider}/${modelId}` : modelId;

  if (provider) {
    const p = providers[provider];
    const model = p?.models?.[id];
    return { providerId: provider, modelId: id, model };
  }

  for (const [prov, entry] of Object.entries(providers)) {
    const m1 = entry.models?.[id];
    if (m1) return { providerId: prov, modelId: id, model: m1 };
    const key2 = `${prov}/${modelId}`;
    const m2 = entry.models?.[key2];
    if (m2) return { providerId: prov, modelId: key2, model: m2 };
  }
  const firstProv = Object.keys(providers)[0];
  return {
    providerId: firstProv ?? "",
    modelId: hasSlash
      ? modelId
      : firstProv
        ? `${firstProv}/${modelId}`
        : modelId,
    model: undefined,
  };
}
