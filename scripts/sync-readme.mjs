import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const root = resolve(__dirname, "..");
const src = resolve(root, "README.md");
const dest = resolve(root, "packages/tokenlens/README.md");

const content = readFileSync(src, "utf8");
writeFileSync(dest, content.endsWith("\n") ? content : content + "\n", "utf8");
console.log(`Synced README: ${src} -> ${dest}`);
