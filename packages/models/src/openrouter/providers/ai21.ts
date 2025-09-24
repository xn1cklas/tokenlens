export const ai21Provider = {
  id: "ai21",
  name: "ai21",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "ai21/jamba-mini-1.7": {
      id: "ai21/jamba-mini-1.7",
      name: "AI21: Jamba Mini 1.7",
      description:
        "Jamba Mini 1.7 is a compact and efficient member of the Jamba open model family, incorporating key improvements in grounding and instruction-following while maintaining the benefits of the SSM-Transformer hybrid architecture and 256K context window. Despite its compact size, it delivers accurate, contextually grounded responses and improved steerability.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1754670601,
      cost: {
        input: 0.2,
        output: 0.4,
        reasoning: 0,
      },
      limit: {
        context: 256000,
      },
    },
    "ai21/jamba-large-1.7": {
      id: "ai21/jamba-large-1.7",
      name: "AI21: Jamba Large 1.7",
      description:
        "Jamba Large 1.7 is the latest model in the Jamba open family, offering improvements in grounding, instruction-following, and overall efficiency. Built on a hybrid SSM-Transformer architecture with a 256K context window, it delivers more accurate, contextually grounded responses and better steerability than previous versions.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1754669020,
      cost: {
        input: 2,
        output: 8,
        reasoning: 0,
      },
      limit: {
        context: 256000,
      },
    },
  },
} as const;
export default ai21Provider;
