import type { Model, Provider, Status } from "./types.js";

export type Registry = ReturnType<typeof createRegistry>;

export function createRegistry(all: readonly Model[]) {
  const MODEL_IDS = all.map((m) => m.id) as readonly string[];
  const models = Object.freeze(
    Object.fromEntries(all.map((m) => [m.id, m])) as Record<string, Model>,
  );
  const aliasEntries: Array<[string, string]> = [];
  for (const m of all) {
    const providerPrefix = `${m.provider}:`;
    if (m.vendorId) aliasEntries.push([m.vendorId.toLowerCase(), m.id]);
    if (m.family) aliasEntries.push([m.family.toLowerCase(), m.id]);
    if (m.id.startsWith(providerPrefix))
      aliasEntries.push([
        m.id.slice(providerPrefix.length).toLowerCase(),
        m.id,
      ]);
    for (const a of m.aliases ?? []) aliasEntries.push([a.toLowerCase(), m.id]);
  }
  const aliasMap = new Map<string, string>();
  for (const [k, v] of aliasEntries) if (!aliasMap.has(k)) aliasMap.set(k, v);
  const aliases = Object.freeze(Object.fromEntries(aliasMap));

  function getModelRaw(id: string): Model | undefined {
    return (models as Record<string, Model>)[id];
  }
  function resolveModel(idOrAlias: string): Model | undefined {
    const key = idOrAlias.trim().toLowerCase();
    const canonical = (models as Record<string, Model>)[key]
      ? key
      : aliases[key];
    return canonical ? (models as Record<string, Model>)[canonical] : undefined;
  }
  function isModelId(value: string): boolean {
    return (MODEL_IDS as readonly string[]).includes(value);
  }
  function assertModelId(value: string): asserts value is string {
    if (!isModelId(value)) {
      throw new Error(`Unknown model id: ${value}`);
    }
  }
  function listModels(filter?: {
    provider?: Provider;
    status?: Status;
  }): Model[] {
    const arr = Object.values(models);
    return arr.filter((m) => {
      if (filter?.provider && m.provider !== filter.provider) return false;
      if (filter?.status && m.status !== filter.status) return false;
      return true;
    });
  }

  return {
    MODEL_IDS,
    models: models as Readonly<Record<string, Model>>,
    aliases: aliases as Readonly<Record<string, string>>,
    getModelRaw,
    resolveModel,
    isModelId,
    assertModelId,
    listModels,
  } as const;
}
