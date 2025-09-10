#!/usr/bin/env node
// Generate Tokenlens model entries from models.dev API
// Usage: node scripts/sync-models-dev.mjs

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fetch all providers from models.dev (no filtering)

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          return resolve(fetchJson(res.headers.location));
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
        }
        const chunks = [];
        res.on("data", (d) => chunks.push(d));
        res.on("end", () => {
          try {
            const body = Buffer.concat(chunks).toString("utf8");
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

function bool(val) {
  return !!val;
}

function toTs(models) {
  const header = `import type { Model } from '../types.js';\n\n`;
  const items = models
    .map((m) => {
      const parts = [
        `  {`,
        `    id: ${JSON.stringify(m.id)},`,
        `    provider: ${JSON.stringify(m.provider)},`,
        m.vendorId ? `    vendorId: ${JSON.stringify(m.vendorId)},` : undefined,
        m.displayName
          ? `    displayName: ${JSON.stringify(m.displayName)},`
          : undefined,
        m.family ? `    family: ${JSON.stringify(m.family)},` : undefined,
        `    status: ${JSON.stringify(m.status)},`,
        `    context: ${JSON.stringify(m.context)},`,
        m.modalities
          ? `    modalities: ${JSON.stringify(m.modalities)},`
          : undefined,
        m.pricing ? `    pricing: ${JSON.stringify(m.pricing)},` : undefined,
        m.pricingSource
          ? `    pricingSource: ${JSON.stringify(m.pricingSource)},`
          : undefined,
        m.aliases && m.aliases.length
          ? `    aliases: ${JSON.stringify(m.aliases)},`
          : undefined,
        m.releasedAt
          ? `    releasedAt: ${JSON.stringify(m.releasedAt)},`
          : undefined,
        `    source: ${JSON.stringify(m.source)},`,
        m.contextSource
          ? `    contextSource: ${JSON.stringify(m.contextSource)},`
          : undefined,
        m.verifiedAt
          ? `    verifiedAt: ${JSON.stringify(m.verifiedAt)},`
          : undefined,
        `  }`,
      ].filter(Boolean);
      return parts.join("\n");
    })
    .join(",\n");
  const body = `export const modelsDev = [\n${items}\n] as const satisfies readonly Model[];\n`;
  return header + body;
}

function mapFromModelsDev(json) {
  const out = [];
  for (const [provider, p] of Object.entries(json)) {
    const providerDoc = p.doc || p.docs || "";
    const models = p.models || {};
    for (const [modelId, m] of Object.entries(models)) {
      const inputMods = Array.isArray(m.modalities?.input)
        ? m.modalities.input
        : [];
      const outputMods = Array.isArray(m.modalities?.output)
        ? m.modalities.output
        : [];
      const textIn = inputMods.includes("text");
      const imageIn = inputMods.includes("image");
      const textOut = outputMods.includes("text");

      const combinedMax = m.limit?.context;
      const outputMax = m.limit?.output;

      const mapped = {
        id: `${provider}:${modelId}`,
        provider,
        vendorId: modelId,
        displayName: m.name || modelId,
        family: modelId,
        status: "stable",
        context: Object.fromEntries(
          Object.entries({ combinedMax, outputMax }).filter(
            ([, v]) => typeof v === "number",
          ),
        ),
        modalities:
          textIn || textOut || imageIn
            ? {
                ...(textIn && { textIn: true }),
                ...(textOut && { textOut: true }),
                ...(imageIn && { imageIn: true }),
              }
            : undefined,
        pricing:
          m.cost &&
          (typeof m.cost.input === "number" ||
            typeof m.cost.output === "number")
            ? {
                ...(typeof m.cost.input === "number"
                  ? { inputPerMTokens: m.cost.input }
                  : {}),
                ...(typeof m.cost.output === "number"
                  ? { outputPerMTokens: m.cost.output }
                  : {}),
              }
            : undefined,
        pricingSource: "models.dev",
        aliases: [`${provider}/${modelId}`],
        releasedAt: m.release_date || undefined,
        source: providerDoc || "https://models.dev",
        contextSource: providerDoc || undefined,
        verifiedAt: m.last_updated || undefined,
      };
      out.push(mapped);
    }
  }
  // stable sort by provider then id for deterministic output
  out.sort((a, b) =>
    a.provider === b.provider
      ? a.id.localeCompare(b.id)
      : a.provider.localeCompare(b.provider),
  );
  return out;
}

async function main() {
  const url = "https://models.dev/api.json";
  const json = await fetchJson(url);
  const mapped = mapFromModelsDev(json);
  const ts = toTs(mapped);
  const target = path.join(__dirname, "..", "src", "models", "models_dev.ts");
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, ts + "\n");
  console.log(
    `Wrote ${mapped.length} models to ${path.relative(path.join(__dirname, ".."), target)}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
