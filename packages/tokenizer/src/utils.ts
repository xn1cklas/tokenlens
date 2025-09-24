import type { TokenizerInput, TokenizerMessage } from "./types.js";

export function resolveText(input: TokenizerInput): string {
  if (typeof input.text === "string") return input.text;
  if (Array.isArray(input.messages)) {
    return input.messages.map((m) => formatMessage(m)).join("\n");
  }
  return "";
}

function formatMessage(message: TokenizerMessage): string {
  const role = message.role ? `[${message.role}] ` : "";
  return `${role}${message.content ?? ""}`;
}
