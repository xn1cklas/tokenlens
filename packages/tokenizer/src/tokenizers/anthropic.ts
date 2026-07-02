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
  const apiKey = (process.env as { ANTHROPIC_API_KEY?: string })
    .ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new TokenlensError.MissingEnvironmentVariable("ANTHROPIC_API_KEY");
  }

  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });

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
