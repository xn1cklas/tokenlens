import { TokenlensError } from "@tokenlens/core";
import { describe, expect, it, vi } from "vitest";

const free = vi.fn();

vi.mock("@dqbd/tiktoken", () => ({
  get_encoding: vi.fn(() => ({
    encode: vi.fn(() => {
      throw new Error("encode failed");
    }),
    free,
  })),
}));

describe("OpenAI tokenizer failures", () => {
  it("frees encoders and wraps encoding failures", async () => {
    const { openai } = await import("../src/tokenizers/openai.js");

    await expect(openai("gpt-5", "Hello")).rejects.toMatchObject({
      code: TokenlensError.TokenizerEncodingFailed.code,
      cause: expect.any(Error),
      meta: {
        modelId: "gpt-5",
        encodingType: "o200k_base",
        errorMessage: "encode failed",
      },
    });
    expect(free).toHaveBeenCalledTimes(1);
  });
});
