import type { TokenizerDispatch, TokenizerResolvedInput } from "../types.js";
import { countTokens } from "@anthropic-ai/tokenizer";
import { estimateWithCharHeuristic } from "./fallback.js";

export const anthropicTokenizerProvider = {
  match(input: TokenizerResolvedInput): TokenizerDispatch | undefined {
    if (input.providerId !== "anthropic") return undefined;
    return {
      estimate: async (resolved) => {
        try {
          const count = await countTokensAsync(resolved.text);
          return {
            count,
            estimated: false,
            tokenizerId: "claude-v1",
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          return estimateWithCharHeuristic(
            resolved,
            "anthropic-tokenizer-error",
            message,
          );
        }
      },
    } satisfies TokenizerDispatch;
  },
};

async function countTokensAsync(text: string): Promise<number> {
  const tokens = await Promise.resolve(countTokens(text));
  return tokens;
}
