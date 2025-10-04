import { describe, expect, it, vi, beforeEach } from "vitest";
import { countTokens, type Provider } from "../src/index.js";

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

  describe("provider routing", () => {
    it("routes to Google tokenizer", async () => {
      const result = await countTokens(
        "gemini-2.5-pro",
        "google",
        "Hello world",
      );
      expect(result).toBe(15);
    });

    it("routes to Anthropic tokenizer", async () => {
      const result = await countTokens(
        "claude-sonnet-4-5",
        "anthropic",
        "Hello world",
      );
      expect(result).toBe(25);
    });

    it("routes to OpenAI tokenizer", async () => {
      const result = await countTokens("gpt-4o", "openai", "Hello world");
      expect(result).toBe(10);
    });

    it("falls back to OpenAI GPT-5 for unknown providers", async () => {
      // Cast to bypass TypeScript checking for testing purposes
      const result = await countTokens(
        "unknown-model",
        "unknown" as Provider,
        "Hello world",
      );
      expect(result).toBe(10);
    });
  });

  describe("model ID handling", () => {
    it("handles model IDs with provider prefix", async () => {
      const result = await countTokens(
        "google/gemini-2.5-pro",
        "google",
        "Test",
      );
      expect(result).toBe(15);
    });

    it("handles model IDs without provider prefix", async () => {
      const result = await countTokens("gemini-2.5-pro", "google", "Test");
      expect(result).toBe(15);
    });

    it("handles OpenAI model IDs with prefix", async () => {
      const result = await countTokens("openai/gpt-4o", "openai", "Test");
      expect(result).toBe(10);
    });

    it("handles Anthropic model IDs with prefix", async () => {
      const result = await countTokens(
        "anthropic/claude-sonnet-4-5",
        "anthropic",
        "Test",
      );
      expect(result).toBe(25);
    });
  });

  describe("input validation", () => {
    it("accepts all valid provider types", async () => {
      const testCases: Array<{
        provider: Provider;
        modelId: string;
        expected: number;
      }> = [
        { provider: "openai", modelId: "gpt-4o", expected: 10 },
        { provider: "anthropic", modelId: "claude-sonnet-4-5", expected: 25 },
        { provider: "google", modelId: "gemini-2.5-pro", expected: 15 },
      ];

      for (const { provider, modelId, expected } of testCases) {
        const result = await countTokens(modelId as any, provider, "Test text");
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
        const result = await countTokens("gpt-4o", "openai", text);
        expect(typeof result).toBe("number");
      }
    });
  });

  describe("return types", () => {
    it("returns number for all implemented providers", async () => {
      const result = await countTokens("gpt-4o", "openai", "Hello");
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(0);
    });

    it("always returns a number (including fallback)", async () => {
      const openai = await countTokens("gpt-4o", "openai", "Hello");
      const anthropic = await countTokens(
        "claude-sonnet-4-5",
        "anthropic",
        "Hello",
      );
      const google = await countTokens("gemini-2.5-pro", "google", "Hello");

      expect(typeof openai).toBe("number");
      expect(typeof anthropic).toBe("number");
      expect(typeof google).toBe("number");
    });
  });

  describe("edge cases", () => {
    it("handles empty string", async () => {
      const result = await countTokens("gpt-4o", "openai", "");
      expect(result).toBeDefined();
    });

    it("handles special characters", async () => {
      const result = await countTokens("gpt-4o", "openai", "Hello! @#$%^&*()");
      expect(result).toBeDefined();
    });

    it("handles unicode characters", async () => {
      const result = await countTokens("gpt-4o", "openai", "Hello 世界 🌍");
      expect(result).toBeDefined();
    });

    it("handles multiline text", async () => {
      const text = `Line 1
Line 2
Line 3`;
      const result = await countTokens("gpt-4o", "openai", text);
      expect(result).toBeDefined();
    });

    it("handles very long text", async () => {
      const longText = "Lorem ipsum ".repeat(1000);
      const result = await countTokens("gpt-4o", "openai", longText);
      expect(result).toBeDefined();
      expect(typeof result).toBe("number");
    });
  });

  describe("type safety", () => {
    it("accepts provider-specific model IDs", async () => {
      // These should all be type-safe
      await countTokens("gpt-4o", "openai", "test");
      await countTokens("openai/gpt-5", "openai", "test");
      await countTokens("gemini-2.5-pro", "google", "test");
      await countTokens("google/gemini-2.5-flash", "google", "test");
      await countTokens("claude-sonnet-4-5", "anthropic", "test");
      await countTokens("anthropic/claude-opus-4", "anthropic", "test");
    });
  });
});
