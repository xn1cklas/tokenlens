export const anthracite_orgProvider = {
  id: "anthracite-org",
  name: "anthracite-org",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "anthracite-org/magnum-v4-72b": {
      id: "anthracite-org/magnum-v4-72b",
      name: "Magnum v4 72B",
      description:
        "This is a series of models designed to replicate the prose quality of the Claude 3 models, specifically Sonnet(https://openrouter.ai/anthropic/claude-3.5-sonnet) and Opus(https://openrouter.ai/anthropic/claude-3-opus).\n\nThe model is fine-tuned on top of [Qwen2.5 72B](https://openrouter.ai/qwen/qwen-2.5-72b-instruct).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1729555200,
      cost: {
        input: 2,
        output: 5,
        reasoning: 0,
      },
      limit: {
        context: 16384,
      },
    },
    "anthracite-org/magnum-v2-72b": {
      id: "anthracite-org/magnum-v2-72b",
      name: "Magnum v2 72B",
      description:
        "From the maker of [Goliath](https://openrouter.ai/models/alpindale/goliath-120b), Magnum 72B is the seventh in a family of models designed to achieve the prose quality of the Claude 3 models, notably Opus & Sonnet.\n\nThe model is based on [Qwen2 72B](https://openrouter.ai/models/qwen/qwen-2-72b-instruct) and trained with 55 million tokens of highly curated roleplay (RP) data.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1727654400,
      cost: {
        input: 3,
        output: 3,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
  },
} as const;
export default anthracite_orgProvider;
