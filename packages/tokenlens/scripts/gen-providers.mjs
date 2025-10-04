import { mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve provider directories from @tokenlens/models (prefer dist, fallback to src)
const repoRoot = resolve(__dirname, "../../..");
const modelsDevProvidersDir = resolve(
  repoRoot,
  "packages/models/dist/modelsdev/providers",
);
const modelsDevProvidersSrcDir = resolve(
  repoRoot,
  "packages/models/src/modelsdev/providers",
);
const openrouterProvidersDir = resolve(
  repoRoot,
  "packages/models/dist/openrouter/providers",
);
const openrouterProvidersSrcDir = resolve(
  repoRoot,
  "packages/models/src/openrouter/providers",
);

function ensureDir(dir) {
  try {
    mkdirSync(dir, { recursive: true });
  } catch {}
}

function emitForBaseDir(baseDir, subpath) {
  const outDir = resolve(__dirname, `../src/exports/providers/${subpath}`);
  ensureDir(outDir);
  const files = readdirSync(baseDir).filter((f) =>
    /\.(js|ts|mts|cts)$/.test(f),
  );
  const names = Array.from(
    new Set(
      files
        .map((f) => f.replace(/\.(d\.ts|ts|mts|cts|js|mjs|cjs)$/i, ""))
        .filter((n) => !n.startsWith("index")),
    ),
  );
  for (const name of names) {
    const outPath = join(outDir, `${name}.ts`);
    const contents = `export * from "@tokenlens/models/${subpath}/${name}";\n`;
    writeFileSync(outPath, contents, "utf8");
  }
  const indexPath = join(outDir, `index.ts`);
  const index = `${names
    .map(
      (n) =>
        `export * as ${n.replace(/[^a-zA-Z0-9_]/g, "_")} from "./${n}.js";`,
    )
    .join("\n")}\n`;
  writeFileSync(indexPath, index, "utf8");
}

function resolveExistingDir(primary, fallback) {
  try {
    if (statSync(primary).isDirectory()) return primary;
  } catch {}
  try {
    if (statSync(fallback).isDirectory()) return fallback;
  } catch {}
  return null;
}

function main() {
  const modelsDevBase = resolveExistingDir(
    modelsDevProvidersDir,
    modelsDevProvidersSrcDir,
  );
  const openrouterBase = resolveExistingDir(
    openrouterProvidersDir,
    openrouterProvidersSrcDir,
  );

  if (!modelsDevBase && !openrouterBase) {
    console.error(
      `Providers dir not found in dist or src:\n - ${modelsDevProvidersDir}\n - ${modelsDevProvidersSrcDir}\n - ${openrouterProvidersDir}\n - ${openrouterProvidersSrcDir}`,
    );
    process.exit(0);
  }

  if (modelsDevBase) emitForBaseDir(modelsDevBase, "modelsdev/providers");
  if (openrouterBase) emitForBaseDir(openrouterBase, "openrouter/providers");
}

main();
