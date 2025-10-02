import type { SourceModel, SourceProviders } from "@tokenlens/core";

const OPENAI_GPT4O_MODEL: SourceModel = {
  id: "openai/gpt-4o",
  name: "GPT-4o",
  reasoning: true,
  tool_call: true,
  attachment: false,
  open_weights: false,
  knowledge: "2024-06",
  limit: { context: 128_000, output: 4_096 },
  cost: {
    input: 30,
    output: 60,
    reasoning: 120,
    cache_read: 6,
  },
};
const GOOGLE_GEMINI_FLASH_LITE_MODEL: SourceModel = {
  id: "google/gemini-2.5-flash-lite-preview-09-2025",
  name: "Google: Gemini 2.5 Flash Lite Preview 09-2025",
  reasoning: false,
  tool_call: true,
  attachment: true,
  open_weights: false,
  knowledge: "2025-01",
  limit: { context: 1_048_576, output: 65_536 },
  cost: {
    input: 0.0000003,
    output: 0.0000025,
    reasoning: 0,
    cache_read: 0.000000075,
    cache_write: 0.0000003833,
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
  google: {
    id: "google",
    name: "Google",
    api: "https://openrouter.ai/api/v1",
    doc: "https://openrouter.ai/models",
    env: ["OPENROUTER_API_KEY"],
    source: "openrouter",
    schemaVersion: 1,
    models: {
      [GOOGLE_GEMINI_FLASH_LITE_MODEL.id]: GOOGLE_GEMINI_FLASH_LITE_MODEL,
    },
  },
};

const ANTHROPIC_CLAUDE35_MODEL: SourceModel = {
  id: "anthropic/claude-3.5",
  name: "Claude 3.5",
  reasoning: true,
  tool_call: false,
  attachment: true,
  open_weights: false,
  knowledge: "2024-03",
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
        open_weights: true,
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
