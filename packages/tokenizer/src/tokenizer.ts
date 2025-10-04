import {
  anthropic,
  type AnthropicModelId,
  type AnthropicModelName,
} from "./tokenizers/anthropic.js";
import {
  google,
  type GoogleModelId,
  type GoogleModelName,
} from "./tokenizers/google.js";
import {
  openai,
  type OpenAIModelId,
  type OpenAIModelName,
} from "./tokenizers/openai.js";

/**
 * Type-safe union of all supported model IDs across all providers.
 * Includes both prefixed (e.g., "openai/gpt-4o") and unprefixed formats.
 * Also allows arbitrary strings for fallback behavior.
 */
export type ModelId = GoogleModelId | OpenAIModelId | AnthropicModelId | string;

/**
 * Count tokens in a text string for a given model.
 *
 * The function automatically routes to the correct tokenizer based on the model ID:
 * - Models starting with "gpt-" or "openai/" → OpenAI tokenizer
 * - Models starting with "claude-" or "anthropic/" → Anthropic tokenizer
 * - Models starting with "gemini-" or "google/" → Google tokenizer
 *
 * @param modelId - Model identifier (e.g., "gpt-4o", "claude-sonnet-4-5", "gemini-2.5-pro")
 *                  Can be prefixed with provider (e.g., "openai/gpt-4o")
 * @param data - The text to count tokens for
 * @returns Promise resolving to the token count, or undefined if counting fails
 *
 * @example
 * ```ts
 * await countTokens("gpt-4o", "Hello world");
 * await countTokens("claude-sonnet-4-5", "Hello world");
 * await countTokens("google/gemini-2.5-pro", "Hello world");
 * ```
 */
export async function countTokens(
  modelId: ModelId,
  data: string,
): Promise<number | undefined> {
  // Route to the correct tokenizer and strip provider prefix
  if (modelId.startsWith("openai/")) {
    const cleanId = modelId.replace("openai/", "") as OpenAIModelName;
    return await openai(cleanId, data);
  }

  if (modelId.startsWith("anthropic/")) {
    const cleanId = modelId.replace("anthropic/", "") as AnthropicModelName;
    return await anthropic(cleanId, data);
  }

  if (modelId.startsWith("google/")) {
    const cleanId = modelId.replace("google/", "") as GoogleModelName;
    return await google(cleanId, data);
  }

  // Handle unprefixed model IDs
  if (modelId.startsWith("gpt-")) {
    return await openai(modelId as OpenAIModelName, data);
  }

  if (modelId.startsWith("claude-")) {
    return await anthropic(modelId as AnthropicModelName, data);
  }

  if (modelId.startsWith("gemini-")) {
    return await google(modelId as GoogleModelName, data);
  }

  // Fallback to OpenAI GPT-5 for unknown models
  console.warn(
    `Unknown model ID: "${modelId}". Falling back to OpenAI GPT-5 tokenizer (o200k_base encoding).`,
  );
  return await openai("gpt-5", data);
}
