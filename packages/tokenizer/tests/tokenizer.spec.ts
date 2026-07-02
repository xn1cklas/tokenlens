import { beforeEach, describe, expect, it, vi } from "vitest";
import { countTokens } from "../src/index.js";
import { openai } from "../src/tokenizers/openai.js";

// Mock the provider modules
vi.mock("../src/tokenizers/google.js", () => ({
  google: vi.fn().mockResolvedValue(15),
}));

vi.mock("../src/tokenizers/anthropic.js", () => ({
  anthropic: vi.fn().mockResolvedValue(25),
}));

vi.mock("../src/tokenizers/openai.js", () => ({
  openai: vi.fn().mockResolvedValue(10),
}));

describe("countTokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("provider auto-detection", () => {
    it("auto-detects Google provider from model name", async () => {
      const result = await countTokens("gemini-2.5-pro", "Hello world");
      expect(result).toBe(15);
    });

    it("auto-detects Anthropic provider from model name", async () => {
      const result = await countTokens("claude-sonnet-4-5", "Hello world");
      expect(result).toBe(25);
    });

    it("auto-detects OpenAI provider from model name", async () => {
      const result = await countTokens("gpt-4o", "Hello world");
      expect(result).toBe(10);
    });

    it("falls back to OpenAI GPT-5 for unknown model IDs", async () => {
      // Users can pass any string, and it will fall back to GPT-5 tokenizer
      const result = await countTokens("unknown-model", "Hello world");
      expect(result).toBe(10);
    });
  });

  describe("model ID handling", () => {
    it("auto-detects provider from prefixed model ID (google)", async () => {
      const result = await countTokens("google/gemini-2.5-pro", "Test");
      expect(result).toBe(15);
    });

    it("handles model IDs without provider prefix", async () => {
      const result = await countTokens("gemini-2.5-pro", "Test");
      expect(result).toBe(15);
    });

    it("auto-detects provider from prefixed model ID (openai)", async () => {
      const result = await countTokens("openai/gpt-4o", "Test");
      expect(result).toBe(10);
    });

    it("falls back to GPT-5 for unsupported OpenAI-prefixed model IDs", async () => {
      const openaiMock = vi.mocked(openai);
      const unsupported = Object.assign(new Error("Unsupported model"), {
        code: "UNSUPPORTED_TOKENIZER_MODEL",
      });
      openaiMock.mockRejectedValueOnce(unsupported);

      const result = await countTokens("openai/o3", "Test");

      expect(result).toBe(10);
      expect(openaiMock).toHaveBeenNthCalledWith(1, "o3", "Test");
      expect(openaiMock).toHaveBeenNthCalledWith(2, "gpt-5", "Test");
    });

    it("auto-detects provider from prefixed model ID (anthropic)", async () => {
      const result = await countTokens("anthropic/claude-sonnet-4-5", "Test");
      expect(result).toBe(25);
    });
  });

  describe("input validation", () => {
    it("accepts all model types", async () => {
      const testCases: Array<{
        modelId: string;
        expected: number;
      }> = [
        { modelId: "gpt-4o", expected: 10 },
        { modelId: "claude-sonnet-4-5", expected: 25 },
        { modelId: "gemini-2.5-pro", expected: 15 },
      ];

      for (const { modelId, expected } of testCases) {
        const result = await countTokens(modelId, "Test text");
        expect(result).toBe(expected);
      }
    });

    it("accepts different text lengths", async () => {
      const texts = [
        "",
        "Single word",
        "Multiple words in a sentence",
        "A much longer text with many words that spans multiple lines and includes various punctuation marks.",
      ];

      for (const text of texts) {
        const result = await countTokens("gpt-4o", text);
        expect(typeof result).toBe("number");
      }
    });
  });

  describe("return types", () => {
    it("returns number for all implemented providers", async () => {
      const result = await countTokens("gpt-4o", "Hello");
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(0);
    });

    it("always returns a number (including fallback)", async () => {
      const openai = await countTokens("gpt-4o", "Hello");
      const anthropic = await countTokens("claude-sonnet-4-5", "Hello");
      const google = await countTokens("gemini-2.5-pro", "Hello");

      expect(typeof openai).toBe("number");
      expect(typeof anthropic).toBe("number");
      expect(typeof google).toBe("number");
    });
  });

  describe("edge cases", () => {
    it("handles empty string", async () => {
      const result = await countTokens("gpt-4o", "");
      expect(result).toBeDefined();
    });

    it("handles special characters", async () => {
      const result = await countTokens("gpt-4o", "Hello! @#$%^&*()");
      expect(result).toBeDefined();
    });

    it("handles unicode characters", async () => {
      const result = await countTokens("gpt-4o", "Hello 世界 🌍");
      expect(result).toBeDefined();
    });

    it("handles multiline text", async () => {
      const text = `Line 1
Line 2
Line 3`;
      const result = await countTokens("gpt-4o", text);
      expect(result).toBeDefined();
    });

    it("handles very long text", async () => {
      const longText = "Lorem ipsum ".repeat(1000);
      const result = await countTokens("gpt-4o", longText);
      expect(result).toBeDefined();
      expect(typeof result).toBe("number");
    });
  });

  describe("type safety", () => {
    it("accepts all model ID formats", async () => {
      // These should all be type-safe and auto-detect the provider
      await countTokens("gpt-4o", "test");
      await countTokens("openai/gpt-5", "test");
      await countTokens("gemini-2.5-pro", "test");
      await countTokens("google/gemini-2.5-flash", "test");
      await countTokens("claude-sonnet-4-5", "test");
      await countTokens("anthropic/claude-opus-4", "test");
    });
  });
});
