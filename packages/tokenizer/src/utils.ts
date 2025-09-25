import type { TokenizerInput, TokenizerMessage } from "./types.js";
import {
  fromAiSdkMessages,
  fromAnthropicMessages,
  fromOpenAIChatMessages,
  isAiSdkMessageArray,
  isAnthropicMessageArray,
  isOpenAIChatMessageArray,
} from "./adapters/index.js";

export function coerceContent(input: TokenizerInput): {
  text: string;
  messages?: readonly TokenizerMessage[];
} {
  const payload = resolvePayload(input);
  const messages = resolveMessages(input, payload);
  if (messages) {
    return {
      text: messages.map(formatMessage).join("\n"),
      messages,
    };
  }

  const text = resolveText(input, payload);
  return { text };
}

function resolvePayload(input: TokenizerInput): unknown {
  if ("content" in input && input.content !== undefined) {
    return input.content;
  }
  if ("input" in input && input.input !== undefined) {
    return input.input;
  }
  return undefined;
}

function resolveMessages(
  input: TokenizerInput,
  payload: unknown,
): readonly TokenizerMessage[] | undefined {
  const raw = Array.isArray(input.messages)
    ? (input.messages as readonly unknown[])
    : Array.isArray(payload)
      ? (payload as readonly unknown[])
      : undefined;

  if (!raw) return undefined;

  return normalizeMessages(raw, input.providerId);
}

function resolveText(input: TokenizerInput, payload: unknown): string {
  if (typeof input.text === "string") return input.text;
  if (typeof payload === "string") return payload;
  if (Array.isArray(payload)) {
    const messages = normalizeMessages(payload, input.providerId);
    return messages.map(formatMessage).join("\n");
  }
  return "";
}

function formatMessage(message: TokenizerMessage): string {
  const role = message.role ? `[${message.role}] ` : "";
  return `${role}${message.content ?? ""}`;
}

function normalizeMessages(
  messages: readonly unknown[],
  providerId: string,
): TokenizerMessage[] {
  if (areTokenizerMessages(messages)) {
    return messages as TokenizerMessage[];
  }

  if (providerId === "openai") {
    if (isOpenAIChatMessageArray(messages)) {
      return fromOpenAIChatMessages(messages);
    }
    if (isAiSdkMessageArray(messages)) {
      return fromAiSdkMessages(messages);
    }
  }

  if (providerId === "anthropic") {
    if (isAnthropicMessageArray(messages)) {
      return fromAnthropicMessages(messages);
    }
    if (isAiSdkMessageArray(messages)) {
      return fromAiSdkMessages(messages);
    }
  }

  if (isAiSdkMessageArray(messages)) {
    return fromAiSdkMessages(messages);
  }
  if (isOpenAIChatMessageArray(messages)) {
    return fromOpenAIChatMessages(messages);
  }
  if (isAnthropicMessageArray(messages)) {
    return fromAnthropicMessages(messages);
  }

  return messages.map(coerceUnknownMessage);
}

function areTokenizerMessages(
  messages: readonly unknown[],
): messages is readonly TokenizerMessage[] {
  return messages.every((item) =>
    Boolean(
      item &&
        typeof item === "object" &&
        typeof (item as { content?: unknown }).content === "string",
    ),
  );
}

function coerceUnknownMessage(value: unknown): TokenizerMessage {
  if (value && typeof value === "object") {
    const role =
      typeof (value as { role?: unknown }).role === "string"
        ? (value as { role: string }).role
        : undefined;
    const content = (value as { content?: unknown }).content;
    if (typeof content === "string") {
      return { role, content };
    }
    if (Array.isArray(content)) {
      const combined = content
        .map((item) => (typeof item === "string" ? item : safeStringify(item)))
        .filter(Boolean)
        .join("\n");
      return { role, content: combined };
    }
    if (content !== undefined) {
      return { role, content: safeStringify(content) };
    }
    return {
      role,
      content: safeStringify({ ...value, content: undefined }),
    };
  }

  return { content: safeStringify(value) };
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
