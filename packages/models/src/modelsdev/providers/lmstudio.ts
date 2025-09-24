export const lmstudioProvider = {
  id: "lmstudio",
  name: "LMStudio",
  api: "http://127.0.0.1:1234/v1",
  npm: "@ai-sdk/openai-compatible",
  doc: "https://lmstudio.ai/models",
  env: ["LMSTUDIO_API_KEY"],
  source: "models.dev",
  schemaVersion: 1,
  models: {
    "openai/gpt-oss-20b": {
      id: "openai/gpt-oss-20b",
      name: "GPT OSS 20B",
      attachment: false,
      reasoning: true,
      temperature: true,
      tool_call: true,
      release_date: "2025-08-05",
      last_updated: "2025-08-05",
      modalities: {
        input: ["text"],
        output: ["text"],
      },
      open_weights: true,
      cost: {
        input: 0,
        output: 0,
      },
      limit: {
        context: 131072,
        output: 32768,
      },
    },
    "qwen/qwen3-coder-30b": {
      id: "qwen/qwen3-coder-30b",
      name: "Qwen3 Coder 30B",
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
        input: 0,
        output: 0,
      },
      limit: {
        context: 262144,
        output: 65536,
      },
    },
    "qwen/qwen3-30b-a3b-2507": {
      id: "qwen/qwen3-30b-a3b-2507",
      name: "Qwen3 30B A3B 2507",
      attachment: false,
      reasoning: false,
      temperature: true,
      tool_call: true,
      knowledge: "2025-04",
      release_date: "2025-07-30",
      last_updated: "2025-07-30",
      modalities: {
        input: ["text"],
        output: ["text"],
      },
      open_weights: true,
      cost: {
        input: 0,
        output: 0,
      },
      limit: {
        context: 262144,
        output: 16384,
      },
    },
  },
} as const;
export default lmstudioProvider;
