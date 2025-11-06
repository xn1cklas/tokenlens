import Anthropic from "@anthropic-ai/sdk";
import { getImageDimensions } from "../utils/image.js";
import { calculateAnthropicImageTokens } from "./anthropic-image.js";

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

export async function anthropic(
  modelId: AnthropicModelName,
  data: string | ArrayBuffer | Uint8Array,
) {
  // Handle text inputs first (most common case)
  if (typeof data === "string") {
    if (!process.env["ANTHROPIC_API_KEY"]) {
      throw new Error("ANTHROPIC_API_KEY is not set");
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

  // Handle image inputs (no API key needed for estimation)
  const dimensions = getImageDimensions(data);
  if (dimensions) {
    return calculateAnthropicImageTokens(dimensions.width, dimensions.height);
  }

  // If not a valid image, throw error
  throw new Error(
    "Failed to process ArrayBuffer/Uint8Array: not a recognized image format",
  );
}
