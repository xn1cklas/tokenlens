import type { Model, ModelCatalog, ProviderModel } from "@tokenlens/core";

export type ModelSource = {
  resolve: (idOrAlias: string) => Model | undefined;
  list: (filter?: { provider?: string }) => Model[];
};

export function sourceFromModels(models: readonly Model[]): ModelSource {
  const byId = new Map<string, Model>();
  const byAlias = new Map<string, string>();
  for (const m of models) {
    byId.set(m.id.toLowerCase(), m);
  }
  for (const m of models) {
    const pref = `${m.provider}:`;
    if (m.id.startsWith(pref))
      byAlias.set(m.id.slice(pref.length).toLowerCase(), m.id);
    if (m.vendorId) byAlias.set(m.vendorId.toLowerCase(), m.id);
    if (m.family) byAlias.set(m.family.toLowerCase(), m.id);
    for (const a of m.aliases ?? []) byAlias.set(a.toLowerCase(), m.id);
  }
  const resolve = (idOrAlias: string) => {
    const key = idOrAlias.trim().toLowerCase();
    const canonical = byId.has(key) ? key : byAlias.get(key);
    return canonical ? byId.get(canonical) : undefined;
  };
  const list = (filter?: { provider?: string }) =>
    models.filter((m) =>
      filter?.provider ? m.provider === filter.provider : true,
    );
  return { resolve, list };
}

export function sourceFromCatalog(catalog: ModelCatalog): ModelSource {
  const mapEntry = (
    provKey: string,
    mid: string,
    m: ProviderModel,
    prov: ModelCatalog[string],
  ): Model => {
    const inputMods: string[] = Array.isArray(m?.modalities?.input)
      ? (m.modalities?.input as string[])
      : [];
    const outputMods: string[] = Array.isArray(m?.modalities?.output)
      ? (m.modalities?.output as string[])
      : [];
    const textIn = inputMods.includes("text");
    const imageIn = inputMods.includes("image");
    const textOut = outputMods.includes("text");
    const combinedMax =
      typeof m?.limit?.context === "number" ? m.limit.context : undefined;
    const inputMax =
      typeof m?.limit?.input === "number" ? m.limit.input : undefined;
    const outputMax =
      typeof m?.limit?.output === "number" ? m.limit.output : undefined;
    const pricing =
      m?.cost &&
        (typeof m.cost.input === "number" ||
          typeof m.cost.output === "number" ||
          typeof m.cost.reasoning === "number" ||
          typeof m.cost.cache_read === "number" ||
          typeof m.cost.cache_write === "number")
        ? {
          ...(typeof m.cost.input === "number"
            ? { inputPerMTokens: m.cost.input }
            : {}),
          ...(typeof m.cost.output === "number"
            ? { outputPerMTokens: m.cost.output }
            : {}),
          ...(typeof m.cost.reasoning === "number"
            ? { reasoningPerMTokens: m.cost.reasoning }
            : {}),
          ...(typeof m.cost.cache_read === "number"
            ? { cacheReadPerMTokens: m.cost.cache_read }
            : {}),
          ...(typeof m.cost.cache_write === "number"
            ? { cacheWritePerMTokens: m.cost.cache_write }
            : {}),
        }
        : undefined;
    return {
      id: `${provKey}:${mid}`,
      provider: provKey,
      vendorId: mid,
      displayName: m?.name || mid,
      family: mid,
      status: "stable",
      context: Object.fromEntries(
        Object.entries({ combinedMax, inputMax, outputMax }).filter(
          ([, v]) => typeof v === "number",
        ),
      ) as Model["context"],
      modalities:
        textIn || textOut || imageIn
          ? {
            ...(textIn && { textIn: true }),
            ...(textOut && { textOut: true }),
            ...(imageIn && { imageIn: true }),
          }
          : undefined,
      pricing,
      pricingSource: "models.dev",
      aliases: [`${provKey}/${mid}`],
      releasedAt: m?.release_date || undefined,
      source:
        (prov as { doc?: string } & Record<string, unknown>)?.doc ||
        ((prov as Record<string, unknown>)?.docs as string) ||
        "https://models.dev",
      contextSource:
        (prov as { doc?: string } & Record<string, unknown>)?.doc ||
        ((prov as Record<string, unknown>)?.docs as string) ||
        undefined,
      verifiedAt: m?.last_updated || undefined,
    } satisfies Model;
  };

  const all: Model[] = [];
  for (const [provKey, prov] of Object.entries(catalog)) {
    for (const mid of Object.keys(prov?.models ?? {})) {
      const m = prov.models[mid] as ProviderModel;
      all.push(mapEntry(provKey, mid, m, prov));
    }
  }
  return sourceFromModels(all);
}

export function selectStaticModels(
  providerArrays:
    | ReadonlyArray<ReadonlyArray<Model>>
    | ReadonlyArray<ReadonlyArray<Record<string, unknown>>>,
  pick?: Record<string, ReadonlyArray<string> | undefined>,
): Model[] {
  const flatten: Model[] = [] as Model[];
  for (const arr of providerArrays) {
    for (const m of arr as readonly unknown[]) {
      const mm = m as Model;
      if (!mm?.id || !mm?.provider) continue;
      const ids = pick?.[mm.provider];
      if (!ids || ids.length === 0) {
        flatten.push(mm);
      } else {
        const short = mm.id.includes(":") ? mm.id.split(":")[1] : mm.id;
        if (
          ids.includes(mm.id) ||
          ids.includes(short) ||
          (mm.vendorId && ids.includes(mm.vendorId))
        ) {
          flatten.push(mm);
        }
      }
    }
  }
  return flatten;
}
