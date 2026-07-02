import { TokenlensError } from "@tokenlens/core";
import { afterEach, describe, expect, it } from "vitest";

import { anthropic } from "../src/tokenizers/anthropic.js";
import { google } from "../src/tokenizers/google.js";
import { openai } from "../src/tokenizers/openai.js";

describe("provider tokenizers", () => {
  const originalAnthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const originalGoogleApiKey = process.env.GOOGLE_API_KEY;

  afterEach(() => {
    if (originalAnthropicApiKey === undefined) {
      delete process.env.ANTHROPIC_API_KEY;
    } else {
      process.env.ANTHROPIC_API_KEY = originalAnthropicApiKey;
    }

    if (originalGoogleApiKey === undefined) {
      delete process.env.GOOGLE_API_KEY;
    } else {
      process.env.GOOGLE_API_KEY = originalGoogleApiKey;
    }
  });

  it("uses the cl100k tokenizer for GPT-4 models", async () => {
    await expect(openai("gpt-4", "Hello world")).resolves.toBeGreaterThan(0);
  });

  it("rejects unsupported OpenAI tokenizer model IDs", async () => {
    await expect(openai("o3" as never, "Hello")).rejects.toMatchObject({
      code: TokenlensError.UnsupportedTokenizerModel.code,
      meta: {
        modelId: "o3",
        supportedModels: ["gpt-4o", "gpt-4o-mini", "gpt-5", "gpt-4"],
      },
    });
  });

  it("throws a stable error when the Anthropic API key is missing", async () => {
    delete process.env.ANTHROPIC_API_KEY;

    await expect(anthropic("claude-sonnet-4-5", "Hello")).rejects.toMatchObject(
      {
        code: TokenlensError.MissingEnvironmentVariable.code,
        meta: { envVar: "ANTHROPIC_API_KEY" },
      },
    );
  });

  it("throws a stable error when the Google API key is missing", async () => {
    delete process.env.GOOGLE_API_KEY;

    await expect(google("gemini-2.5-pro", "Hello")).rejects.toMatchObject({
      code: TokenlensError.MissingEnvironmentVariable.code,
      meta: { envVar: "GOOGLE_API_KEY" },
    });
  });
});
