import { get_encoding } from "@dqbd/tiktoken";

const OPENAI_MODELS_O200K = ["gpt-4o", "gpt-4o-mini", "gpt-5"] as const;

const OPENAI_MODELS_CL100K = ["gpt-4"] as const;

const OPENAI_MODELS = [
  ...OPENAI_MODELS_O200K,
  ...OPENAI_MODELS_CL100K,
] as const;

export type OpenAIModelName = (typeof OPENAI_MODELS)[number];
export type OpenAIModelId = OpenAIModelName | `openai/${OpenAIModelName}`;

type EncodingType = "o200k_base" | "cl100k_base";

function getEncodingForModel(modelId: string): EncodingType {
  // Strip prefix if present
  const cleanModelId = modelId.replace(/^openai\//, "");

  // Check o200k_base models (newer models)
  if (OPENAI_MODELS_O200K.some((m) => cleanModelId.startsWith(m))) {
    return "o200k_base";
  }

  // Check cl100k_base models (older models)
  if (OPENAI_MODELS_CL100K.some((m) => cleanModelId.startsWith(m))) {
    return "cl100k_base";
  }

  // Default to o200k_base for unknown models
  return "o200k_base";
}

export async function openai(
  modelId: OpenAIModelId,
  data: string,
): Promise<number> {
  const cleanModelId = modelId.replace(/^openai\//, "");

  if (!OPENAI_MODELS.some((m) => cleanModelId.startsWith(m))) {
    throw new Error(
      `Unknown OpenAI model: ${cleanModelId}. Supported models: ${OPENAI_MODELS.join(", ")}`,
    );
  }

  const encodingType = getEncodingForModel(cleanModelId);
  const encoding = get_encoding(encodingType);

  try {
    const tokens = encoding.encode(data);
    const count = tokens.length;
    encoding.free();
    return count;
  } catch (error) {
    encoding.free();
    throw new Error(
      `Failed to encode text with ${encodingType}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
