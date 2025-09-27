export const cohereProvider = {
  id: "cohere",
  name: "cohere",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "cohere/command-a": {
      id: "cohere/command-a",
      name: "Cohere: Command A",
      description:
        "Command A is an open-weights 111B parameter model with a 256k context window focused on delivering great performance across agentic, multilingual, and coding use cases.\nCompared to other leading proprietary and open-weights models Command A delivers maximum performance with minimum hardware costs, excelling on business-critical agentic and multilingual tasks.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1741894342,
      cost: {
        input: 2.5,
        output: 10,
        reasoning: 0,
      },
      limit: {
        context: 256000,
      },
    },
    "cohere/command-r7b-12-2024": {
      id: "cohere/command-r7b-12-2024",
      name: "Cohere: Command R7B (12-2024)",
      description:
        "Command R7B (12-2024) is a small, fast update of the Command R+ model, delivered in December 2024. It excels at RAG, tool use, agents, and similar tasks requiring complex reasoning and multiple steps.\n\nUse of this model is subject to Cohere's [Usage Policy](https://docs.cohere.com/docs/usage-policy) and [SaaS Agreement](https://cohere.com/saas-agreement).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1734158152,
      cost: {
        input: 0.0375,
        output: 0.15,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "cohere/command-r-plus-08-2024": {
      id: "cohere/command-r-plus-08-2024",
      name: "Cohere: Command R+ (08-2024)",
      description:
        "command-r-plus-08-2024 is an update of the [Command R+](/models/cohere/command-r-plus) with roughly 50% higher throughput and 25% lower latencies as compared to the previous Command R+ version, while keeping the hardware footprint the same.\n\nRead the launch post [here](https://docs.cohere.com/changelog/command-gets-refreshed).\n\nUse of this model is subject to Cohere's [Usage Policy](https://docs.cohere.com/docs/usage-policy) and [SaaS Agreement](https://cohere.com/saas-agreement).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1724976000,
      cost: {
        input: 2.5,
        output: 10,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "cohere/command-r-08-2024": {
      id: "cohere/command-r-08-2024",
      name: "Cohere: Command R (08-2024)",
      description:
        "command-r-08-2024 is an update of the [Command R](/models/cohere/command-r) with improved performance for multilingual retrieval-augmented generation (RAG) and tool use. More broadly, it is better at math, code and reasoning and is competitive with the previous version of the larger Command R+ model.\n\nRead the launch post [here](https://docs.cohere.com/changelog/command-gets-refreshed).\n\nUse of this model is subject to Cohere's [Usage Policy](https://docs.cohere.com/docs/usage-policy) and [SaaS Agreement](https://cohere.com/saas-agreement).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1724976000,
      cost: {
        input: 0.15,
        output: 0.6,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
  },
} as const;
export default cohereProvider;
