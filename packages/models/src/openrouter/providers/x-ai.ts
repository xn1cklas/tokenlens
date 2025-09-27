export const x_aiProvider = {
  id: "x-ai",
  name: "x-ai",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "x-ai/grok-4-fast:free": {
      id: "x-ai/grok-4-fast:free",
      name: "xAI: Grok 4 Fast (free)",
      description:
        "Grok 4 Fast is xAI's latest multimodal model with SOTA cost-efficiency and a 2M token context window. It comes in two flavors: non-reasoning and reasoning. Read more about the model on xAI's [news post](http://x.ai/news/grok-4-fast). Reasoning can be enabled using the `reasoning` `enabled` parameter in the API. [Learn more in our docs](https://openrouter.ai/docs/use-cases/reasoning-tokens#controlling-reasoning-tokens)\n\nPrompts and completions may be used by xAI or OpenRouter to improve future models.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1758240090,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 2000000,
      },
    },
    "x-ai/grok-code-fast-1": {
      id: "x-ai/grok-code-fast-1",
      name: "xAI: Grok Code Fast 1",
      description:
        "Grok Code Fast 1 is a speedy and economical reasoning model that excels at agentic coding. With reasoning traces visible in the response, developers can steer Grok Code for high-quality work flows.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1756238927,
      cost: {
        input: 0.2,
        output: 1.5,
        reasoning: 0,
        cache_read: 0.02,
      },
      limit: {
        context: 256000,
      },
    },
    "x-ai/grok-4": {
      id: "x-ai/grok-4",
      name: "xAI: Grok 4",
      description:
        "Grok 4 is xAI's latest reasoning model with a 256k context window. It supports parallel tool calling, structured outputs, and both image and text inputs. Note that reasoning is not exposed, reasoning cannot be disabled, and the reasoning effort cannot be specified. Pricing increases once the total tokens in a given request is greater than 128k tokens. See more details on the [xAI docs](https://docs.x.ai/docs/models/grok-4-0709)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1752087689,
      cost: {
        input: 3,
        output: 15,
        reasoning: 0,
        cache_read: 0.75,
      },
      limit: {
        context: 256000,
      },
    },
    "x-ai/grok-3-mini": {
      id: "x-ai/grok-3-mini",
      name: "xAI: Grok 3 Mini",
      description:
        "A lightweight model that thinks before responding. Fast, smart, and great for logic-based tasks that do not require deep domain knowledge. The raw thinking traces are accessible.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1749583245,
      cost: {
        input: 0.3,
        output: 0.5,
        reasoning: 0,
        cache_read: 0.075,
      },
      limit: {
        context: 131072,
      },
    },
    "x-ai/grok-3": {
      id: "x-ai/grok-3",
      name: "xAI: Grok 3",
      description:
        "Grok 3 is the latest model from xAI. It's their flagship model that excels at enterprise use cases like data extraction, coding, and text summarization. Possesses deep domain knowledge in finance, healthcare, law, and science.\n\n",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1749582908,
      cost: {
        input: 3,
        output: 15,
        reasoning: 0,
        cache_read: 0.75,
      },
      limit: {
        context: 131072,
      },
    },
    "x-ai/grok-3-mini-beta": {
      id: "x-ai/grok-3-mini-beta",
      name: "xAI: Grok 3 Mini Beta",
      description:
        'Grok 3 Mini is a lightweight, smaller thinking model. Unlike traditional models that generate answers immediately, Grok 3 Mini thinks before responding. It’s ideal for reasoning-heavy tasks that don’t demand extensive domain knowledge, and shines in math-specific and quantitative use cases, such as solving challenging puzzles or math problems.\n\nTransparent "thinking" traces accessible. Defaults to low reasoning, can boost with setting `reasoning: { effort: "high" }`\n\nNote: That there are two xAI endpoints for this model. By default when using this model we will always route you to the base endpoint. If you want the fast endpoint you can add `provider: { sort: throughput}`, to sort by throughput instead. \n',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1744240195,
      cost: {
        input: 0.3,
        output: 0.5,
        reasoning: 0,
        cache_read: 0.075,
      },
      limit: {
        context: 131072,
      },
    },
    "x-ai/grok-3-beta": {
      id: "x-ai/grok-3-beta",
      name: "xAI: Grok 3 Beta",
      description:
        "Grok 3 is the latest model from xAI. It's their flagship model that excels at enterprise use cases like data extraction, coding, and text summarization. Possesses deep domain knowledge in finance, healthcare, law, and science.\n\nExcels in structured tasks and benchmarks like GPQA, LCB, and MMLU-Pro where it outperforms Grok 3 Mini even on high thinking. \n\nNote: That there are two xAI endpoints for this model. By default when using this model we will always route you to the base endpoint. If you want the fast endpoint you can add `provider: { sort: throughput}`, to sort by throughput instead. \n",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1744240068,
      cost: {
        input: 3,
        output: 15,
        reasoning: 0,
        cache_read: 0.75,
      },
      limit: {
        context: 131072,
      },
    },
  },
} as const;
export default x_aiProvider;
