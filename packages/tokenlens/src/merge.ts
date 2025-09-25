import type { SourceProviders } from "@tokenlens/core/dto";

export function mergeProviders(
  providerSets: ReadonlyArray<SourceProviders>,
): SourceProviders {
  const out: SourceProviders = {};
  for (const providers of providerSets) {
    for (const [provId, prov] of Object.entries(providers || {})) {
      const existing = out[provId];
      if (!existing) {
        out[provId] = { ...prov, models: { ...(prov.models || {}) } };
        continue;
      }
      const target = existing;
      target.name ??= prov.name;
      target.api ??= prov.api;
      target.doc ??= prov.doc;
      target.env ??= prov.env;
      target.source ??= prov.source;
      target.schemaVersion ??= prov.schemaVersion;
      target.models ||= {};
      for (const [mid, m] of Object.entries(prov.models || {})) {
        if (!target.models[mid]) {
          target.models[mid] = m;
          continue;
        }
        const t = target.models[mid]!;
        t.name ??= m.name;
        const desc = (m as Record<string, unknown>)["description"];
        if (desc !== undefined) {
          (t as Record<string, unknown>)["description"] ??= desc;
        }
        t.modalities ??= m.modalities;
        t.limit ??= m.limit;
        t.cost ??= m.cost;
        t.extras = { ...(m.extras || {}), ...(t.extras || {}) };
      }
    }
  }
  return out;
}
