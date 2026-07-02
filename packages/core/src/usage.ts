type TokenCount = number | null | undefined;

/** Usage shapes from various SDKs/providers (union of common fields). */
export type Usage = {
  prompt_tokens?: TokenCount;
  completion_tokens?: TokenCount;
  total_tokens?: TokenCount;
  input_tokens?: TokenCount;
  output_tokens?: TokenCount;
  cache_read_tokens?: TokenCount;
  cache_write_tokens?: TokenCount;
  reasoning_tokens?: TokenCount;
  promptTokens?: TokenCount;
  completionTokens?: TokenCount;
  totalTokens?: TokenCount;
  inputTokens?: TokenCount;
  outputTokens?: TokenCount;
  reasoningTokens?: TokenCount;
  cacheReads?: TokenCount;
  cacheWrites?: TokenCount;
  cacheReadTokens?: TokenCount;
  cacheWriteTokens?: TokenCount;
  cachedInputTokens?: TokenCount;
  prompt_tokens_details?: {
    cached_tokens?: TokenCount;
  } | null;
  completion_tokens_details?: {
    reasoning_tokens?: TokenCount;
  } | null;
  cache_read_input_tokens?: TokenCount;
  cache_creation_input_tokens?: TokenCount;
};

/** Provider-agnostic usage structure used by helpers. */
export type NormalizedUsage = {
  input: number;
  output: number;
  total?: number;
};

/** Extended usage details with optional prompt-caching counters. */
export type TokenBreakdown = NormalizedUsage & {
  cacheReads?: number;
  cacheWrites?: number;
  reasoningTokens?: number;
  cacheTokensIncludedInInput?: boolean;
  reasoningIncludedInOutput?: boolean;
};
