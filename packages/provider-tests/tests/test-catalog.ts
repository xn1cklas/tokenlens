import {
  createTokenlens,
  type Tokenlens,
  type SourceProviders,
} from "tokenlens";

export const testProviders: SourceProviders = {
  openai: {
    id: "openai",
    name: "OpenAI",
    source: "package",
    schemaVersion: 1,
    models: {
      "openai/gpt-5": {
        id: "openai/gpt-5",
        canonical_id: "openai/gpt-5",
        name: "GPT-5",
        limit: { context: 200_000, input: 200_000, output: 8_192 },
        cost: {
          input: 30,
          output: 60,
          reasoning: 120,
          cache_read: 6,
          cache_write: 3,
        },
      },
      "openai/gpt-4o-mini": {
        id: "openai/gpt-4o-mini",
        canonical_id: "openai/gpt-4o-mini",
        name: "GPT-4o Mini",
        limit: { context: 128_000, input: 128_000, output: 2_048 },
        cost: {
          input: 15,
          output: 60,
        },
      },
      "openai/o1": {
        id: "openai/o1",
        canonical_id: "openai/o1",
        name: "OpenAI o1",
        limit: { context: 131_072, input: 131_072, output: 8_192 },
        cost: {
          input: 15,
          output: 60,
        },
      },
    },
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    source: "package",
    schemaVersion: 1,
    models: {
      "anthropic/claude-3-5-sonnet-20241022": {
        id: "anthropic/claude-3-5-sonnet-20241022",
        canonical_id: "anthropic/claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet (2024-10-22)",
        limit: { context: 200_000, input: 200_000, output: 8_192 },
        cost: {
          input: 3,
          output: 15,
          cache_read: 1.5,
          cache_write: 1,
        },
      },
    },
  },
  xai: {
    id: "xai",
    name: "xAI",
    source: "package",
    schemaVersion: 1,
    models: {
      "xai/grok-4": {
        id: "xai/grok-4",
        canonical_id: "xai/grok-4",
        name: "grok-4",
        limit: { context: 128_000, input: 128_000, output: 4_096 },
        cost: {
          input: 20,
          output: 20,
        },
      },
    },
  },
} as const;

export function createTestClient(
  catalog: SourceProviders = testProviders,
): Tokenlens {
  return createTokenlens({
    catalog,
  });
}
