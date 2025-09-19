import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

const mode = process.argv[2] ?? "all"; // 'root' | 'packages' | 'all'

function syncRootReadme() {
  const src = resolve(root, "README.md");
  const dest = resolve(root, "packages/tokenlens/README.md");
  const content = readFileSync(src, "utf8");
  writeFileSync(
    dest,
    content.endsWith("\n") ? content : `${content}\n`,
    "utf8",
  );
  console.log(`Synced README: ${src} -> ${dest}`);
}

function isBadge(line) {
  const t = line.trim();
  return t.startsWith("[![") || t.includes("img.shields.io");
}

function isBlank(line) {
  return line.trim().length === 0;
}

function extractRootHeader() {
  const src = resolve(root, "README.md");
  const content = readFileSync(src, "utf8");
  const lines = content.split(/\r?\n/);
  if (lines.length < 2 || !/^=+$/.test(lines[1] ?? ""))
    return { badges: [], screenshot: null };

  // Collect contiguous badge lines after underline (including blanks)
  let i = 2;
  const badges = [];
  while (i < lines.length && (isBadge(lines[i]) || isBlank(lines[i]))) {
    badges.push(lines[i]);
    i++;
  }

  // Find screenshot line anywhere (first occurrence)
  const screenshotLine =
    lines.find((l) => l.includes("![TokenLens overview]")) ?? null;
  return { badges, screenshot: screenshotLine };
}

function transformHeaderForPackage(badges, screenshot, pkgName) {
  const enc = encodeURIComponent(pkgName);
  const outBadges = badges.map((line) => {
    let s = line;
    // npm version + downloads: replace token or any name segment after /v/ or /dm/
    s = s.replace(/npm\/v\/[^.]+\.svg/g, `npm/v/${enc}.svg`);
    s = s.replace(/npm\/dm\/[^.]+\.svg/g, `npm/dm/${enc}.svg`);
    // npm package link (normalize to https://www.npmjs.com/package/...)
    s = s.replace(
      /https?:\/\/(?:www\.)?npmjs\.com\/package\/[\w@/.-]+/g,
      `https://www.npmjs.com/package/${pkgName}`,
    );
    // LICENSE link: make path work from packages/* (../../LICENSE)
    s = s.replace(/\(\.?\/?LICENSE\)/g, "(../../LICENSE)");
    return s;
  });
  const outScreenshot =
    screenshot ??
    "![TokenLens overview](https://raw.githubusercontent.com/xn1cklas/tokenlens/HEAD/assets/tokenlens.png)";
  return { outBadges, outScreenshot };
}

function syncPackageHeaders() {
  const { badges: rootBadges, screenshot: rootScreenshot } =
    extractRootHeader();
  const packagesDir = resolve(root, "packages");
  const names = readdirSync(packagesDir);

  for (const name of names) {
    if (["tokenlens", "provider-tests"].includes(name)) continue;
    const dir = join(packagesDir, name);
    if (!statSync(dir).isDirectory()) continue;

    const pkgJsonPath = join(dir, "package.json");
    const readmePath = join(dir, "README.md");

    try {
      const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
      const readme = readFileSync(readmePath, "utf8");

      // Normalize by removing any prior screenshot occurrences to keep a single copy at top
      const lines = readme
        .split(/\r?\n/)
        .filter((l) => !l.includes("![TokenLens overview]"));

      // Expect Title + underline ======== on first two lines
      if (lines.length < 2 || !/^=+$/.test(lines[1])) {
        // Skip if not following simple heading style
        continue;
      }

      // Build header for this package based on root header
      const fullName = pkgJson.name;
      const { outBadges, outScreenshot } = transformHeaderForPackage(
        rootBadges.length
          ? rootBadges
          : [
              // Fallback badges if root detection failed
              `[![npm version](https://img.shields.io/npm/v/tokenlens.svg)](https://www.npmjs.com/package/tokenlens)`,
              `[![npm downloads](https://img.shields.io/npm/dm/tokenlens.svg)](https://www.npmjs.com/package/tokenlens)`,
              `[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)`,
              `[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)`,
            ],
        rootScreenshot,
        fullName,
      );

      // Find existing badge block directly after underline (including blank lines)
      let i = 2;
      const start = i;
      while (i < lines.length && (isBadge(lines[i]) || isBlank(lines[i]))) i++;
      const end = i;

      const before = lines.slice(0, start);
      const after = lines.slice(end);

      const updatedLines = [
        ...before,
        ...outBadges,
        "",
        outScreenshot,
        "",
        ...after,
      ];

      const updated = updatedLines.join("\n");
      const original = lines.join("\n");
      if (updated !== original) {
        writeFileSync(
          readmePath,
          updated.endsWith("\n") ? updated : `${updated}\n`,
          "utf8",
        );
        console.log(`Synced header for ${fullName}`);
      }
    } catch (err) {
      console.warn(
        `Skipped ${name}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

if (mode === "root") {
  syncRootReadme();
} else if (mode === "packages") {
  syncPackageHeaders();
} else {
  syncRootReadme();
  syncPackageHeaders();
}
