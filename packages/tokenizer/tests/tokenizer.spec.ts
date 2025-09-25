import { describe, expect, it, vi } from "vitest";
import {
  estimateTokens,
  fromOpenAIChatMessages,
  fromAnthropicMessages,
  fromAiSdkMessages,
} from "../src/index.js";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { MessageParam as AnthropicMessageParam } from "@anthropic-ai/sdk/resources/messages/messages";
import type { ModelMessage } from "ai";

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
          estimate: async (resolved) => {
            const total = resolved.text.split(/\s+/).filter(Boolean).length;
            return {
              total,
              estimated: false,
              tokenizerId: resolved.tokenizerId ?? "mock-openai",
            };
          },
        };
      },
    },
  } satisfies typeof actual;
});

vi.mock("../src/tokenizers/anthropic.js", () => ({
  anthropicTokenizerProvider: {
    match: (input: { providerId: string }) => {
      if (input.providerId !== "anthropic") return undefined;
      return {
        estimate: async (resolved: { text: string; tokenizerId?: string }) => {
          const total = resolved.text.split(/\s+/).filter(Boolean).length;
          return {
            total,
            estimated: false,
            tokenizerId: resolved.tokenizerId ?? "mock-anthropic",
          } as const;
        },
      };
    },
  },
}));

vi.mock("../src/tokenizers/fallback.js", () => ({
  fallbackTokenizer: {
    estimate: () => ({
      total: 42,
      estimated: true,
    }),
  },
}));

describe("estimateTokens", () => {
  it("supports positional overload with text", async () => {
    const result = await estimateTokens(
      "openai",
      "openai/gpt-4o",
      "hello world",
    );
    expect(result).toMatchObject({
      total: 2,
      count: 2,
      estimated: false,
      tokenizerId: "mock-openai",
    });
  });

  it("supports positional overload with messages", async () => {
    const result = await estimateTokens("openai", "openai/gpt-4o", [
      { role: "user", content: "hello" },
      { role: "assistant", content: "world" },
    ]);
    expect(result).toMatchObject({
      total: 4,
      count: 4,
      estimated: false,
      tokenizerId: "mock-openai",
    });
  });

  it("prefers explicit tokenizerId option", async () => {
    const result = await estimateTokens("openai", "openai/gpt-4o", "hello", {
      tokenizerId: "o200k_base",
    });
    expect(result.tokenizerId).toBe("o200k_base");
  });

  it("infers tokenizer from model extras when available", async () => {
    const result = await estimateTokens({
      providerId: "openai",
      modelId: "openai/gpt-4o",
      text: "hello world",
      model: {
        id: "openai/gpt-4o",
        name: "GPT-4o",
        models: {} as never,
        extras: {
          architecture: {
            tokenizer: "o200k_base",
          },
        },
      } as never,
    });
    expect(result.tokenizerId).toBe("o200k_base");
  });

  it("falls back when no provider matches", async () => {
    const result = await estimateTokens({
      providerId: "unknown",
      modelId: "foo",
      text: "hello world",
    });
    expect(result).toMatchObject({
      total: 42,
      count: 42,
      estimated: true,
    });
  });

  it("converts OpenAI chat message payloads", async () => {
    const openaiMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: "You are helpful." },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Hello world",
          },
        ],
      },
    ];

    const manual = await estimateTokens({
      providerId: "openai",
      modelId: "openai/gpt-4o",
      messages: fromOpenAIChatMessages(openaiMessages),
    });

    const automatic = await estimateTokens(
      "openai",
      "openai/gpt-4o",
      openaiMessages,
    );

    expect(automatic.total).toBe(manual.total);
    expect(automatic.total).toBeGreaterThan(0);
  });

  it("converts Anthropic message payloads", async () => {
    const anthropicMessages: AnthropicMessageParam[] = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "How many tokens are used?",
          },
        ],
      },
      {
        role: "assistant",
        content: [
          {
            type: "text",
            text: "Not too many!",
          },
        ],
      },
    ];

    const manual = await estimateTokens({
      providerId: "anthropic",
      modelId: "anthropic/claude-3-5-sonnet",
      messages: fromAnthropicMessages(anthropicMessages),
    });

    const automatic = await estimateTokens({
      providerId: "anthropic",
      modelId: "anthropic/claude-3-5-sonnet",
      messages: anthropicMessages,
    });

    expect(automatic.total).toBe(manual.total);
    expect(automatic.total).toBeGreaterThan(0);
  });

  it("converts AI SDK model messages", async () => {
    const aiSdkMessages: ModelMessage[] = [
      {
        role: "system",
        content: "Stay concise.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Search for tokenization guidance." },
          {
            type: "image",
            image: { url: "https://example.com/token.png" },
          },
        ],
      },
      {
        role: "assistant",
        content: [
          {
            type: "tool-call",
            toolCallId: "tool-1",
            toolName: "search",
            args: { query: "token usage" },
          },
          { type: "text", text: "Tool executed." },
        ],
      },
    ];

    const manual = await estimateTokens({
      providerId: "openai",
      modelId: "openai/gpt-4o",
      messages: fromAiSdkMessages(aiSdkMessages),
    });

    const automatic = await estimateTokens({
      providerId: "openai",
      modelId: "openai/gpt-4o",
      messages: aiSdkMessages,
    });

    expect(automatic.total).toBe(manual.total);
    expect(automatic.total).toBeGreaterThan(0);
  });
});
