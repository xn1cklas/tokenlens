/**
 * Provider identifier. We accept any provider string so we can ingest the full
 * models.dev catalog without maintaining a hardcoded allowlist here.
 */
export type Provider = string;

/**
 * Lifecycle status of a model. Useful for filtering or picking a minimum stability.
 */
export type Status = "stable" | "preview" | "deprecated" | "retired";

/**
 * Context window limits for a model. Some providers expose a single combined budget,
 * while others expose separate input and output limits.
 */
export type ContextCaps = {
  /** When a provider constrains input+output together (typical). */
  combinedMax?: number;
  /** When a provider gives a separate input cap (rare). */
  inputMax?: number;
  /** When a provider gives a separate output cap (rare). */
  outputMax?: number;
};

/**
 * Rough pricing hints expressed as USD per 1M tokens.
 * Values are approximate and should be validated against provider docs.
 */
export type Pricing = {
  /** USD per 1M input (prompt) tokens. */
  inputPerMTokens?: number;
  /** USD per 1M output (completion) tokens. */
  outputPerMTokens?: number;
  /** USD per 1M reasoning tokens (e.g. OpenAI o-series). */
  reasoningPerMTokens?: number;
  /** USD per 1M cache read tokens (e.g. Anthropic prompt cache reads). */
  cacheReadPerMTokens?: number;
  /** USD per 1M cache write tokens (e.g. Anthropic prompt cache writes). */
  cacheWritePerMTokens?: number;
};

/**
 * Simple modality flags indicating basic capabilities for a model entry.
 */
export type Modalities = {
  textIn?: boolean;
  textOut?: boolean;
  imageIn?: boolean;
};

/**
 * Canonical model metadata entry used in the registry.
 */
export type Model = {
  /** Canonical id including provider prefix, e.g. `openai:gpt-4o`. */
  id: string;
  /** Provider name. */
  provider: Provider;
  /** Provider's raw id if different from canonical. */
  vendorId?: string;
  /** Human-friendly name for UIs. */
  displayName?: string;
  /** Family identifier, e.g. `gpt-4o`, `claude-3.5-sonnet`. */
  family?: string;
  /** Lifecycle status. */
  status: Status;
  /** Context window caps. */
  context: ContextCaps;
  /** Basic modality flags. */
  modalities?: Modalities;
  /** Approximate pricing info. */
  pricing?: Pricing;
  /** Where the pricing numbers came from (e.g. 'provider', 'openrouter'). */
  pricingSource?: string;
  /** Convenience aliases (without provider prefix). */
  aliases?: readonly string[];
  /** ISO date string when the model (version) was released, if known. */
  releasedAt?: string;
  /** URL to provider docs/model card for up-to-date info. */
  source: string;
  /** Optional URL specifically used to verify context caps, if different from `source`. */
  contextSource?: string;
  /** ISO date when the entry was last verified against its source(s). */
  verifiedAt?: string;
};
