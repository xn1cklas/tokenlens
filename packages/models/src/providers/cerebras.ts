export const cerebrasModels = {
  id: "cerebras",
  name: "Cerebras",
  npm: "@ai-sdk/cerebras",
  doc: "https://inference-docs.cerebras.ai/models/overview",
  env: ["CEREBRAS_API_KEY"],
  models: {
    "qwen-3-235b-a22b-instruct-2507": {
      id: "qwen-3-235b-a22b-instruct-2507",
      name: "Qwen 3 235B Instruct",
      attachment: false,
      reasoning: false,
      temperature: true,
      tool_call: true,
      knowledge: "2025-04",
      release_date: "2025-07-22",
      last_updated: "2025-07-22",
      modalities: {
        input: ["text"],
        output: ["text"],
      },
      open_weights: true,
      cost: {
        input: 0.6,
        output: 1.2,
      },
      limit: {
        context: 131000,
        output: 32000,
      },
    },
    "gpt-oss-120b": {
      id: "gpt-oss-120b",
      name: "GPT OSS 120B",
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
        input: 0.25,
        output: 0.69,
      },
      limit: {
        context: 131072,
        output: 32768,
      },
    },
    "qwen-3-coder-480b": {
      id: "qwen-3-coder-480b",
      name: "Qwen 3 Coder 480B",
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
        input: 2,
        output: 2,
      },
      limit: {
        context: 131000,
        output: 32000,
      },
    },
  },
} as const;
export default cerebrasModels;
