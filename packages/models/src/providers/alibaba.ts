export const alibabaModels = {
  id: "alibaba",
  name: "Alibaba",
  api: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
  npm: "@ai-sdk/openai-compatible",
  doc: "https://www.alibabacloud.com/help/en/model-studio/models",
  env: ["DASHSCOPE_API_KEY"],
  models: {
    "qwen3-coder-plus": {
      id: "qwen3-coder-plus",
      name: "Qwen3 Coder Plus",
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
        input: 1,
        output: 5,
      },
      limit: {
        context: 1048576,
        output: 65536,
      },
    },
  },
} as const;
export default alibabaModels;
