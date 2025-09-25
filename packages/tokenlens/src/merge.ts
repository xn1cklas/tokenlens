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
      if (prov.name !== undefined && target.name === undefined)
        target.name = prov.name;
      if (prov.api !== undefined && target.api === undefined)
        target.api = prov.api;
      if (prov.doc !== undefined && target.doc === undefined)
        target.doc = prov.doc;
      if (prov.env !== undefined && target.env === undefined)
        target.env = prov.env;
      if (prov.source !== undefined && target.source === undefined)
        target.source = prov.source;
      if (
        prov.schemaVersion !== undefined &&
        target.schemaVersion === undefined
      )
        target.schemaVersion = prov.schemaVersion;
      target.models ||= {};
      for (const [mid, m] of Object.entries(prov.models || {})) {
        if (!target.models[mid]) {
          target.models[mid] = m;
          continue;
        }
        const t = target.models[mid]!;
        if (m.name !== undefined && t.name === undefined) t.name = m.name;
        const desc = (m as Record<string, unknown>)["description"];
        if (
          desc !== undefined &&
          (t as Record<string, unknown>)["description"] === undefined
        ) {
          (t as Record<string, unknown>)["description"] = desc;
        }
        if (m.modalities !== undefined && t.modalities === undefined)
          t.modalities = m.modalities;
        if (m.limit !== undefined && t.limit === undefined) t.limit = m.limit;
        if (m.cost !== undefined && t.cost === undefined) t.cost = m.cost;
        t.extras = { ...(m.extras || {}), ...(t.extras || {}) };
      }
    }
  }
  return out;
}
