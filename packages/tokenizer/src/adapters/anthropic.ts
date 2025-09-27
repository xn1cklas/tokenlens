import type { TokenizerMessage } from "../types.js";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages/messages";

export function isAnthropicMessageArray(
  value: unknown,
): value is readonly MessageParam[] {
  return (
    Array.isArray(value) &&
    value.every((item) =>
      Boolean(
        item &&
          typeof item === "object" &&
          typeof (item as { role?: unknown }).role === "string" &&
          "content" in item,
      ),
    )
  );
}

export function fromAnthropicMessages(
  messages: readonly MessageParam[],
): TokenizerMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: stringifyAnthropicMessage(message),
  }));
}

function stringifyAnthropicMessage(message: MessageParam): string {
  const segments: string[] = [];
  const { content } = message as { content?: unknown };

  if (typeof content === "string") {
    segments.push(content);
  } else if (Array.isArray(content)) {
    for (const block of content) {
      const text = stringifyContentBlock(block);
      if (text) segments.push(text);
    }
  }

  if (segments.length === 0) {
    return safeStringify(content ?? message);
  }

  return segments.join("\n");
}

function stringifyContentBlock(block: unknown): string | undefined {
  if (!block || typeof block !== "object") return undefined;

  const typed = block as { type?: string; [key: string]: unknown };
  const type = typeof typed.type === "string" ? typed.type : undefined;

  if (type === "text" || type === "thinking" || type === "redacted_thinking") {
    const text = (typed as { text?: unknown }).text;
    if (typeof text === "string") return text;
  } else if (type === "tool_use") {
    const toolName = (typed as { name?: unknown }).name;
    const name = typeof toolName === "string" ? toolName : "tool";
    const input = (typed as { input?: unknown }).input;
    return `${name}:${safeStringify(input)}`;
  } else if (type === "tool_result") {
    const text = (typed as { text?: unknown }).text;
    if (typeof text === "string") return text;
    const content = (typed as { content?: unknown }).content;
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      return content
        .map((item) => (typeof item === "string" ? item : safeStringify(item)))
        .filter(Boolean)
        .join("\n");
    }
    return safeStringify(content);
  } else if (type === "image") {
    const source = (typed as { source?: unknown }).source;
    if (source && typeof source === "object") {
      const mediaType = (source as { media_type?: unknown }).media_type;
      if (typeof mediaType === "string") return `[image:${mediaType}]`;
    }
    return "[image]";
  }

  const fallback = (typed as { text?: unknown }).text;
  if (typeof fallback === "string") return fallback;

  return safeStringify(block);
}

function safeStringify(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
