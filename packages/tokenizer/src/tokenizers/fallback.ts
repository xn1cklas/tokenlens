import type {
  TokenizerDispatch,
  TokenizerResolvedInput,
  TokenizerResult,
} from "../types.js";

export function estimateWithCharHeuristic(
  input: TokenizerResolvedInput,
  reason = "char-heuristic",
  error?: string,
): TokenizerResult {
  const characters = input.text.length;
  const total = characters > 0 ? Math.ceil(characters / 4) : 0;
  const details = error ? { strategy: reason, error } : { strategy: reason };
  return {
    total,
    estimated: true,
    details,
    count: total,
  };
}

export const fallbackTokenizer: TokenizerDispatch = {
  estimate: (input) => estimateWithCharHeuristic(input),
};
