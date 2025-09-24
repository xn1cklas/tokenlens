export const thudmProvider = {
  id: "thudm",
  name: "thudm",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "thudm/glm-4.1v-9b-thinking": {
      id: "thudm/glm-4.1v-9b-thinking",
      name: "THUDM: GLM 4.1V 9B Thinking",
      description:
        'GLM-4.1V-9B-Thinking is a 9B parameter vision-language model developed by THUDM, based on the GLM-4-9B foundation. It introduces a reasoning-centric "thinking paradigm" enhanced with reinforcement learning to improve multimodal reasoning, long-context understanding (up to 64K tokens), and complex problem solving. It achieves state-of-the-art performance among models in its class, outperforming even larger models like Qwen-2.5-VL-72B on a majority of benchmark tasks. ',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1752244385,
      cost: {
        input: 0.035,
        output: 0.138,
        reasoning: 0,
      },
      limit: {
        context: 65536,
      },
    },
    "thudm/glm-z1-32b": {
      id: "thudm/glm-z1-32b",
      name: "THUDM: GLM Z1 32B",
      description:
        "GLM-Z1-32B-0414 is an enhanced reasoning variant of GLM-4-32B, built for deep mathematical, logical, and code-oriented problem solving. It applies extended reinforcement learning—both task-specific and general pairwise preference-based—to improve performance on complex multi-step tasks. Compared to the base GLM-4-32B model, Z1 significantly boosts capabilities in structured reasoning and formal domains.\n\nThe model supports enforced “thinking” steps via prompt engineering and offers improved coherence for long-form outputs. It’s optimized for use in agentic workflows, and includes support for long context (via YaRN), JSON tool calling, and fine-grained sampling configuration for stable inference. Ideal for use cases requiring deliberate, multi-step reasoning or formal derivations.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1744924148,
      cost: {
        input: 0.04,
        output: 0.14,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
  },
} as const;
export default thudmProvider;
