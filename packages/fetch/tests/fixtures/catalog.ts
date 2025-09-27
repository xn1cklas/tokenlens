import type { SourceModel, SourceProviders } from "@tokenlens/core";

const OPENAI_GPT4O: SourceModel = {
  id: "openai/gpt-4o",
  name: "GPT-4o",
  description: "OpenAI GPT-4o",
};

const ANTHROPIC_CLAUDE35: SourceModel = {
  id: "anthropic/claude-3.5",
  name: "Claude 3.5",
};

const MODELS_DEV_FIXTURE: SourceProviders = {
  openai: {
    id: "openai",
    name: "OpenAI",
    source: "models.dev",
    schemaVersion: 1,
    models: {
      [OPENAI_GPT4O.id]: OPENAI_GPT4O,
    },
  },
};

const OPENROUTER_FIXTURE: SourceProviders = {
  openai: {
    id: "openai",
    name: "OpenAI",
    source: "openrouter",
    schemaVersion: 1,
    models: {
      [OPENAI_GPT4O.id]: OPENAI_GPT4O,
    },
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    source: "openrouter",
    schemaVersion: 1,
    models: {
      [ANTHROPIC_CLAUDE35.id]: ANTHROPIC_CLAUDE35,
    },
  },
};

export function createModelsDevCatalogFixture(): SourceProviders {
  return structuredClone(MODELS_DEV_FIXTURE);
}

export function createOpenrouterCatalogFixture(): SourceProviders {
  return structuredClone(OPENROUTER_FIXTURE);
}

export const MODEL_ID_VARIANTS = {
  "openai/gpt-4o": ["openai/gpt-4o", "openai:gpt-4o", "gpt-4o", "GPT-4O"],
} as const;
