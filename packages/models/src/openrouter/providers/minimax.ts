export const minimaxProvider = {
  id: "minimax",
  name: "minimax",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "minimax/minimax-m1": {
      id: "minimax/minimax-m1",
      name: "MiniMax: MiniMax M1",
      description:
        'MiniMax-M1 is a large-scale, open-weight reasoning model designed for extended context and high-efficiency inference. It leverages a hybrid Mixture-of-Experts (MoE) architecture paired with a custom "lightning attention" mechanism, allowing it to process long sequences—up to 1 million tokens—while maintaining competitive FLOP efficiency. With 456 billion total parameters and 45.9B active per token, this variant is optimized for complex, multi-step reasoning tasks.\n\nTrained via a custom reinforcement learning pipeline (CISPO), M1 excels in long-context understanding, software engineering, agentic tool use, and mathematical reasoning. Benchmarks show strong performance across FullStackBench, SWE-bench, MATH, GPQA, and TAU-Bench, often outperforming other open models like DeepSeek R1 and Qwen3-235B.',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1750200414,
      cost: {
        input: 0.3,
        output: 1.65,
        reasoning: 0,
      },
      limit: {
        context: 1000000,
      },
    },
    "minimax/minimax-01": {
      id: "minimax/minimax-01",
      name: "MiniMax: MiniMax-01",
      description:
        "MiniMax-01 is a combines MiniMax-Text-01 for text generation and MiniMax-VL-01 for image understanding. It has 456 billion parameters, with 45.9 billion parameters activated per inference, and can handle a context of up to 4 million tokens.\n\nThe text model adopts a hybrid architecture that combines Lightning Attention, Softmax Attention, and Mixture-of-Experts (MoE). The image model adopts the “ViT-MLP-LLM” framework and is trained on top of the text model.\n\nTo read more about the release, see: https://www.minimaxi.com/en/news/minimax-01-series-2",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1736915462,
      cost: {
        input: 0.2,
        output: 1.1,
        reasoning: 0,
      },
      limit: {
        context: 1000192,
      },
    },
  },
} as const;
export default minimaxProvider;
