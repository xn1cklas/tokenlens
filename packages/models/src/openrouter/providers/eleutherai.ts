export const eleutheraiProvider = {
  id: "eleutherai",
  name: "eleutherai",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "eleutherai/llemma_7b": {
      id: "eleutherai/llemma_7b",
      name: "EleutherAI: Llemma 7b",
      description:
        "Llemma 7B is a language model for mathematics. It was initialized with Code Llama 7B weights, and trained on the Proof-Pile-2 for 200B tokens. Llemma models are particularly strong at chain-of-thought mathematical reasoning and using computational tools for mathematics, such as Python and formal theorem provers.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1744643225,
      cost: {
        input: 0.8,
        output: 1.2,
        reasoning: 0,
      },
      limit: {
        context: 4096,
      },
    },
  },
} as const;
export default eleutheraiProvider;
