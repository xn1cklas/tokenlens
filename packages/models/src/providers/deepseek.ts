export const deepseekModels = {
  id: "deepseek",
  name: "DeepSeek",
  api: "https://api.deepseek.com",
  npm: "@ai-sdk/openai-compatible",
  doc: "https://platform.deepseek.com/api-docs/pricing",
  env: ["DEEPSEEK_API_KEY"],
  models: {
    "deepseek-reasoner": {
      id: "deepseek-reasoner",
      name: "DeepSeek Reasoner",
      attachment: true,
      reasoning: true,
      temperature: true,
      tool_call: true,
      knowledge: "2024-07",
      release_date: "2025-01-20",
      last_updated: "2025-08-21",
      modalities: {
        input: ["text"],
        output: ["text"],
      },
      open_weights: false,
      cost: {
        input: 0.57,
        output: 1.68,
        cache_read: 0.07,
      },
      limit: {
        context: 128000,
        output: 128000,
      },
    },
    "deepseek-chat": {
      id: "deepseek-chat",
      name: "DeepSeek Chat",
      attachment: true,
      reasoning: false,
      temperature: true,
      tool_call: true,
      knowledge: "2024-07",
      release_date: "2024-12-26",
      last_updated: "2025-08-21",
      modalities: {
        input: ["text"],
        output: ["text"],
      },
      open_weights: false,
      cost: {
        input: 0.57,
        output: 1.68,
        cache_read: 0.07,
      },
      limit: {
        context: 128000,
        output: 8192,
      },
    },
  },
} as const;
export default deepseekModels;
