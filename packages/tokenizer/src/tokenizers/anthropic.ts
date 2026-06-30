import Anthropic from "@anthropic-ai/sdk";
import { TokenlensError } from "@tokenlens/core";

const ANTHROPIC_MODELS = [
  "claude-sonnet-4-5",
  "claude-sonnet-4-0",
  "claude-3-7-sonnet-latest",
  "claude-opus-4-1",
  "claude-opus-4",
  "claude-3-5-haiku-latest",
] as const;

export type AnthropicModelName = (typeof ANTHROPIC_MODELS)[number];
export type AnthropicModelId =
  | AnthropicModelName
  | `anthropic/${AnthropicModelName}`;

export async function anthropic(modelId: AnthropicModelName, data: string) {
  if (!process.env["ANTHROPIC_API_KEY"]) {
    throw new TokenlensError.MissingEnvironmentVariable("ANTHROPIC_API_KEY");
  }

  const client = new Anthropic({ apiKey: process.env["ANTHROPIC_API_KEY"] });

  const result = await client.messages.countTokens({
    model: modelId,
    messages: [
      {
        role: "user",
        content: data,
      },
    ],
  });

  return result.input_tokens;
}
