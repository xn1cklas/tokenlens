// Simple micro-benchmark for model lookups via the built registry.
//
// Usage:
//   node scripts/bench-lookup.mjs [query] [iterations]
// Examples:
//   node scripts/bench-lookup.mjs                         # default id, 500k iters
//   node scripts/bench-lookup.mjs "gpt-4o" 1000000       # alias example
//   node scripts/bench-lookup.mjs "openai:gpt-4o" 750000 # canonical id example
import { performance } from "node:perf_hooks";
import { resolveModel, getModelRaw, MODEL_IDS } from "../dist/registry.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cli = process.argv.slice(2);
let iterations = 5000;
const queries = [];
for (let i = 0; i < cli.length; i++) {
  const a = cli[i];
  if (a === "--") continue;
  if (a === "--iters" || a === "-n") {
    const v = Number(cli[i + 1]);
    if (Number.isFinite(v)) iterations = v;
    i++;
    continue;
  }
  // treat anything else as a query string
  queries.push(a);
}

// Pick a stable default: the first canonical id.
const defaultQueries = [
  "openai:gpt-4o",
  "anthropic:claude-3-5-sonnet-20240620",
  "alibaba:qwen3-coder-plus",
];
const pickedDefaults = defaultQueries.filter((q) => resolveModel(q));
const finalQueries = queries.length
  ? queries
  : pickedDefaults.length
    ? pickedDefaults
    : [MODEL_IDS[0]];

function fmt(num) {
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function bench(label, fn, iters) {
  // Warm-up (JIT + caches)
  const warmup = Math.min(50_000, Math.max(5_000, Math.floor(iters * 0.05)));
  let sink = 0;
  for (let i = 0; i < warmup; i++) sink += fn();

  // Timed rounds
  const rounds = 5;
  const times = [];
  for (let r = 0; r < rounds; r++) {
    sink = 0;
    const start = performance.now();
    for (let i = 0; i < iters; i++) sink += fn();
    const end = performance.now();
    times.push(end - start);
  }
  times.sort((a, b) => a - b);
  const ms = times[Math.floor(times.length / 2)]; // median
  const nsPerOp = (ms * 1e6) / iters;
  const opsPerSec = iters / (ms / 1000);
  // Prevent dead code elimination
  if (sink === Number.MIN_VALUE) console.log("");
  return { ms, nsPerOp, opsPerSec };
}

const perQuery = [];
for (const query of finalQueries) {
  const resolved = resolveModel(query);
  const canonical = resolved?.id ?? query;
  console.log(
    `Benchmark: lookup "${query}" (${iterations.toLocaleString()} iterations)`,
  );
  if (!resolved) {
    console.log(
      "Note: query did not resolve; benchmarking function call overhead anyway.",
    );
  }
  const res1 = bench(
    "resolveModel",
    () => (resolveModel(query) ? 1 : 0),
    iterations,
  );
  const res2 = bench(
    "getModelRaw",
    () => (getModelRaw(canonical) ? 1 : 0),
    iterations,
  );
  console.log("\nResults");
  console.log(
    `- resolveModel: ${fmt(res1.ms)} ms (median), ${fmt(res1.nsPerOp)} ns/op, ${fmt(res1.opsPerSec)} ops/s`,
  );
  console.log(
    `- getModelRaw: ${fmt(res2.ms)} ms (median), ${fmt(res2.nsPerOp)} ns/op, ${fmt(res2.opsPerSec)} ops/s`,
  );
  perQuery.push({
    input: query,
    canonical,
    resolveModel: res1,
    getModelRaw: res2,
  });
  console.log("");
}

// Persist results as JSON for longitudinal tracking
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
);
const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}-${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
const pretty = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
const outDir = path.join(__dirname, "..", "benchmarks", "lookup");
fs.mkdirSync(outDir, { recursive: true });

const payload = {
  tool: "bench-lookup",
  date: now.toISOString(),
  package: { name: pkg.name, version: pkg.version },
  node: process.version,
  environment: { platform: process.platform, arch: process.arch },
  dataset: { modelsCount: MODEL_IDS.length },
  iterations,
  queries: perQuery,
};

const versionTag = `v${pkg.version}`;
const base = `lookup_${versionTag}_${stamp}_n${iterations}`;
const file = path.join(
  outDir,
  perQuery.length === 1
    ? `${base}_${pretty(perQuery[0].input)}.json`
    : `${base}_multi-${perQuery.length}.json`,
);
fs.writeFileSync(file, JSON.stringify(payload, null, 2), "utf8");
console.log(`\nSaved: ${path.relative(path.join(__dirname, ".."), file)}`);
