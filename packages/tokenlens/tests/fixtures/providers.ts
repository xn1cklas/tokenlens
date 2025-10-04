import type { SourceModel, SourceProviders } from "@tokenlens/core";

const OPENAI_GPT4O_MODEL: SourceModel = {
  id: "openai/gpt-4o",
  name: "GPT-4o",
  canonical_id: "openai/gpt-4o",
  limit: { context: 128_000, output: 4_096 },
  cost: {
    input: 30,
    output: 60,
    reasoning: 120,
    cache_read: 6,
  },
};

const OPENROUTER_PROVIDERS: SourceProviders = {
  openai: {
    id: "openai",
    name: "OpenAI",
    api: "https://openrouter.ai/api/v1",
    doc: "https://openrouter.ai/models",
    env: ["OPENROUTER_API_KEY"],
    source: "openrouter",
    schemaVersion: 1,
    models: {
      [OPENAI_GPT4O_MODEL.id]: OPENAI_GPT4O_MODEL,
    },
  },
};

const ANTHROPIC_CLAUDE35_MODEL: SourceModel = {
  id: "anthropic/claude-3.5",
  name: "Claude 3.5",
  canonical_id: "anthropic/claude-3.5",
  limit: { context: 200_000, output: 4_096 },
  cost: {
    input: 15,
    output: 75,
  },
};

const MODELS_DEV_PROVIDERS: SourceProviders = {
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    source: "models.dev",
    schemaVersion: 1,
    models: {
      [ANTHROPIC_CLAUDE35_MODEL.id]: ANTHROPIC_CLAUDE35_MODEL,
    },
  },
};

const PACKAGE_PROVIDERS: SourceProviders = {
  local: {
    id: "local",
    name: "Local Catalog",
    source: "package",
    schemaVersion: 1,
    models: {
      "local/demo": {
        id: "local/demo",
        name: "Local Demo",
        canonical_id: "local/demo",
        limit: { context: 128_000, output: 4_096 },
        cost: {
          input: 30,
          output: 60,
          reasoning: 120,
          cache_read: 6,
        },
      },
    },
  },
};

function cloneProviders(providers: SourceProviders): SourceProviders {
  return JSON.parse(JSON.stringify(providers)) as SourceProviders;
}

export function createOpenrouterProvidersFixture(): SourceProviders {
  return cloneProviders(OPENROUTER_PROVIDERS);
}

export function createModelsDevProvidersFixture(): SourceProviders {
  return cloneProviders(MODELS_DEV_PROVIDERS);
}

export function createPackageProvidersFixture(): SourceProviders {
  return cloneProviders(PACKAGE_PROVIDERS);
}

export const OPENAI_GPT4O_VARIANTS = [
  "openai/gpt-4o",
  "openai:gpt-4o",
  "gpt-4o",
  "GPT-4O",
] as const;
