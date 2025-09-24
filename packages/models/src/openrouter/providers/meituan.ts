export const meituanProvider = {
  id: "meituan",
  name: "meituan",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "meituan/longcat-flash-chat": {
      id: "meituan/longcat-flash-chat",
      name: "Meituan: LongCat Flash Chat",
      description:
        "LongCat-Flash-Chat is a large-scale Mixture-of-Experts (MoE) model with 560B total parameters, of which 18.6B–31.3B (≈27B on average) are dynamically activated per input. It introduces a shortcut-connected MoE design to reduce communication overhead and achieve high throughput while maintaining training stability through advanced scaling strategies such as hyperparameter transfer, deterministic computation, and multi-stage optimization.\n\nThis release, LongCat-Flash-Chat, is a non-thinking foundation model optimized for conversational and agentic tasks. It supports long context windows up to 128K tokens and shows competitive performance across reasoning, coding, instruction following, and domain benchmarks, with particular strengths in tool use and complex multi-step interactions.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1757427658,
      cost: {
        input: 0.12,
        output: 0.6,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
  },
} as const;
export default meituanProvider;
