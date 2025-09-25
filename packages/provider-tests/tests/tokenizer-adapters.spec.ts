import { describe, expect, it } from "vitest";
import {
  fromAiSdkMessages,
  fromAnthropicMessages,
  fromOpenAIChatMessages,
} from "../../tokenizer/dist/index.js";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { MessageParam as AnthropicMessageParam } from "@anthropic-ai/sdk/resources/messages/messages";
import type { ModelMessage } from "ai";

import { createTestClient } from "./test-catalog.js";

describe("Tokenizer message adapters", () => {
  it("supports OpenAI ChatCompletionMessageParam payloads", async () => {
    const client = createTestClient();
    const messages = [
      { role: "system", content: "Keep responses short." },
      {
        role: "user",
        content: [
          { type: "text", text: "Summarize token counting." },
          {
            type: "image_url",
            image_url: {
              url: "https://example.com/token-chart.png",
            },
          },
        ],
      },
      {
        role: "assistant",
        content: [
          {
            type: "text",
            text: "Token counting 101",
          },
        ],
        tool_calls: [
          {
            id: "tool-call-1",
            type: "function",
            function: {
              name: "fetch_stats",
              arguments: '{"topic":"tokens"}',
            },
          },
        ],
      },
    ] as ChatCompletionMessageParam[];

    const manual = await client.experimental_countTokens(
      "openai",
      "openai/gpt-5",
      fromOpenAIChatMessages(messages),
    );
    const automatic = await client.experimental_countTokens(
      "openai",
      "openai/gpt-5",
      messages,
    );

    expect(automatic.total).toBe(manual.total);
    expect(automatic.estimated).toBe(manual.estimated);
    expect(automatic.total).toBeGreaterThan(0);
  });

  it("supports Anthropic message payloads", async () => {
    const client = createTestClient();
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Provide token usage guidance.",
          },
        ],
      },
      {
        role: "assistant",
        content: [
          {
            type: "tool_use",
            name: "search_docs",
            input: { topic: "token usage" },
            tool_use_id: "tool-1",
          },
          {
            type: "text",
            text: "I found relevant docs.",
          },
        ],
      },
    ] as AnthropicMessageParam[];

    const manual = await client.experimental_countTokens(
      "anthropic",
      "anthropic/claude-3-5-sonnet-20241022",
      fromAnthropicMessages(messages),
    );
    const automatic = await client.experimental_countTokens(
      "anthropic",
      "anthropic/claude-3-5-sonnet-20241022",
      messages,
    );

    expect(automatic.total).toBe(manual.total);
    expect(automatic.estimated).toBe(manual.estimated);
    expect(automatic.total).toBeGreaterThan(0);
  });

  it("supports AI SDK model message payloads", async () => {
    const client = createTestClient();
    const messages: ModelMessage[] = [
      {
        role: "system",
        content: "You are a token usage assistant.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Explain token estimations." },
          {
            type: "image",
            image: new URL("https://example.com/diagram.png"),
          },
        ],
      },
      {
        role: "assistant",
        content: [
          {
            type: "tool-call",
            toolCallId: "call-1",
            toolName: "fetch_context",
            input: { provider: "openai" },
          },
          { type: "text", text: "Context retrieved." },
        ],
      },
    ];

    const manual = await client.experimental_countTokens(
      "openai",
      "openai/gpt-5",
      fromAiSdkMessages(messages),
    );
    const automatic = await client.experimental_countTokens(
      "openai",
      "openai/gpt-5",
      messages,
    );

    expect(automatic.total).toBe(manual.total);
    expect(automatic.estimated).toBe(manual.estimated);
    expect(automatic.total).toBeGreaterThan(0);
  });
});
