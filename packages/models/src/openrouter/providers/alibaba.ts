export const alibabaProvider = {
  id: "alibaba",
  name: "alibaba",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "alibaba/tongyi-deepresearch-30b-a3b": {
      id: "alibaba/tongyi-deepresearch-30b-a3b",
      name: "Tongyi DeepResearch 30B A3B",
      description:
        "Tongyi DeepResearch is an agentic large language model developed by Tongyi Lab, with 30 billion total parameters activating only 3 billion per token. It's optimized for long-horizon, deep information-seeking tasks and delivers state-of-the-art performance on benchmarks like Humanity's Last Exam, BrowserComp, BrowserComp-ZH, WebWalkerQA, GAIA, xbench-DeepSearch, and FRAMES. This makes it superior for complex agentic search, reasoning, and multi-step problem-solving compared to prior models.\n\nThe model includes a fully automated synthetic data pipeline for scalable pre-training, fine-tuning, and reinforcement learning. It uses large-scale continual pre-training on diverse agentic data to boost reasoning and stay fresh. It also features end-to-end on-policy RL with a customized Group Relative Policy Optimization, including token-level gradients and negative sample filtering for stable training. The model supports ReAct for core ability checks and an IterResearch-based 'Heavy' mode for max performance through test-time scaling. It's ideal for advanced research agents, tool use, and heavy inference workflows.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1758210804,
      cost: {
        input: 0.09,
        output: 0.45,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
  },
} as const;
export default alibabaProvider;
