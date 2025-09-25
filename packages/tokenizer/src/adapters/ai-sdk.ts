import type { TokenizerMessage } from "../types.js";
import type { ModelMessage } from "ai";

export function isAiSdkMessageArray(
  value: unknown,
): value is readonly ModelMessage[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as { role?: unknown }).role === "string" &&
        "content" in item,
    )
  );
}

export function fromAiSdkMessages(
  messages: readonly ModelMessage[],
): TokenizerMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: stringifyAiSdkMessage(message),
  }));
}

function stringifyAiSdkMessage(message: ModelMessage): string {
  const content = (message as { content?: unknown }).content;
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return safeStringify(content);

  const parts: string[] = [];
  for (const part of content) {
    const text = stringifyAiSdkPart(part);
    if (text) parts.push(text);
  }

  if (parts.length === 0) {
    return safeStringify(content);
  }

  return parts.join("\n");
}

function stringifyAiSdkPart(part: unknown): string | undefined {
  if (!part || typeof part !== "object") return undefined;

  const typed = part as { type?: string; [key: string]: unknown };
  const type = typeof typed.type === "string" ? typed.type : undefined;

  if (type === "text") {
    const text = (typed as { text?: unknown }).text;
    if (typeof text === "string") return text;
  } else if (type === "image") {
    const image = (typed as { image?: unknown }).image;
    if (image && typeof image === "object") {
      const url = (image as { url?: unknown }).url;
      if (typeof url === "string") return `[image:${url}]`;
      const base64 = (image as { base64?: unknown }).base64;
      if (typeof base64 === "string") return "[image:base64]";
    }
    return "[image]";
  } else if (type === "file") {
    const name = (typed as { name?: unknown }).name;
    if (typeof name === "string" && name.length > 0) {
      return `[file:${name}]`;
    }
    return "[file]";
  } else if (type === "tool-call") {
    const toolName = (typed as { toolName?: unknown }).toolName;
    const name = typeof toolName === "string" ? toolName : "tool";
    const payload =
      (typed as { args?: unknown }).args ??
      (typed as { input?: unknown }).input;
    return `${name}:${safeStringify(payload ?? typed)}`;
  } else if (type === "tool-result") {
    const result = (typed as { result?: unknown }).result;
    if (typeof result === "string") return result;
    return safeStringify(result ?? typed);
  } else if (type === "reasoning") {
    const reasoning = (typed as { reasoning?: unknown }).reasoning;
    if (typeof reasoning === "string") return reasoning;
    const thoughts = (typed as { thoughts?: unknown }).thoughts;
    if (typeof thoughts === "string") return thoughts;
  } else if (type === "data") {
    const data = (typed as { data?: unknown }).data;
    if (typeof data === "string") return data;
    return safeStringify(data ?? typed);
  } else {
    const text = (typed as { text?: unknown }).text;
    if (typeof text === "string") return text;
  }

  return safeStringify(part);
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
