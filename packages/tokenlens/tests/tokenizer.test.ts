import { TokenlensError } from "@tokenlens/core";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("countTokensWithOptionalTokenizer", () => {
  afterEach(() => {
    vi.doUnmock("@tokenlens/tokenizer");
    vi.resetModules();
  });

  it("wraps missing optional tokenizer dependency errors", async () => {
    const missingDependency = Object.assign(
      new Error("Cannot find package '@tokenlens/tokenizer'"),
      { code: "ERR_MODULE_NOT_FOUND" },
    );
    vi.doMock("@tokenlens/tokenizer", () => ({
      countTokens: vi.fn(async () => {
        throw missingDependency;
      }),
    }));
    const { countTokensWithOptionalTokenizer } = await import(
      "../src/tokenizer.js"
    );

    await expect(
      countTokensWithOptionalTokenizer("gpt-4o", "Hello"),
    ).rejects.toMatchObject({
      code: TokenlensError.MissingDependency.code,
      cause: missingDependency,
      meta: { packageName: "@tokenlens/tokenizer" },
    });
  });

  it("rethrows tokenizer failures that are not missing dependency errors", async () => {
    const tokenizerFailure = Object.assign(new Error("broken tokenizer"), {
      code: "TOKENIZER_RUNTIME_FAILURE",
    });
    vi.doMock("@tokenlens/tokenizer", () => ({
      countTokens: vi.fn(async () => {
        throw tokenizerFailure;
      }),
    }));
    const { countTokensWithOptionalTokenizer } = await import(
      "../src/tokenizer.js"
    );

    await expect(
      countTokensWithOptionalTokenizer("gpt-4o", "Hello"),
    ).rejects.toBe(tokenizerFailure);
  });

  it("does not wrap module resolution errors for other packages", async () => {
    const otherMissingDependency = Object.assign(
      new Error("Cannot find package 'other-package'"),
      { code: "MODULE_NOT_FOUND" },
    );
    vi.doMock("@tokenlens/tokenizer", () => ({
      countTokens: vi.fn(async () => {
        throw otherMissingDependency;
      }),
    }));
    const { countTokensWithOptionalTokenizer } = await import(
      "../src/tokenizer.js"
    );

    await expect(
      countTokensWithOptionalTokenizer("gpt-4o", "Hello"),
    ).rejects.toBe(otherMissingDependency);
  });

  it("rethrows primitive tokenizer failures", async () => {
    vi.doMock("@tokenlens/tokenizer", () => ({
      countTokens: vi.fn(async () => {
        throw "broken";
      }),
    }));
    const { countTokensWithOptionalTokenizer } = await import(
      "../src/tokenizer.js"
    );

    await expect(
      countTokensWithOptionalTokenizer("gpt-4o", "Hello"),
    ).rejects.toBe("broken");
  });
});

describe("Tokenlens tokenizer injection", () => {
  it("can disable implicit tokenizer loading", async () => {
    const { Tokenlens } = await import("../src/client.js");
    const tokenlens = new Tokenlens({
      catalog: {},
      tokenizer: false,
    });

    await expect(
      tokenlens.countTokens({ modelId: "openai/gpt-4o", data: "hello" }),
    ).rejects.toMatchObject({
      code: TokenlensError.MissingDependency.code,
      meta: { packageName: "@tokenlens/tokenizer" },
    });
  });

  it("uses an injected tokenizer for count and estimate helpers", async () => {
    const { Tokenlens } = await import("../src/client.js");
    const tokenlens = new Tokenlens({
      catalog: {
        openai: {
          id: "openai",
          models: {
            "openai/gpt-4o": {
              id: "openai/gpt-4o",
              canonical_id: "openai/gpt-4o",
              name: "GPT-4o",
              cost: { input: 10 },
            },
          },
        },
      },
      tokenizer: ({ data }) => data.split(/\s+/).length,
    });

    await expect(
      tokenlens.countTokens({ modelId: "openai/gpt-4o", data: "one two" }),
    ).resolves.toBe(2);
    await expect(
      tokenlens.estimateCostUSD({
        modelId: "openai/gpt-4o",
        data: "one two three",
      }),
    ).resolves.toMatchObject({
      inputTokens: 3,
      inputTokenCostUSD: 0.00003,
      totalTokenCostUSD: 0.00003,
    });
  });
});
