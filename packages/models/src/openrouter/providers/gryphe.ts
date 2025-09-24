export const grypheProvider = {
  id: "gryphe",
  name: "gryphe",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "gryphe/mythomax-l2-13b": {
      id: "gryphe/mythomax-l2-13b",
      name: "MythoMax 13B",
      description:
        "One of the highest performing and most popular fine-tunes of Llama 2 13B, with rich descriptions and roleplay. #merge",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1688256000,
      cost: {
        input: 0.06,
        output: 0.06,
        reasoning: 0,
      },
      limit: {
        context: 4096,
      },
    },
  },
} as const;
export default grypheProvider;
