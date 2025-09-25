import type { TokenizerDispatch, TokenizerResolvedInput } from "../types.js";
import { estimateWithCharHeuristic } from "./fallback.js";

const ENCODING_GPT4O = "o200k_base" as const;
const ENCODING_CL100K = "cl100k_base" as const;
type KnownEncoding = typeof ENCODING_GPT4O | typeof ENCODING_CL100K;

export const openaiTokenizerProvider = {
  match(input: TokenizerResolvedInput): TokenizerDispatch | undefined {
    if (input.providerId !== "openai") return undefined;
    return {
      estimate: async (resolved) => {
        const encoding = resolveEncoding(resolved);
        if (!encoding) {
          return estimateWithCharHeuristic(resolved, "unknown-openai-encoding");
        }

        const tiktoken = await loadTiktoken();
        if (!tiktoken) {
          return estimateWithCharHeuristic(resolved, "tiktoken-missing");
        }

        const encoder = tiktoken.get_encoding(encoding);
        try {
          const tokens = encoder.encode(resolved.text);
          encoder.free();
          const total = tokens.length;
          return {
            total,
            estimated: false,
            tokenizerId: encoding,
          };
        } catch (error) {
          encoder.free();
          const message =
            error instanceof Error ? error.message : String(error);
          return estimateWithCharHeuristic(resolved, "tiktoken-error", message);
        }
      },
    } satisfies TokenizerDispatch;
  },
};

function resolveEncoding(
  resolved: TokenizerResolvedInput,
): KnownEncoding | undefined {
  const override = resolved.tokenizerId;
  if (override) {
    if (isKnownEncoding(override)) return override;
    return undefined;
  }
  return inferOpenAIEncoding(resolved.modelId);
}

function inferOpenAIEncoding(modelId: string): KnownEncoding | undefined {
  if (/gpt-4o|gpt-4\.1|gpt-5/.test(modelId)) return ENCODING_GPT4O;
  if (/gpt-3\.5|gpt-4|text-davinci/.test(modelId)) return ENCODING_CL100K;
  return undefined;
}

function isKnownEncoding(value: string): value is KnownEncoding {
  return value === ENCODING_GPT4O || value === ENCODING_CL100K;
}

type TiktokenModule = typeof import("@dqbd/tiktoken");

async function loadTiktoken(): Promise<TiktokenModule | undefined> {
  try {
    return await import("@dqbd/tiktoken");
  } catch (error) {
    const hint = error instanceof Error ? error.message : String(error);
    if (
      typeof process !== "undefined" &&
      process.env.NODE_ENV !== "production"
    ) {
      console.warn(
        "Tokenlens tokenizer: @dqbd/tiktoken not available, falling back to heuristic",
        hint,
      );
    }
    return undefined;
  }
}
