export const tngtechProvider = {
  id: "tngtech",
  name: "tngtech",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "tngtech/deepseek-r1t2-chimera:free": {
      id: "tngtech/deepseek-r1t2-chimera:free",
      name: "TNG: DeepSeek R1T2 Chimera (free)",
      description:
        "DeepSeek-TNG-R1T2-Chimera is the second-generation Chimera model from TNG Tech. It is a 671 B-parameter mixture-of-experts text-generation model assembled from DeepSeek-AI’s R1-0528, R1, and V3-0324 checkpoints with an Assembly-of-Experts merge. The tri-parent design yields strong reasoning performance while running roughly 20 % faster than the original R1 and more than 2× faster than R1-0528 under vLLM, giving a favorable cost-to-intelligence trade-off. The checkpoint supports contexts up to 60 k tokens in standard use (tested to ~130 k) and maintains consistent <think> token behaviour, making it suitable for long-context analysis, dialogue and other open-ended generation tasks.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1751986985,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 163840,
      },
    },
    "tngtech/deepseek-r1t-chimera:free": {
      id: "tngtech/deepseek-r1t-chimera:free",
      name: "TNG: DeepSeek R1T Chimera (free)",
      description:
        "DeepSeek-R1T-Chimera is created by merging DeepSeek-R1 and DeepSeek-V3 (0324), combining the reasoning capabilities of R1 with the token efficiency improvements of V3. It is based on a DeepSeek-MoE Transformer architecture and is optimized for general text generation tasks.\n\nThe model merges pretrained weights from both source models to balance performance across reasoning, efficiency, and instruction-following tasks. It is released under the MIT license and intended for research and commercial use.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1745760875,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 163840,
      },
    },
    "tngtech/deepseek-r1t-chimera": {
      id: "tngtech/deepseek-r1t-chimera",
      name: "TNG: DeepSeek R1T Chimera",
      description:
        "DeepSeek-R1T-Chimera is created by merging DeepSeek-R1 and DeepSeek-V3 (0324), combining the reasoning capabilities of R1 with the token efficiency improvements of V3. It is based on a DeepSeek-MoE Transformer architecture and is optimized for general text generation tasks.\n\nThe model merges pretrained weights from both source models to balance performance across reasoning, efficiency, and instruction-following tasks. It is released under the MIT license and intended for research and commercial use.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1745760875,
      cost: {
        input: 0.25,
        output: 1,
        reasoning: 0,
      },
      limit: {
        context: 163840,
      },
    },
  },
} as const;
export default tngtechProvider;
