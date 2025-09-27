export const aion_labsProvider = {
  id: "aion-labs",
  name: "aion-labs",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "aion-labs/aion-1.0": {
      id: "aion-labs/aion-1.0",
      name: "AionLabs: Aion-1.0",
      description:
        "Aion-1.0 is a multi-model system designed for high performance across various tasks, including reasoning and coding. It is built on DeepSeek-R1, augmented with additional models and techniques such as Tree of Thoughts (ToT) and Mixture of Experts (MoE). It is Aion Lab's most powerful reasoning model.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1738697557,
      cost: {
        input: 4,
        output: 8,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "aion-labs/aion-1.0-mini": {
      id: "aion-labs/aion-1.0-mini",
      name: "AionLabs: Aion-1.0-Mini",
      description:
        "Aion-1.0-Mini 32B parameter model is a distilled version of the DeepSeek-R1 model, designed for strong performance in reasoning domains such as mathematics, coding, and logic. It is a modified variant of a FuseAI model that outperforms R1-Distill-Qwen-32B and R1-Distill-Llama-70B, with benchmark results available on its [Hugging Face page](https://huggingface.co/FuseAI/FuseO1-DeepSeekR1-QwQ-SkyT1-32B-Preview), independently replicated for verification.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1738697107,
      cost: {
        input: 0.7,
        output: 1.4,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "aion-labs/aion-rp-llama-3.1-8b": {
      id: "aion-labs/aion-rp-llama-3.1-8b",
      name: "AionLabs: Aion-RP 1.0 (8B)",
      description:
        "Aion-RP-Llama-3.1-8B ranks the highest in the character evaluation portion of the RPBench-Auto benchmark, a roleplaying-specific variant of Arena-Hard-Auto, where LLMs evaluate each other’s responses. It is a fine-tuned base model rather than an instruct model, designed to produce more natural and varied writing.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1738696718,
      cost: {
        input: 0.2,
        output: 0.2,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
  },
} as const;
export default aion_labsProvider;
