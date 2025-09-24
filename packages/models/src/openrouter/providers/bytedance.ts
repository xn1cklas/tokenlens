export const bytedanceProvider = {
  id: "bytedance",
  name: "bytedance",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "bytedance/seed-oss-36b-instruct": {
      id: "bytedance/seed-oss-36b-instruct",
      name: "ByteDance: Seed OSS 36B Instruct",
      description:
        "Seed-OSS-36B-Instruct is a 36B-parameter instruction-tuned reasoning language model from ByteDance’s Seed team, released under Apache-2.0. The model is optimized for general instruction following with strong performance in reasoning, mathematics, coding, tool use/agentic workflows, and multilingual tasks, and is intended for international (i18n) use cases. It is not currently possible to control the reasoning effort.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1756834704,
      cost: {
        input: 0.16,
        output: 0.65,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "bytedance/ui-tars-1.5-7b": {
      id: "bytedance/ui-tars-1.5-7b",
      name: "ByteDance: UI-TARS 7B ",
      description:
        "UI-TARS-1.5 is a multimodal vision-language agent optimized for GUI-based environments, including desktop interfaces, web browsers, mobile systems, and games. Built by ByteDance, it builds upon the UI-TARS framework with reinforcement learning-based reasoning, enabling robust action planning and execution across virtual interfaces.\n\nThis model achieves state-of-the-art results on a range of interactive and grounding benchmarks, including OSworld, WebVoyager, AndroidWorld, and ScreenSpot. It also demonstrates perfect task completion across diverse Poki games and outperforms prior models in Minecraft agent tasks. UI-TARS-1.5 supports thought decomposition during inference and shows strong scaling across variants, with the 1.5 version notably exceeding the performance of earlier 72B and 7B checkpoints.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1753205056,
      cost: {
        input: 0.1,
        output: 0.2,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
  },
} as const;
export default bytedanceProvider;
