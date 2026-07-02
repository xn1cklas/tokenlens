#!/usr/bin/env node
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { transformV1ToV2 } from "./transform.js";

const SOURCE_EXTENSIONS = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);
const SKIP_DIRS = new Set([
  ".git",
  ".next",
  "coverage",
  "dist",
  "node_modules",
]);

function usage(): string {
  return [
    "Usage: tokenlens-codemod v2 [paths...] [--write]",
    "",
    "Runs the Tokenlens v1 to v2 migration codemod.",
    "Dry-run mode is the default; pass --write to update files.",
  ].join("\n");
}

function extension(path: string): string {
  const index = path.lastIndexOf(".");
  return index >= 0 ? path.slice(index) : "";
}

async function collectFiles(path: string): Promise<string[]> {
  const info = await stat(path);
  if (info.isFile()) {
    return SOURCE_EXTENSIONS.has(extension(path)) ? [path] : [];
  }
  if (!info.isDirectory()) return [];

  const entries = await readdir(path, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((entry) => !SKIP_DIRS.has(entry.name))
      .map((entry) => collectFiles(join(path, entry.name))),
  );
  return files.flat();
}

async function run(args: string[]): Promise<number> {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(usage());
    return 0;
  }

  const command = args[0];
  if (command !== "v2" && command !== "v1-to-v2") {
    console.error(usage());
    return 1;
  }

  const write = args.includes("--write");
  const paths = args
    .slice(1)
    .filter((arg) => arg !== "--write" && arg !== "--dry");
  const targetPaths = paths.length > 0 ? paths : ["."];
  const files = (await Promise.all(targetPaths.map(collectFiles))).flat();
  let changedCount = 0;
  let warningCount = 0;

  for (const file of files) {
    const before = await readFile(file, "utf8");
    const result = transformV1ToV2(before);
    if (!result.changed) continue;
    changedCount += 1;
    warningCount += result.warnings.length;
    if (write) {
      await writeFile(file, result.code);
    }
    console.log(`${write ? "updated" : "would update"} ${file}`);
    for (const warning of result.warnings) {
      console.log(`  - ${warning}`);
    }
  }

  console.log(
    `${write ? "Updated" : "Would update"} ${changedCount} file(s), ${warningCount} manual follow-up(s).`,
  );
  return 0;
}

run(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  },
);
