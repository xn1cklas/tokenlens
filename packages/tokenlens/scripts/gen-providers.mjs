import { readdirSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve the providers directory from @tokenlens/models (prefer dist, fallback to src)
const repoRoot = resolve(__dirname, "../../..");
const modelsProvidersDir = resolve(repoRoot, "packages/models/dist/providers");
const modelsProvidersSrcDir = resolve(
  repoRoot,
  "packages/models/src/providers",
);

function ensureDir(dir) {
  try {
    mkdirSync(dir, { recursive: true });
  } catch {}
}

function main() {
  let baseDir = modelsProvidersDir;
  try {
    if (!statSync(baseDir).isDirectory()) throw new Error("no dist/providers");
  } catch {
    baseDir = modelsProvidersSrcDir;
    try {
      if (!statSync(baseDir).isDirectory()) throw new Error("no src/providers");
    } catch {
      console.error(
        `Providers dir not found in dist or src: \n - ${modelsProvidersDir}\n - ${modelsProvidersSrcDir}`,
      );
      process.exit(0);
    }
  }

  const outDir = resolve(__dirname, "../src/exports/providers");
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
    const contents = `export * from "@tokenlens/models/${name}";\n`;
    writeFileSync(outPath, contents, "utf8");
  }

  // Also generate an index for convenience (not exported by subpath)
  const indexPath = join(outDir, `index.ts`);
  const index =
    names
      .map(
        (n) =>
          `export * as ${n.replace(/[^a-zA-Z0-9_]/g, "_")} from "./${n}.js";`,
      )
      .join("\n") + "\n";
  writeFileSync(indexPath, index, "utf8");
}

main();
