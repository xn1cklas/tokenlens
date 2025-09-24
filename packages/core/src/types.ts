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
    | "reasoning_tokens"
    | "promptTokens"
    | "completionTokens"
    | "totalTokens"
    | "reasoningTokens",
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

/** Legacy per-model entry shape kept for backwards-compat in v2 dev phase. */
export type ProviderModelLegacy = {
  id: string;
  name: string;
  attachment?: boolean;
  reasoning?: boolean;
  temperature?: boolean;
  tool_call?: boolean;
  knowledge?: string;
  release_date?: string;
  last_updated?: string;
  modalities?: { input?: readonly string[]; output?: readonly string[] };
  open_weights?: boolean;
  cost?: {
    input?: number;
    output?: number;
    reasoning?: number;
    cache_read?: number;
    cache_write?: number;
  };
  limit?: {
    context?: number;
    input?: number;
    output?: number;
  };
};

/** Canonical registry model entry used by registry.ts (v1 compatibility). */
export type Model = {
  id: string;
  provider: Provider;
  vendorId?: string;
  displayName?: string;
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
