export const morphModels = {
  id: "morph",
  name: "Morph",
  api: "https://api.morphllm.com/v1",
  npm: "@ai-sdk/openai-compatible",
  doc: "https://docs.morphllm.com/api-reference/introduction",
  env: ["MORPH_API_KEY"],
  models: {
    auto: {
      id: "auto",
      name: "Auto",
      attachment: false,
      reasoning: false,
      temperature: false,
      tool_call: false,
      release_date: "2024-06-01",
      last_updated: "2024-06-01",
      modalities: {
        input: ["text"],
        output: ["text"],
      },
      open_weights: false,
      cost: {
        input: 0.85,
        output: 1.55,
      },
      limit: {
        context: 32000,
        output: 32000,
      },
    },
    "morph-v3-fast": {
      id: "morph-v3-fast",
      name: "Morph v3 Fast",
      attachment: false,
      reasoning: false,
      temperature: false,
      tool_call: false,
      release_date: "2024-08-15",
      last_updated: "2024-08-15",
      modalities: {
        input: ["text"],
        output: ["text"],
      },
      open_weights: false,
      cost: {
        input: 0.8,
        output: 1.2,
      },
      limit: {
        context: 16000,
        output: 16000,
      },
    },
    "morph-v3-large": {
      id: "morph-v3-large",
      name: "Morph v3 Large",
      attachment: false,
      reasoning: false,
      temperature: false,
      tool_call: false,
      release_date: "2024-08-15",
      last_updated: "2024-08-15",
      modalities: {
        input: ["text"],
        output: ["text"],
      },
      open_weights: false,
      cost: {
        input: 0.9,
        output: 1.9,
      },
      limit: {
        context: 32000,
        output: 32000,
      },
    },
  },
} as const;
export default morphModels;
