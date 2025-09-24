export const tencentProvider = {
  id: "tencent",
  name: "tencent",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "tencent/hunyuan-a13b-instruct:free": {
      id: "tencent/hunyuan-a13b-instruct:free",
      name: "Tencent: Hunyuan A13B Instruct (free)",
      description:
        "Hunyuan-A13B is a 13B active parameter Mixture-of-Experts (MoE) language model developed by Tencent, with a total parameter count of 80B and support for reasoning via Chain-of-Thought. It offers competitive benchmark performance across mathematics, science, coding, and multi-turn reasoning tasks, while maintaining high inference efficiency via Grouped Query Attention (GQA) and quantization support (FP8, GPTQ, etc.).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1751987664,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "tencent/hunyuan-a13b-instruct": {
      id: "tencent/hunyuan-a13b-instruct",
      name: "Tencent: Hunyuan A13B Instruct",
      description:
        "Hunyuan-A13B is a 13B active parameter Mixture-of-Experts (MoE) language model developed by Tencent, with a total parameter count of 80B and support for reasoning via Chain-of-Thought. It offers competitive benchmark performance across mathematics, science, coding, and multi-turn reasoning tasks, while maintaining high inference efficiency via Grouped Query Attention (GQA) and quantization support (FP8, GPTQ, etc.).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1751987664,
      cost: {
        input: 0.03,
        output: 0.03,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
  },
} as const;
export default tencentProvider;
