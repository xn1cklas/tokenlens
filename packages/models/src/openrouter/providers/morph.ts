export const morphProvider = {
  id: "morph",
  name: "morph",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "morph/morph-v3-large": {
      id: "morph/morph-v3-large",
      name: "Morph: Morph V3 Large",
      description:
        "Morph's high-accuracy apply model for complex code edits. 2000+ tokens/sec with 98% accuracy for precise code transformations.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1751910858,
      cost: {
        input: 0.9,
        output: 1.9,
        reasoning: 0,
      },
      limit: {
        context: 81920,
      },
    },
    "morph/morph-v3-fast": {
      id: "morph/morph-v3-fast",
      name: "Morph: Morph V3 Fast",
      description:
        "Morph's fastest apply model for code edits. 4500+ tokens/sec with 96% accuracy for rapid code transformations.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1751910002,
      cost: {
        input: 0.9,
        output: 1.9,
        reasoning: 0,
      },
      limit: {
        context: 81920,
      },
    },
  },
} as const;
export default morphProvider;
