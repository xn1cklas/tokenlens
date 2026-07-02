import { get_encoding } from "@dqbd/tiktoken";
import { TokenlensError } from "@tokenlens/core";

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
  // Check o200k_base models (newer models)
  if (OPENAI_MODELS_O200K.some((m) => modelId.startsWith(m))) {
    return "o200k_base";
  }

  return "cl100k_base";
}

export async function openai(
  modelId: OpenAIModelName,
  data: string,
): Promise<number> {
  if (!OPENAI_MODELS.some((m) => modelId.startsWith(m))) {
    throw new TokenlensError.UnsupportedTokenizerModel(modelId, {
      supportedModels: OPENAI_MODELS,
    });
  }

  const encodingType = getEncodingForModel(modelId);
  const encoding = get_encoding(encodingType);

  try {
    const tokens = encoding.encode(data);
    const count = tokens.length;
    encoding.free();
    return count;
  } catch (error) {
    encoding.free();
    const cause =
      error instanceof Error ? error : new Error(String(error ?? "unknown"));
    throw new TokenlensError.TokenizerEncodingFailed(modelId, encodingType, {
      cause,
      meta: { errorMessage: cause.message },
    });
  }
}
