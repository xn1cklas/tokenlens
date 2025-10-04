import { anthropic, type AnthropicModelId } from "./tokenizers/anthropic.js";
import { google, type GoogleModelId } from "./tokenizers/google.js";
import { openai, type OpenAIModelId } from "./tokenizers/openai.js";

export type Provider = "openai" | "anthropic" | "google";

// Union of all provider-specific model IDs
export type ModelId = GoogleModelId | OpenAIModelId | AnthropicModelId | string;

// Type-safe provider to model mapping
export type ProviderModelMap = {
  google: GoogleModelId;
  openai: OpenAIModelId;
  anthropic: AnthropicModelId;
};

// Overloaded function signatures for type safety
export async function countTokens(
  modelId: GoogleModelId,
  provider: "google",
  data: string,
): Promise<number | undefined>;
export async function countTokens(
  modelId: OpenAIModelId,
  provider: "openai",
  data: string,
): Promise<number | undefined>;
export async function countTokens(
  modelId: AnthropicModelId,
  provider: "anthropic",
  data: string,
): Promise<number | undefined>;
export async function countTokens(
  modelId: string,
  provider: Provider,
  data: string,
): Promise<number | undefined>;

// Implementation
export async function countTokens(
  modelId: string,
  provider: Provider,
  data: string,
): Promise<number | undefined> {
  switch (provider) {
    case "openai": {
      return await openai(modelId as OpenAIModelId, data);
    }
    case "anthropic": {
      return await anthropic(modelId as AnthropicModelId, data);
    }
    case "google": {
      return await google(modelId as GoogleModelId, data);
    }
    default: {
      console.warn(
        `Unknown provider for model ${modelId}, using OpenAI gpt-5 with local Tiktoken implementation`,
      );
      return await openai("gpt-5" as OpenAIModelId, data);
    }
  }
}
