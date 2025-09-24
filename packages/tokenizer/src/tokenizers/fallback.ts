import type { TokenizerDispatch, TokenizerResolvedInput } from "../types.js";
import { resolveText } from "../utils.js";

export function estimateWithCharHeuristic(
  input: TokenizerResolvedInput,
  reason = "char-heuristic",
  error?: string,
) {
  const text = resolveText(input);
  const count = text ? Math.ceil(text.length / 4) : 0;
  return {
    count,
    estimated: true,
    details: error ? { strategy: reason, error } : { strategy: reason },
  };
}

export const fallbackTokenizer: TokenizerDispatch = {
  estimate: (input) => estimateWithCharHeuristic(input),
};
