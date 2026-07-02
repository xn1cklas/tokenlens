import { describe, expect, it } from "vitest";
import { transformV1ToV2 } from "../src/transform.js";

describe("transformV1ToV2", () => {
  it("leaves files without tokenlens v1 imports unchanged", () => {
    const input = `
const modelId = "openai/gpt-4o";
void modelId;
`;

    const result = transformV1ToV2(input);

    expect(result).toEqual({
      code: input,
      changed: false,
      warnings: [],
    });
  });

  it("rewrites fetchModels and ModelId imports with safe equivalents", () => {
    const result = transformV1ToV2(`
import { fetchModels, type ModelId, computeCostUSD } from "tokenlens";

const id: ModelId = "openai:gpt-4o";
await fetchModels();
void computeCostUSD;
`);

    expect(result.code).toContain(
      'import { computeCostUSD } from "tokenlens";',
    );
    expect(result.code).toContain(
      'import { fetchModelsDev as fetchModels } from "tokenlens/fetch";',
    );
    expect(result.code).toContain("const id: string");
    expect(result.warnings).toEqual([]);
  });

  it("only rewrites ModelId in type references", () => {
    const result = transformV1ToV2(`
import { type ModelId } from "tokenlens";

type Wrapped = Array<ModelId>;
const ModelId = "runtime value";
const text = "ModelId";
const object = { ModelId };
`);

    expect(result.code).toContain("type Wrapped = Array<string>;");
    expect(result.code).toContain('const ModelId = "runtime value";');
    expect(result.code).toContain('const text = "ModelId";');
    expect(result.code).toContain("const object = { ModelId };");
  });

  it("rewrites default and mixed type imports without touching supported imports", () => {
    const result = transformV1ToV2(`
import tokenlens, { fetchModels, type TokenlensOptions, type ModelId } from "tokenlens";

type Options = TokenlensOptions & { model: ModelId };
await fetchModels();
void tokenlens;
`);

    expect(result.code).toContain(
      'import tokenlens, { type TokenlensOptions } from "tokenlens";',
    );
    expect(result.code).toContain(
      'import { fetchModelsDev as fetchModels } from "tokenlens/fetch";',
    );
    expect(result.code).toContain(
      "type Options = TokenlensOptions & { model: string }",
    );
  });

  it("rewrites type-only imports without creating value imports", () => {
    const result = transformV1ToV2(`
import type { TokenlensOptions, ModelId } from "tokenlens";

type Options = TokenlensOptions & { model: ModelId };
`);

    expect(result.code).toContain(
      'import type { TokenlensOptions } from "tokenlens";',
    );
    expect(result.code).not.toContain("tokenlens/fetch");
    expect(result.code).toContain(
      "type Options = TokenlensOptions & { model: string }",
    );
  });

  it("leaves supported tokenlens imports unchanged", () => {
    const input = `
import tokenlens from "tokenlens";
import { Tokenlens, type TokenlensOptions } from "tokenlens";

void tokenlens;
void Tokenlens;
`;

    expect(transformV1ToV2(input)).toEqual({
      code: input,
      changed: false,
      warnings: [],
    });
  });

  it("rewrites aliased imports and retains supported imports", () => {
    const result = transformV1ToV2(`
import { , Tokenlens as TL, fetchModels as loadModels, type ModelId as TokenlensModelId } from "tokenlens";

const id: TokenlensModelId = "openai:gpt-4o";
await loadModels();
void TL;
`);

    expect(result.code).toContain(
      'import { Tokenlens as TL } from "tokenlens";',
    );
    expect(result.code).toContain(
      'import { fetchModelsDev as loadModels } from "tokenlens/fetch";',
    );
    expect(result.code).toContain("const id: string");
    expect(result.warnings).toEqual([]);
  });

  it("adds TODO comments for sync helper migrations", () => {
    const result = transformV1ToV2(`
import { costFromUsage, shouldCompact } from "tokenlens";

const cost = costFromUsage({ id, usage });
const compact = shouldCompact({ modelId, usage });
`);

    expect(result.code).toContain("TODO(tokenlens-codemod)");
    expect(result.code).toContain("costFromUsage");
    expect(result.code).toContain("shouldCompact");
    expect(result.code).not.toContain('from "tokenlens"');
    expect(result.warnings).toHaveLength(2);
  });

  it("does not duplicate an existing migration TODO", () => {
    const result = transformV1ToV2(`
/*
 * TODO(tokenlens-codemod): Finish the Tokenlens v2 migration for this file.
 */
import { costFromUsage } from "tokenlens";
void costFromUsage;
`);

    expect(result.code.match(/TODO\(tokenlens-codemod\)/g)).toHaveLength(1);
    expect(result.warnings).toHaveLength(1);
  });

  it("flags removed static catalog subpaths", () => {
    const result = transformV1ToV2(`
import { getModels } from "tokenlens/models";
import { openai } from "tokenlens/providers/openai";

void getModels;
void openai;
`);

    expect(result.code).toContain("Static catalog subpaths were removed");
    expect(result.code).not.toContain('from "tokenlens/models"');
    expect(result.code).not.toContain('from "tokenlens/providers/openai"');
    expect(result.warnings).toHaveLength(2);
  });

  it("flags side-effect static catalog subpath imports", () => {
    const result = transformV1ToV2(`
import "tokenlens/models";
`);

    expect(result.code).toContain("Static catalog subpaths were removed");
    expect(result.code).not.toContain('import "tokenlens/models"');
    expect(result.warnings).toEqual([
      "import from tokenlens/models: Static catalog subpaths were removed; use a cached live catalog or provide SourceProviders.",
    ]);
  });
});
