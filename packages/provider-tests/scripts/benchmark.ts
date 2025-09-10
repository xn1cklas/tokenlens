/* eslint-disable no-console */
import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import {
  MODEL_IDS,
  modelMeta,
  getContextWindow,
  remainingContext,
  percentOfContextUsed,
  tokensRemaining,
  estimateCost,
} from "tokenlens";

type Scenario = {
  name: string;
  usage: { input: number; output: number; total?: number };
  reserveOutput?: number;
};

function buildScenarios(maxTokens: number | undefined): Scenario[] {
  const cap = maxTokens ?? 100_000; // fallback for models without combined cap
  const near = Math.max(0, cap - 512);
  return [
    {
      name: "zero",
      usage: { input: 0, output: 0, total: 0 },
      reserveOutput: 256,
    },
    {
      name: "small",
      usage: { input: 500, output: 100, total: 600 },
      reserveOutput: 256,
    },
    {
      name: "medium",
      usage: { input: 5_000, output: 1_000, total: 6_000 },
      reserveOutput: 256,
    },
    {
      name: "near-limit",
      usage: { input: Math.floor(near * 0.8), output: Math.floor(near * 0.2) },
      reserveOutput: 256,
    },
    {
      name: "over-limit",
      usage: { input: cap, output: 1_000, total: cap + 1_000 },
      reserveOutput: 256,
    },
  ];
}

async function main() {
  const results: Array<Record<string, unknown>> = [];

  for (const id of MODEL_IDS) {
    const meta = modelMeta(id);
    const caps = getContextWindow(id);
    const scenarios = buildScenarios(meta.maxTokens);

    const scenarioResults = scenarios.map((s) => {
      const rc = remainingContext({
        modelId: id,
        usage: s.usage,
        reserveOutput: s.reserveOutput,
      });
      const percent = percentOfContextUsed({
        id,
        usage: s.usage,
        reserveOutput: s.reserveOutput,
      });
      const remaining = tokensRemaining({
        id,
        usage: s.usage,
        reserveOutput: s.reserveOutput,
      });
      const cost = estimateCost({ modelId: id, usage: s.usage });
      const fits =
        typeof (s.usage.total ?? s.usage.input + s.usage.output) === "number"
          ? rc.model
            ? (s.usage.total ?? s.usage.input + s.usage.output) +
                Math.max(0, s.reserveOutput ?? 0) <=
              (rc.model.context.combinedMax ??
                rc.model.context.inputMax ??
                Number.POSITIVE_INFINITY)
            : false
          : undefined;
      return {
        name: s.name,
        usage: s.usage,
        reserveOutput: s.reserveOutput,
        remainingContext: {
          remainingCombined: rc.remainingCombined,
          remainingInput: rc.remainingInput,
          percentUsed: Number(percent.toFixed(6)),
        },
        tokensRemaining: remaining,
        estimateCost: cost,
        fitsContext: fits,
      };
    });

    results.push({
      id: meta.id,
      provider: meta.provider,
      status: meta.status,
      maxTokens: meta.maxTokens,
      pricePerTokenIn: meta.pricePerTokenIn,
      pricePerTokenOut: meta.pricePerTokenOut,
      source: meta.source,
      contextWindow: caps,
      scenarios: scenarioResults,
    });
  }

  // Stable sort by id for reproducibility
  results.sort((a, b) => String(a.id).localeCompare(String(b.id)));

  const outDir = resolve(process.cwd(), "benchmarks");
  await mkdir(outDir, { recursive: true });
  const outFile = resolve(outDir, "tokenlens-benchmark.json");
  await writeFile(
    outFile,
    JSON.stringify(
      { generatedAt: new Date().toISOString(), models: results },
      null,
      2,
    ) + "\n",
    "utf8",
  );
  console.log(`Benchmark written: ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
