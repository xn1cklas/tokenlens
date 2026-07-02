import { TokenlensError } from "@tokenlens/core";
import type {
  AnthropicModelId,
  AnthropicModelName,
} from "./tokenizers/anthropic.js";
import type { GoogleModelId, GoogleModelName } from "./tokenizers/google.js";
import type { OpenAIModelId, OpenAIModelName } from "./tokenizers/openai.js";

/**
 * Type-safe union of all supported model IDs across all providers.
 * Includes both prefixed (e.g., "openai/gpt-4o") and unprefixed formats.
 * Also allows arbitrary strings for fallback behavior.
 */
export type ModelId = GoogleModelId | OpenAIModelId | AnthropicModelId | string;

function isUnsupportedTokenizerModel(error: unknown): boolean {
  const code =
    error && typeof error === "object"
      ? (error as { code?: unknown }).code
      : undefined;
  return code === TokenlensError.UnsupportedTokenizerModel.code;
}

async function countOpenAiTokens(
  modelId: OpenAIModelName,
  data: string,
): Promise<number | undefined> {
  const { openai } = await import("./tokenizers/openai.js");

  try {
    return await openai(modelId, data);
  } catch (error) {
    if (isUnsupportedTokenizerModel(error)) {
      return await openai("gpt-5", data);
    }
    throw error;
  }
}

type TokenizerProvider = {
  providerPrefix: string;
  modelPrefixes: readonly string[];
  count: (modelId: string, data: string) => Promise<number | undefined>;
};

const tokenizerProviders: readonly TokenizerProvider[] = [
  {
    providerPrefix: "openai",
    modelPrefixes: ["gpt-"],
    count: (modelId, data) =>
      countOpenAiTokens(modelId as OpenAIModelName, data),
  },
  {
    providerPrefix: "anthropic",
    modelPrefixes: ["claude-"],
    count: async (modelId, data) => {
      const { anthropic } = await import("./tokenizers/anthropic.js");
      return await anthropic(modelId as AnthropicModelName, data);
    },
  },
  {
    providerPrefix: "google",
    modelPrefixes: ["gemini-"],
    count: async (modelId, data) => {
      const { google } = await import("./tokenizers/google.js");
      return await google(modelId as GoogleModelName, data);
    },
  },
];

function splitProviderPrefix(modelId: string):
  | {
      providerPrefix: string;
      modelName: string;
    }
  | undefined {
  const separatorIndex = modelId.indexOf("/");
  if (separatorIndex <= 0) return undefined;
  return {
    providerPrefix: modelId.slice(0, separatorIndex),
    modelName: modelId.slice(separatorIndex + 1),
  };
}

function resolveTokenizerProvider(modelId: string):
  | {
      provider: TokenizerProvider;
      modelName: string;
    }
  | undefined {
  const split = splitProviderPrefix(modelId);
  if (split) {
    const provider = tokenizerProviders.find(
      (entry) => entry.providerPrefix === split.providerPrefix,
    );
    return provider ? { provider, modelName: split.modelName } : undefined;
  }

  const provider = tokenizerProviders.find((entry) =>
    entry.modelPrefixes.some((prefix) => modelId.startsWith(prefix)),
  );
  return provider ? { provider, modelName: modelId } : undefined;
}

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
  const resolved = resolveTokenizerProvider(modelId);
  if (resolved) {
    return await resolved.provider.count(resolved.modelName, data);
  }

  // Fallback to OpenAI GPT-5 for unknown models
  console.warn(
    `Unknown model ID: "${modelId}". Falling back to OpenAI GPT-5 tokenizer (o200k_base encoding).`,
  );
  return await countOpenAiTokens("gpt-5", data);
}
