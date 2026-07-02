import * as ts from "typescript";

export type TransformResult = {
  code: string;
  changed: boolean;
  warnings: string[];
};

type Edit = {
  start: number;
  end: number;
  text: string;
};

type ImportedName = {
  imported: string;
  local: string;
  isType: boolean;
};

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

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function applyEdits(source: string, edits: readonly Edit[]): string {
  let output = source;
  for (const edit of [...edits].sort((a, b) => b.start - a.start)) {
    output = `${output.slice(0, edit.start)}${edit.text}${output.slice(edit.end)}`;
  }
  return output;
}

function importStatement(args: {
  defaultName?: string;
  importTypeOnly: boolean;
  specifiers: readonly string[];
  source: string;
}): string {
  const parts: string[] = [];
  if (args.defaultName) parts.push(args.defaultName);
  if (args.specifiers.length) {
    parts.push(`{ ${args.specifiers.join(", ")} }`);
  }
  if (parts.length === 0) return "";
  return `import ${args.importTypeOnly ? "type " : ""}${parts.join(", ")} from "${args.source}";`;
}

function importedName(
  specifier: ts.ImportSpecifier,
  importTypeOnly: boolean,
): ImportedName {
  return {
    imported: specifier.propertyName?.text ?? specifier.name.text,
    local: specifier.name.text,
    isType: importTypeOnly || specifier.isTypeOnly,
  };
}

function specifierText(entry: ImportedName, importTypeOnly: boolean): string {
  const name =
    entry.imported === entry.local
      ? entry.imported
      : `${entry.imported} as ${entry.local}`;
  return entry.isType && !importTypeOnly ? `type ${name}` : name;
}

function replacementBounds(node: ts.Node) {
  return {
    start: node.getFullStart(),
    end: node.getEnd(),
  };
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

function moduleSpecifier(node: ts.ImportDeclaration): string | undefined {
  return ts.isStringLiteral(node.moduleSpecifier)
    ? node.moduleSpecifier.text
    : undefined;
}

function namedImports(node: ts.ImportDeclaration): ts.NamedImports | undefined {
  const bindings = node.importClause?.namedBindings;
  return bindings && ts.isNamedImports(bindings) ? bindings : undefined;
}

function transformTokenlensImport(args: {
  node: ts.ImportDeclaration;
  warnings: string[];
  modelIdLocals: Set<string>;
}): Edit | undefined {
  const named = namedImports(args.node);
  if (!named) return undefined;

  const importTypeOnly = args.node.importClause?.isTypeOnly ?? false;
  const retained: string[] = [];
  const tokenlensFetch: string[] = [];
  let changed = false;

  for (const specifier of named.elements) {
    const entry = importedName(specifier, importTypeOnly);

    if (entry.imported === "fetchModels") {
      changed = true;
      tokenlensFetch.push(
        entry.local === "fetchModels"
          ? "fetchModelsDev as fetchModels"
          : `fetchModelsDev as ${entry.local}`,
      );
      continue;
    }

    if (entry.imported === "ModelId") {
      changed = true;
      args.modelIdLocals.add(entry.local);
      continue;
    }

    const manualMigration = manualMigrations[entry.imported];
    if (manualMigration) {
      changed = true;
      args.warnings.push(`${entry.local}: ${manualMigration}`);
      continue;
    }

    retained.push(specifierText(entry, importTypeOnly));
  }

  if (!changed) return undefined;

  const defaultName = args.node.importClause?.name?.text;
  const replacement = [
    importStatement({
      ...(defaultName ? { defaultName } : {}),
      importTypeOnly,
      specifiers: retained,
      source: "tokenlens",
    }),
    importStatement({
      importTypeOnly: false,
      specifiers: tokenlensFetch,
      source: "tokenlens/fetch",
    }),
  ]
    .filter(Boolean)
    .join("\n");
  const bounds = replacementBounds(args.node);
  return { ...bounds, text: replacement };
}

function transformRemovedSubpathImport(args: {
  node: ts.ImportDeclaration;
  sourceFile: ts.SourceFile;
  subpath: string;
  warnings: string[];
}): Edit {
  const bindings = args.node.importClause?.getText(args.sourceFile) ?? "import";
  args.warnings.push(
    `${bindings} from tokenlens/${args.subpath}: Static catalog subpaths were removed; use a cached live catalog or provide SourceProviders.`,
  );
  const bounds = replacementBounds(args.node);
  return { ...bounds, text: "" };
}

function modelIdTypeEdits(
  sourceFile: ts.SourceFile,
  modelIdLocals: ReadonlySet<string>,
): Edit[] {
  if (modelIdLocals.size === 0) return [];
  const edits: Edit[] = [];

  const visit = (node: ts.Node) => {
    if (
      ts.isTypeReferenceNode(node) &&
      ts.isIdentifier(node.typeName) &&
      modelIdLocals.has(node.typeName.text)
    ) {
      edits.push({
        start: node.typeName.getStart(sourceFile),
        end: node.typeName.getEnd(),
        text: "string",
      });
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return edits;
}

export function transformV1ToV2(input: string): TransformResult {
  const sourceFile = ts.createSourceFile(
    "tokenlens-codemod.tsx",
    input,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const warnings: string[] = [];
  const edits: Edit[] = [];
  const modelIdLocals = new Set<string>();

  for (const node of sourceFile.statements) {
    if (!ts.isImportDeclaration(node)) continue;
    const source = moduleSpecifier(node);
    if (!source) continue;

    if (source === "tokenlens") {
      const edit = transformTokenlensImport({
        node,
        warnings,
        modelIdLocals,
      });
      if (edit) edits.push(edit);
      continue;
    }

    if (
      source === "tokenlens/models" ||
      source.startsWith("tokenlens/providers/")
    ) {
      edits.push(
        transformRemovedSubpathImport({
          node,
          sourceFile,
          subpath: source.slice("tokenlens/".length),
          warnings,
        }),
      );
    }
  }

  edits.push(...modelIdTypeEdits(sourceFile, modelIdLocals));

  let code = applyEdits(input, edits);
  const uniqueWarnings = unique(warnings);
  if (uniqueWarnings.length > 0 && !code.includes("TODO(tokenlens-codemod)")) {
    code = `${todoComment(uniqueWarnings)}${code.trimStart()}`;
  }

  return {
    code,
    changed: edits.length > 0 || code !== input,
    warnings: uniqueWarnings,
  };
}
