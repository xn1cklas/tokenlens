export const basetenProvider = {
  id: "baseten",
  name: "Baseten",
  api: "https://inference.baseten.co/v1",
  npm: "@ai-sdk/openai-compatible",
  doc: "https://docs.baseten.co/development/model-apis/overview",
  env: ["BASETEN_API_KEY"],
  source: "models.dev",
  schemaVersion: 1,
  models: {
    "Qwen3/Qwen3-Coder-480B-A35B-Instruct": {
      id: "Qwen3/Qwen3-Coder-480B-A35B-Instruct",
      name: "Qwen3 Coder 480B A35B Instruct",
      attachment: false,
      reasoning: false,
      temperature: true,
      tool_call: true,
      knowledge: "2025-04",
      release_date: "2025-07-23",
      last_updated: "2025-07-23",
      modalities: {
        input: ["text"],
        output: ["text"],
      },
      open_weights: true,
      cost: {
        input: 0.38,
        output: 1.53,
      },
      limit: {
        context: 262144,
        output: 66536,
      },
    },
    "moonshotai/Kimi-K2-Instruct-0905": {
      id: "moonshotai/Kimi-K2-Instruct-0905",
      name: "Kimi K2 Instruct 0905",
      attachment: false,
      reasoning: false,
      temperature: true,
      tool_call: true,
      knowledge: "2025-08",
      release_date: "2025-09-05",
      last_updated: "2025-09-05",
      modalities: {
        input: ["text"],
        output: ["text"],
      },
      open_weights: true,
      cost: {
        input: 0.6,
        output: 2.5,
      },
      limit: {
        context: 262144,
        output: 262144,
      },
    },
  },
} as const;
export default basetenProvider;
