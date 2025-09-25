/* eslint-disable no-console */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  createTokenlens,
  type TokenCosts,
  type SourceProviders,
  type SourceModel,
} from "tokenlens";

type ScenarioUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens?: number;
};

type Scenario = {
  name: string;
  usage: ScenarioUsage;
  reserveOutput?: number;
};

function buildScenarios(maxTokens: number | undefined): Scenario[] {
  const cap = maxTokens ?? 100_000; // fallback for models without combined cap
  const near = Math.max(0, cap - 512);
  return [
    {
      name: "zero",
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      reserveOutput: 256,
    },
    {
      name: "small",
      usage: { inputTokens: 500, outputTokens: 100, totalTokens: 600 },
      reserveOutput: 256,
    },
    {
      name: "medium",
      usage: { inputTokens: 5_000, outputTokens: 1_000, totalTokens: 6_000 },
      reserveOutput: 256,
    },
    {
      name: "near-limit",
      usage: {
        inputTokens: Math.floor(near * 0.8),
        outputTokens: Math.floor(near * 0.2),
      },
      reserveOutput: 256,
    },
    {
      name: "over-limit",
      usage: {
        inputTokens: cap,
        outputTokens: 1_000,
        totalTokens: cap + 1_000,
      },
      reserveOutput: 256,
    },
  ];
}

function toUsagePayload(usage: ScenarioUsage) {
  return {
    input_tokens: usage.inputTokens,
    output_tokens: usage.outputTokens,
    total_tokens: usage.totalTokens,
  };
}

function computeContextStats(args: {
  contextLimit?: number;
  inputLimit?: number;
  outputLimit?: number;
  usage: ScenarioUsage;
  reserveOutput?: number;
}) {
  const { contextLimit, inputLimit, outputLimit, usage, reserveOutput } = args;
  const total = usage.totalTokens ?? usage.inputTokens + usage.outputTokens;
  const reserve = Math.max(0, reserveOutput ?? 0);

  const remainingCombined =
    contextLimit !== undefined ? Math.max(0, contextLimit - total) : undefined;
  const remainingInput =
    inputLimit !== undefined
      ? Math.max(0, inputLimit - usage.inputTokens)
      : undefined;
  const remainingOutput =
    outputLimit !== undefined
      ? Math.max(0, outputLimit - usage.outputTokens)
      : undefined;

  const percentUsedRaw =
    contextLimit !== undefined && contextLimit > 0
      ? total / contextLimit
      : inputLimit !== undefined && inputLimit > 0
        ? usage.inputTokens / inputLimit
        : outputLimit !== undefined && outputLimit > 0
          ? usage.outputTokens / outputLimit
          : 0;
  const percentUsed = Number.isFinite(percentUsedRaw)
    ? Math.min(Math.max(percentUsedRaw, 0), 1)
    : 0;

  const fitsContext = (() => {
    if (contextLimit !== undefined) {
      return total + reserve <= contextLimit;
    }
    if (inputLimit !== undefined) {
      return usage.inputTokens + reserve <= inputLimit;
    }
    if (outputLimit !== undefined) {
      return usage.outputTokens + reserve <= outputLimit;
    }
    return true;
  })();

  return {
    remainingContext: {
      remainingCombined,
      remainingInput,
      percentUsed: Number(percentUsed.toFixed(6)),
    },
    tokensRemaining: {
      combined: remainingCombined,
      input: remainingInput,
      output: remainingOutput,
    },
    fitsContext,
    totalTokens: total,
  };
}

async function main() {
  const tokenlens = createTokenlens();
  const results: Array<Record<string, unknown>> = [];

  const providers: SourceProviders = await tokenlens.getProviders();

  for (const [providerId, provider] of Object.entries(providers) as Array<
    [string, SourceProviders[string]]
  >) {
    const models = provider?.models ?? {};
    for (const [canonicalId, model] of Object.entries(models) as Array<
      [string, SourceModel]
    >) {
      const limit = model?.limit ?? {};
      const scenarios = buildScenarios(limit.context);

      const scenarioResults: Array<Record<string, unknown>> = [];
      for (const scenario of scenarios) {
        const usagePayload = toUsagePayload(scenario.usage);
        const cost: TokenCosts = await tokenlens.estimateCostUSD({
          modelId: canonicalId,
          provider: providerId,
          usage: usagePayload,
        });

        const stats = computeContextStats({
          contextLimit: limit.context,
          inputLimit: limit.input,
          outputLimit: limit.output,
          usage: scenario.usage,
          reserveOutput: scenario.reserveOutput,
        });

        scenarioResults.push({
          name: scenario.name,
          usage: scenario.usage,
          reserveOutput: scenario.reserveOutput,
          remainingContext: stats.remainingContext,
          tokensRemaining: stats.tokensRemaining,
          estimateCost: cost,
          fitsContext: stats.fitsContext,
        });
      }

      results.push({
        id: model?.id ?? canonicalId,
        provider: providerId,
        status: (model?.extras as Record<string, unknown> | undefined)?.status,
        maxTokens: limit.context,
        pricePerTokenIn: model?.cost?.input,
        pricePerTokenOut: model?.cost?.output,
        source: provider?.source,
        contextWindow: {
          combinedMax: limit.context,
          inputMax: limit.input,
          outputMax: limit.output,
        },
        scenarios: scenarioResults,
      });
    }
  }

  // Stable sort by id for reproducibility
  results.sort((a, b) => String(a.id).localeCompare(String(b.id)));

  const outDir = resolve(process.cwd(), "benchmarks");
  await mkdir(outDir, { recursive: true });
  const outFile = resolve(outDir, "tokenlens-benchmark.json");
  await writeFile(
    outFile,
    `${JSON.stringify(
      { generatedAt: new Date().toISOString(), models: results },
      null,
      2,
    )}\n`,
    "utf8",
  );
  console.log(`Benchmark written: ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
