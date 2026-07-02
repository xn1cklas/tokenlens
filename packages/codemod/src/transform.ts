export type TransformResult = {
  code: string;
  changed: boolean;
  warnings: string[];
};

type ImportedName = {
  imported: string;
  local: string;
  isType: boolean;
  raw: string;
};

const TOKENLENS_IMPORT_RE =
  /import\s*{([\s\S]*?)}\s*from\s*["']tokenlens["'];?/g;
const REMOVED_SUBPATH_RE =
  /import\s+([\s\S]*?)\s+from\s*["']tokenlens\/(models|providers\/[^"']+)["'];?/g;

const manualMigrations: Record<string, string> = {
  MODEL_IDS:
    "Use await tokenlens.refresh() and derive ids from the returned SourceProviders.",
  aliases:
    "Use a custom SourceProviders fixture or resolve through Tokenlens methods.",
  assertModelId:
    "Model IDs are dynamic strings in v2; validate against a refreshed catalog when needed.",
  contextHealth:
    "Use await tokenlens.getContextHealth({ modelId, usage }) and adapt status labels if needed.",
  costFromUsage: "Use await tokenlens.computeCostUSD({ modelId, usage }).",
  defaultCatalog:
    "Static bundled catalogs were removed; use a cached live catalog or provide SourceProviders.",
  estimateConversationCost:
    "Aggregate usage in application code, then call computeCostUSD per model as needed.",
  estimateCost: "Use await tokenlens.computeCostUSD({ modelId, usage }).",
  fitsContext:
    "Use await tokenlens.getContextLimits({ modelId }) and apply app-specific policy.",
  getContext:
    "Use await tokenlens.getContextLimits({ modelId }) for raw limits.",
  getContextWindow: "Use await tokenlens.getContextLimits({ modelId }).",
  getModelMeta: "Use await tokenlens.getModelData({ modelId, provider? }).",
  getModelRaw: "Use await tokenlens.getModelData({ modelId, provider? }).",
  getModels:
    "Static bundled catalogs were removed; use a cached live catalog or provide SourceProviders.",
  getTokenCosts: "Use await tokenlens.computeCostUSD({ modelId, usage }).",
  getUsage:
    "Use normalizeUsage from tokenlens/helpers plus Tokenlens methods for model metadata.",
  isModelId:
    "Model IDs are dynamic strings in v2; validate against a refreshed catalog when needed.",
  listModels:
    "Use await tokenlens.refresh() and derive model lists from the returned SourceProviders.",
  modelMeta: "Use await tokenlens.getModelData({ modelId, provider? }).",
  models:
    "Use await tokenlens.refresh() and derive maps from the returned SourceProviders.",
  nextTurnBudget:
    "Use getContextLimits/getContextHealth and keep budgeting policy in application code.",
  percentOfContextUsed:
    "Use await tokenlens.getContextHealth({ modelId, usage }).",
  percentRemaining: "Use await tokenlens.getContextHealth({ modelId, usage }).",
  remainingContext:
    "Use await tokenlens.getContextHealth({ modelId, usage }) or getContextLimits.",
  resolveModel: "Use await tokenlens.getModelData({ modelId, provider? }).",
  shouldCompact:
    "Use getContextHealth and keep compaction thresholds in application code.",
  summarizeUsage:
    "Use normalizeUsage from tokenlens/helpers and app-specific summaries.",
  tokensRemaining: "Use await tokenlens.getContextHealth({ modelId, usage }).",
  tokensToCompact:
    "Use getContextHealth and keep compaction thresholds in application code.",
};

function parseImport(raw: string): ImportedName | undefined {
  const specifier = raw.trim();
  if (!specifier) return undefined;
  const typePrefix = "type ";
  const isType = specifier.startsWith(typePrefix);
  const withoutType = isType
    ? specifier.slice(typePrefix.length).trim()
    : specifier;
  const [importedRaw, localRaw] = withoutType.split(/\s+as\s+/);
  const imported = importedRaw?.trim();
  const local = localRaw?.trim() ?? imported;
  if (!imported || !local) return undefined;
  return { imported, local, isType, raw: specifier };
}

function parseImports(rawImports: string): ImportedName[] {
  return rawImports
    .split(",")
    .map(parseImport)
    .filter((entry): entry is ImportedName => entry !== undefined);
}

function replaceIdentifier(
  source: string,
  identifier: string,
  replacement: string,
): string {
  return source.replace(
    new RegExp(
      `\\b${identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "g",
    ),
    replacement,
  );
}

function importStatement(specifiers: string[], source: string): string {
  if (specifiers.length === 0) return "";
  return `import { ${specifiers.join(", ")} } from "${source}";`;
}

function todoComment(warnings: string[]): string {
  const lines = [
    "/*",
    " * TODO(tokenlens-codemod): Finish the Tokenlens v2 migration for this file.",
    ...warnings.map((warning) => ` * - ${warning}`),
    " */",
    "",
  ];
  return lines.join("\n");
}

export function transformV1ToV2(input: string): TransformResult {
  let code = input;
  const warnings: string[] = [];
  const identifierReplacements: Array<{ from: string; to: string }> = [];
  let changed = false;

  code = code.replace(TOKENLENS_IMPORT_RE, (_match, rawImports: string) => {
    const imports = parseImports(rawImports);
    const retained: string[] = [];
    const tokenlensFetch: string[] = [];

    for (const entry of imports) {
      if (entry.imported === "fetchModels") {
        tokenlensFetch.push(
          entry.local === "fetchModels"
            ? "fetchModelsDev as fetchModels"
            : `fetchModelsDev as ${entry.local}`,
        );
        changed = true;
        continue;
      }

      if (entry.imported === "ModelId") {
        identifierReplacements.push({ from: entry.local, to: "string" });
        changed = true;
        continue;
      }

      const manualMigration = manualMigrations[entry.imported];
      if (manualMigration) {
        warnings.push(`${entry.local}: ${manualMigration}`);
        changed = true;
        continue;
      }

      retained.push(entry.raw);
    }

    return [
      importStatement(retained, "tokenlens"),
      importStatement(tokenlensFetch, "tokenlens/fetch"),
    ]
      .filter(Boolean)
      .join("\n");
  });

  for (const replacement of identifierReplacements) {
    code = replaceIdentifier(code, replacement.from, replacement.to);
  }

  code = code.replace(
    REMOVED_SUBPATH_RE,
    (_match, bindings: string, subpath: string) => {
      warnings.push(
        `${bindings.trim()} from tokenlens/${subpath}: Static catalog subpaths were removed; use a cached live catalog or provide SourceProviders.`,
      );
      changed = true;
      return "";
    },
  );

  if (warnings.length > 0 && !code.includes("TODO(tokenlens-codemod)")) {
    code = `${todoComment([...new Set(warnings)])}${code.trimStart()}`;
  }

  return {
    code,
    changed: changed || code !== input,
    warnings: [...new Set(warnings)],
  };
}
