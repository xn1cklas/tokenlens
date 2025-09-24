import { describe, expect, it, vi } from "vitest";
import { countTokens } from "../src/index.js";

vi.mock("../src/tokenizers/openai.js", async () => {
  const actual = await vi.importActual<
    typeof import("../src/tokenizers/openai.js")
  >("../src/tokenizers/openai.js");
  return {
    ...actual,
    openaiTokenizerProvider: {
      match: (
        input: Parameters<typeof actual.openaiTokenizerProvider.match>[0],
      ) => {
        if (input.providerId !== "openai") return undefined;
        return {
          estimate: async (resolved) => ({
            count: resolved.text.split(/\s+/).filter(Boolean).length,
            estimated: false,
            tokenizerId: "mock-openai",
          }),
        };
      },
    },
  } satisfies typeof actual;
});

vi.mock("../src/tokenizers/anthropic.js", () => ({
  anthropicTokenizerProvider: {
    match: () => undefined,
  },
}));

vi.mock("../src/tokenizers/fallback.js", () => ({
  fallbackTokenizer: {
    estimate: () => ({ count: 42, estimated: true, tokenizerId: undefined }),
  },
}));

describe("countTokens", () => {
  it("counts tokens via provider match", async () => {
    const result = await countTokens({
      providerId: "openai",
      modelId: "openai/gpt-4o",
      text: "hello world",
    });
    expect(result).toEqual({
      count: 2,
      estimated: false,
      tokenizerId: "mock-openai",
    });
  });

  it("falls back when no provider matches", async () => {
    const result = await countTokens({
      providerId: "unknown",
      modelId: "foo",
      text: "hello world",
    });
    expect(result).toEqual({
      count: 42,
      estimated: true,
      tokenizerId: undefined,
    });
  });
});
