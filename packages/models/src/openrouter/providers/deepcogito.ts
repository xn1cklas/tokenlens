export const deepcogitoProvider = {
  id: "deepcogito",
  name: "deepcogito",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "deepcogito/cogito-v2-preview-llama-109b-moe": {
      id: "deepcogito/cogito-v2-preview-llama-109b-moe",
      name: "Cogito V2 Preview Llama 109B",
      description:
        "An instruction-tuned, hybrid-reasoning Mixture-of-Experts model built on Llama-4-Scout-17B-16E. Cogito v2 can answer directly or engage an extended “thinking” phase, with alignment guided by Iterated Distillation & Amplification (IDA). It targets coding, STEM, instruction following, and general helpfulness, with stronger multilingual, tool-calling, and reasoning performance than size-equivalent baselines. The model supports long-context use (up to 10M tokens) and standard Transformers workflows. Users can control the reasoning behaviour with the `reasoning` `enabled` boolean. [Learn more in our docs](https://openrouter.ai/docs/use-cases/reasoning-tokens#enable-reasoning-with-default-config)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1756831568,
      cost: {
        input: 0.18,
        output: 0.59,
        reasoning: 0,
      },
      limit: {
        context: 32767,
      },
    },
    "deepcogito/cogito-v2-preview-deepseek-671b": {
      id: "deepcogito/cogito-v2-preview-deepseek-671b",
      name: "Deep Cogito: Cogito V2 Preview Deepseek 671B",
      description:
        "Cogito v2 is a multilingual, instruction-tuned Mixture of Experts (MoE) large language model with 671 billion parameters. It supports both standard and reasoning-based generation modes. The model introduces hybrid reasoning via Iterated Distillation and Amplification (IDA)—an iterative self-improvement strategy designed to scale alignment with general intelligence. Cogito v2 has been optimized for STEM, programming, instruction following, and tool use. It supports 128k context length and offers strong performance in both multilingual and code-heavy environments. Users can control the reasoning behaviour with the `reasoning` `enabled` boolean. [Learn more in our docs](https://openrouter.ai/docs/use-cases/reasoning-tokens#enable-reasoning-with-default-config)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1756830949,
      cost: {
        input: 1.25,
        output: 1.25,
        reasoning: 0,
      },
      limit: {
        context: 163840,
      },
    },
  },
} as const;
export default deepcogitoProvider;
