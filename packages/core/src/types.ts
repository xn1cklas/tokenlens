/**
 * Provider identifier. We accept any provider string so we can ingest the full
 * models.dev catalog without maintaining a hardcoded allowlist here.
 */
export type ProviderId = string;
export type Provider = ProviderId;

/** Lifecycle status of a model. */
export type Status = "stable" | "preview" | "deprecated" | "retired";

/** Context window caps */
export type ContextCaps = {
  combinedMax?: number;
  inputMax?: number;
  outputMax?: number;
};

/** Pricing hints in USD per 1M tokens */
export type Pricing = {
  inputPerMTokens?: number;
  outputPerMTokens?: number;
  reasoningPerMTokens?: number;
  cacheReadPerMTokens?: number;
  cacheWritePerMTokens?: number;
};

/** Basic modality flags */
export type Modalities = {
  textIn?: boolean;
  textOut?: boolean;
  imageIn?: boolean;
};

/** Usage shapes from various SDKs/providers (union of common fields). */
export type Usage = Partial<
  Record<
    | "prompt_tokens"
    | "completion_tokens"
    | "total_tokens"
    | "input_tokens"
    | "output_tokens"
    | "cache_read_tokens"
    | "cache_write_tokens"
    | "reasoning_tokens"
    | "promptTokens"
    | "completionTokens"
    | "totalTokens"
    | "reasoningTokens"
    | "cacheReadTokens"
    | "cacheWriteTokens",
    number
  >
>;

/** Provider-agnostic usage structure used by helpers */
export type NormalizedUsage = {
  input: number;
  output: number;
  total?: number;
};

/** Extended usage details with optional prompt-caching counters */
export type TokenBreakdown = NormalizedUsage & {
  cacheReads?: number;
  cacheWrites?: number;
  reasoningTokens?: number;
};

// Unified UsageSummary DTO removed to keep API focused on model metadata + helpers

// ------------------------------------------------------------
// Shared catalog types (models.dev-compatible)
// ------------------------------------------------------------

/** Model entry exported for downstream use, matches glossary definition. */
export type Model = {
  id: string;
  provider: Provider;
  vendorId?: string;
  name?: string;
  family?: string;
  status: Status;
  context: ContextCaps;
  modalities?: Modalities;
  pricing?: Pricing;
  pricingSource?: string;
  aliases?: readonly string[];
  releasedAt?: string;
  source: string;
  contextSource?: string;
  verifiedAt?: string;
};
