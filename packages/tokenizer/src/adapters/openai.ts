import type { TokenizerMessage } from "../types.js";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export function isOpenAIChatMessageArray(
  value: unknown,
): value is readonly ChatCompletionMessageParam[] {
  return Array.isArray(value) && value.every(isOpenAIChatMessage);
}

/**
 * Normalizes OpenAI chat completion messages into Tokenlens message format.
 */
export function fromOpenAIChatMessages(
  messages: readonly ChatCompletionMessageParam[],
): TokenizerMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: stringifyOpenAIMessage(message),
  }));
}

function stringifyOpenAIMessage(message: ChatCompletionMessageParam): string {
  const segments: string[] = [];
  const { content } = message as { content?: unknown };

  if (typeof content === "string") {
    segments.push(content);
  } else if (Array.isArray(content)) {
    for (const part of content) {
      const text = stringifyContentPart(part);
      if (text) segments.push(text);
    }
  } else if (content && typeof content === "object") {
    const textField = (content as { text?: unknown }).text;
    if (typeof textField === "string") {
      segments.push(textField);
    } else {
      segments.push(safeStringify(content));
    }
  }

  const toolCalls = (message as { tool_calls?: unknown }).tool_calls;
  if (Array.isArray(toolCalls) && toolCalls.length > 0) {
    segments.push(`tool_calls:${safeStringify(toolCalls)}`);
  }

  const audio = (message as { audio?: { input_text?: unknown } }).audio;
  if (audio && typeof audio === "object") {
    const inputText = (audio as { input_text?: unknown }).input_text;
    if (typeof inputText === "string") {
      segments.push(inputText);
    } else if (inputText != null) {
      segments.push(safeStringify(inputText));
    }
  }

  const name = (message as { name?: unknown }).name;
  if (typeof name === "string" && name.length > 0) {
    segments.push(`name:${name}`);
  }

  if (segments.length === 0) {
    return safeStringify(content ?? message);
  }

  return segments.join("\n");
}

function stringifyContentPart(part: unknown): string | undefined {
  if (typeof part === "string") return part;
  if (!part || typeof part !== "object") return undefined;

  const typed = part as { type?: string; [key: string]: unknown };
  const type = typeof typed.type === "string" ? typed.type : undefined;

  if (type === "text") {
    const text = (typed as { text?: unknown }).text;
    if (typeof text === "string") return text;
    if (text && typeof text === "object") {
      const value = (text as { value?: unknown }).value;
      if (typeof value === "string") return value;
    }
  } else if (type === "image_url") {
    const image = (typed as { image_url?: unknown }).image_url;
    if (typeof image === "string") return `[image:${image}]`;
    if (image && typeof image === "object") {
      const url = (image as { url?: unknown }).url;
      if (typeof url === "string") return `[image:${url}]`;
    }
    return "[image]";
  } else if (type === "input_audio") {
    const audio = (typed as { audio?: unknown }).audio;
    if (audio && typeof audio === "object") {
      const inputText = (audio as { input_text?: unknown }).input_text;
      if (typeof inputText === "string") return inputText;
    }
    return "[audio]";
  } else if (type === "refusal") {
    const refusal = (typed as { refusal?: unknown }).refusal;
    if (typeof refusal === "string") return refusal;
  } else {
    const text = (typed as { text?: unknown }).text;
    if (typeof text === "string") return text;
  }

  return safeStringify(part);
}

const OPENAI_PART_TYPES = new Set([
  "text",
  "image_url",
  "input_audio",
  "input_text",
  "refusal",
  "tool_result",
  "tool_use",
]);

function isOpenAIChatMessage(
  value: unknown,
): value is ChatCompletionMessageParam {
  if (!value || typeof value !== "object") return false;
  const role = (value as { role?: unknown }).role;
  if (typeof role !== "string") return false;
  const content = (value as { content?: unknown }).content;
  if (typeof content === "string") return true;
  if (!Array.isArray(content)) return false;
  return content.every((part) => {
    if (!part || typeof part !== "object") return false;
    const type = (part as { type?: unknown }).type;
    return typeof type === "string" && OPENAI_PART_TYPES.has(type);
  });
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
