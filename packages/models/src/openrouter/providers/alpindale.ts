export const alpindaleProvider = {
  id: "alpindale",
  name: "alpindale",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "alpindale/goliath-120b": {
      id: "alpindale/goliath-120b",
      name: "Goliath 120B",
      description:
        "A large LLM created by combining two fine-tuned Llama 70B models into one 120B model. Combines Xwin and Euryale.\n\nCredits to\n- [@chargoddard](https://huggingface.co/chargoddard) for developing the framework used to merge the model - [mergekit](https://github.com/cg123/mergekit).\n- [@Undi95](https://huggingface.co/Undi95) for helping with the merge ratios.\n\n#merge",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1699574400,
      cost: {
        input: 4,
        output: 5.5,
        reasoning: 0,
      },
      limit: {
        context: 6144,
      },
    },
  },
} as const;
export default alpindaleProvider;
