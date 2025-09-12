import { describe, expect, it } from "vitest";

import { toModelId } from "../src/id.js";

describe("toModelId (isolated)", () => {
  it("normalizes gateway-style ids and preserves canonical forms", () => {
    const cases: Array<{ in: string | undefined; out: string | undefined }> = [
      // undefined and empty inputs
      { in: undefined, out: undefined },
      { in: "", out: undefined },

      // openai
      { in: "openai/gpt-4o", out: "openai:gpt-4o" },
      { in: "openai/gpt-4o-mini", out: "openai:gpt-4o-mini" },
      { in: "openai:o4-mini", out: "openai:o4-mini" }, // already canonical

      // anthropic (Vercel-form dot versions normalized to hyphen)
      {
        in: "anthropic/claude-3.5-sonnet-20240620",
        out: "anthropic:claude-3-5-sonnet-20240620",
      },
      {
        in: "anthropic/claude-3.5-haiku-20241022",
        out: "anthropic:claude-3-5-haiku-20241022",
      },
      {
        in: "anthropic:claude-3-5-haiku-20241022",
        out: "anthropic:claude-3-5-haiku-20241022",
      },

      // google (Gemini)
      { in: "google/gemini-1.5-pro", out: "google:gemini-1.5-pro" }, // dots preserved for google
      { in: "google/gemini-1.5-flash", out: "google:gemini-1.5-flash" },

      // mistral
      {
        in: "mistral/mistral-large-latest",
        out: "mistral:mistral-large-latest",
      },

      // cohere
      { in: "cohere/command-r-plus", out: "cohere:command-r-plus" },

      // xAI
      { in: "xai/grok-3-mini", out: "xai:grok-3-mini" },

      // DeepSeek
      { in: "deepseek/deepseek-chat", out: "deepseek:deepseek-chat" },

      // Meta (Llama)
      { in: "meta/llama-3.1-70b-instruct", out: "meta:llama-3.1-70b-instruct" },

      // Perplexity hosted
      {
        in: "perplexity/llama-3.1-sonar-large-128k-online",
        out: "perplexity:llama-3.1-sonar-large-128k-online",
      },

      // Groq hosted
      {
        in: "groq/llama-3.1-70b-versatile",
        out: "groq:llama-3.1-70b-versatile",
      },

      // Fireworks hosted
      {
        in: "fireworks/mixtral-8x7b-instruct",
        out: "fireworks:mixtral-8x7b-instruct",
      },

      // Gateway prefixes with nested vendor (e.g., OpenRouter)
      {
        in: "openrouter/anthropic/claude-3.5-sonnet",
        out: "openrouter:anthropic/claude-3.5-sonnet", // only first slash becomes ':'
      },

      // Vercel AI Gateway-style provider prefix
      { in: "vercel/something", out: "vercel:something" },

      // Edge cases
      { in: "/leading-slash", out: "/leading-slash" }, // slash at index 0 -> unchanged
      { in: "provider-only", out: "provider-only" }, // no slash -> unchanged

      // Multi-segment (e.g., huggingface style paths) retain remaining slashes
      {
        in: "huggingface/NousResearch/Meta-Llama-3-8B-Instruct",
        out: "huggingface:NousResearch/Meta-Llama-3-8B-Instruct",
      },
    ];

    for (const c of cases) {
      expect(toModelId(c.in)).toBe(c.out);
    }
  });
});
