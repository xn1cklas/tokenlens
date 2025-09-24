export const openaiProvider = {
  id: "openai",
  name: "openai",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "openai/gpt-5-codex": {
      id: "openai/gpt-5-codex",
      name: "OpenAI: GPT-5 Codex",
      description:
        "GPT-5-Codex is a specialized version of GPT-5 optimized for software engineering and coding workflows. It is designed for both interactive development sessions and long, independent execution of complex engineering tasks. The model supports building projects from scratch, feature development, debugging, large-scale refactoring, and code review. Compared to GPT-5, Codex is more steerable, adheres closely to developer instructions, and produces cleaner, higher-quality code outputs. Reasoning effort can be adjusted with the `reasoning.effort` parameter. Read the [docs here](https://openrouter.ai/docs/use-cases/reasoning-tokens#reasoning-effort-level)\n\nCodex integrates into developer environments including the CLI, IDE extensions, GitHub, and cloud tasks. It adapts reasoning effort dynamically—providing fast responses for small tasks while sustaining extended multi-hour runs for large projects. The model is trained to perform structured code reviews, catching critical flaws by reasoning over dependencies and validating behavior against tests. It also supports multimodal inputs such as images or screenshots for UI development and integrates tool use for search, dependency installation, and environment setup. Codex is intended specifically for agentic coding applications.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1758643403,
      cost: {
        input: 1.25,
        output: 10,
        reasoning: 0,
        cache_read: 0.125,
      },
      limit: {
        context: 400000,
      },
    },
    "openai/gpt-4o-audio-preview": {
      id: "openai/gpt-4o-audio-preview",
      name: "OpenAI: GPT-4o Audio",
      description:
        "The gpt-4o-audio-preview model adds support for audio inputs as prompts. This enhancement allows the model to detect nuances within audio recordings and add depth to generated user experiences. Audio outputs are currently not supported. Audio tokens are priced at $40 per million input audio tokens.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1755233061,
      cost: {
        input: 2.5,
        output: 10,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "openai/gpt-5-chat": {
      id: "openai/gpt-5-chat",
      name: "OpenAI: GPT-5 Chat",
      description:
        "GPT-5 Chat is designed for advanced, natural, multimodal, and context-aware conversations for enterprise applications.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1754587837,
      cost: {
        input: 1.25,
        output: 10,
        reasoning: 0,
        cache_read: 0.125,
      },
      limit: {
        context: 128000,
      },
    },
    "openai/gpt-5": {
      id: "openai/gpt-5",
      name: "OpenAI: GPT-5",
      description:
        'GPT-5 is OpenAI’s most advanced model, offering major improvements in reasoning, code quality, and user experience. It is optimized for complex tasks that require step-by-step reasoning, instruction following, and accuracy in high-stakes use cases. It supports test-time routing features and advanced prompt understanding, including user-specified intent like "think hard about this." Improvements include reductions in hallucination, sycophancy, and better performance in coding, writing, and health-related tasks.',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1754587413,
      cost: {
        input: 0.625,
        output: 5,
        reasoning: 0,
        cache_read: 0.0625,
      },
      limit: {
        context: 400000,
      },
    },
    "openai/gpt-5-mini": {
      id: "openai/gpt-5-mini",
      name: "OpenAI: GPT-5 Mini",
      description:
        "GPT-5 Mini is a compact version of GPT-5, designed to handle lighter-weight reasoning tasks. It provides the same instruction-following and safety-tuning benefits as GPT-5, but with reduced latency and cost. GPT-5 Mini is the successor to OpenAI's o4-mini model.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1754587407,
      cost: {
        input: 0.25,
        output: 2,
        reasoning: 0,
        cache_read: 0.025,
      },
      limit: {
        context: 400000,
      },
    },
    "openai/gpt-5-nano": {
      id: "openai/gpt-5-nano",
      name: "OpenAI: GPT-5 Nano",
      description:
        "GPT-5-Nano is the smallest and fastest variant in the GPT-5 system, optimized for developer tools, rapid interactions, and ultra-low latency environments. While limited in reasoning depth compared to its larger counterparts, it retains key instruction-following and safety features. It is the successor to GPT-4.1-nano and offers a lightweight option for cost-sensitive or real-time applications.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1754587402,
      cost: {
        input: 0.05,
        output: 0.4,
        reasoning: 0,
        cache_read: 0.005,
      },
      limit: {
        context: 400000,
      },
    },
    "openai/gpt-oss-120b:free": {
      id: "openai/gpt-oss-120b:free",
      name: "OpenAI: gpt-oss-120b (free)",
      description:
        "gpt-oss-120b is an open-weight, 117B-parameter Mixture-of-Experts (MoE) language model from OpenAI designed for high-reasoning, agentic, and general-purpose production use cases. It activates 5.1B parameters per forward pass and is optimized to run on a single H100 GPU with native MXFP4 quantization. The model supports configurable reasoning depth, full chain-of-thought access, and native tool use, including function calling, browsing, and structured output generation.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1754414231,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "openai/gpt-oss-120b": {
      id: "openai/gpt-oss-120b",
      name: "OpenAI: gpt-oss-120b",
      description:
        "gpt-oss-120b is an open-weight, 117B-parameter Mixture-of-Experts (MoE) language model from OpenAI designed for high-reasoning, agentic, and general-purpose production use cases. It activates 5.1B parameters per forward pass and is optimized to run on a single H100 GPU with native MXFP4 quantization. The model supports configurable reasoning depth, full chain-of-thought access, and native tool use, including function calling, browsing, and structured output generation.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1754414231,
      cost: {
        input: 0.05,
        output: 0.25,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "openai/gpt-oss-20b:free": {
      id: "openai/gpt-oss-20b:free",
      name: "OpenAI: gpt-oss-20b (free)",
      description:
        "gpt-oss-20b is an open-weight 21B parameter model released by OpenAI under the Apache 2.0 license. It uses a Mixture-of-Experts (MoE) architecture with 3.6B active parameters per forward pass, optimized for lower-latency inference and deployability on consumer or single-GPU hardware. The model is trained in OpenAI’s Harmony response format and supports reasoning level configuration, fine-tuning, and agentic capabilities including function calling, tool use, and structured outputs.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1754414229,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "openai/gpt-oss-20b": {
      id: "openai/gpt-oss-20b",
      name: "OpenAI: gpt-oss-20b",
      description:
        "gpt-oss-20b is an open-weight 21B parameter model released by OpenAI under the Apache 2.0 license. It uses a Mixture-of-Experts (MoE) architecture with 3.6B active parameters per forward pass, optimized for lower-latency inference and deployability on consumer or single-GPU hardware. The model is trained in OpenAI’s Harmony response format and supports reasoning level configuration, fine-tuning, and agentic capabilities including function calling, tool use, and structured outputs.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1754414229,
      cost: {
        input: 0.03,
        output: 0.15,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "openai/o3-pro": {
      id: "openai/o3-pro",
      name: "OpenAI: o3 Pro",
      description:
        "The o-series of models are trained with reinforcement learning to think before they answer and perform complex reasoning. The o3-pro model uses more compute to think harder and provide consistently better answers.\n\nNote that BYOK is required for this model. Set up here: https://openrouter.ai/settings/integrations",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1749598352,
      cost: {
        input: 20,
        output: 80,
        reasoning: 0,
      },
      limit: {
        context: 200000,
      },
    },
    "openai/codex-mini": {
      id: "openai/codex-mini",
      name: "OpenAI: Codex Mini",
      description:
        "codex-mini-latest is a fine-tuned version of o4-mini specifically for use in Codex CLI. For direct use in the API, we recommend starting with gpt-4.1.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1747409761,
      cost: {
        input: 1.5,
        output: 6,
        reasoning: 0,
        cache_read: 0.375,
      },
      limit: {
        context: 200000,
      },
    },
    "openai/o4-mini-high": {
      id: "openai/o4-mini-high",
      name: "OpenAI: o4 Mini High",
      description:
        "OpenAI o4-mini-high is the same model as [o4-mini](/openai/o4-mini) with reasoning_effort set to high. \n\nOpenAI o4-mini is a compact reasoning model in the o-series, optimized for fast, cost-efficient performance while retaining strong multimodal and agentic capabilities. It supports tool use and demonstrates competitive reasoning and coding performance across benchmarks like AIME (99.5% with Python) and SWE-bench, outperforming its predecessor o3-mini and even approaching o3 in some domains.\n\nDespite its smaller size, o4-mini exhibits high accuracy in STEM tasks, visual problem solving (e.g., MathVista, MMMU), and code editing. It is especially well-suited for high-throughput scenarios where latency or cost is critical. Thanks to its efficient architecture and refined reinforcement learning training, o4-mini can chain tools, generate structured outputs, and solve multi-step tasks with minimal delay—often in under a minute.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1744824212,
      cost: {
        input: 1.1,
        output: 4.4,
        reasoning: 0,
        cache_read: 0.275,
      },
      limit: {
        context: 200000,
      },
    },
    "openai/o3": {
      id: "openai/o3",
      name: "OpenAI: o3",
      description:
        "o3 is a well-rounded and powerful model across domains. It sets a new standard for math, science, coding, and visual reasoning tasks. It also excels at technical writing and instruction-following. Use it to think through multi-step problems that involve analysis across text, code, and images. ",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1744823457,
      cost: {
        input: 2,
        output: 8,
        reasoning: 0,
        cache_read: 0.5,
      },
      limit: {
        context: 200000,
      },
    },
    "openai/o4-mini": {
      id: "openai/o4-mini",
      name: "OpenAI: o4 Mini",
      description:
        "OpenAI o4-mini is a compact reasoning model in the o-series, optimized for fast, cost-efficient performance while retaining strong multimodal and agentic capabilities. It supports tool use and demonstrates competitive reasoning and coding performance across benchmarks like AIME (99.5% with Python) and SWE-bench, outperforming its predecessor o3-mini and even approaching o3 in some domains.\n\nDespite its smaller size, o4-mini exhibits high accuracy in STEM tasks, visual problem solving (e.g., MathVista, MMMU), and code editing. It is especially well-suited for high-throughput scenarios where latency or cost is critical. Thanks to its efficient architecture and refined reinforcement learning training, o4-mini can chain tools, generate structured outputs, and solve multi-step tasks with minimal delay—often in under a minute.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1744820942,
      cost: {
        input: 1.1,
        output: 4.4,
        reasoning: 0,
        cache_read: 0.275,
      },
      limit: {
        context: 200000,
      },
    },
    "openai/gpt-4.1": {
      id: "openai/gpt-4.1",
      name: "OpenAI: GPT-4.1",
      description:
        "GPT-4.1 is a flagship large language model optimized for advanced instruction following, real-world software engineering, and long-context reasoning. It supports a 1 million token context window and outperforms GPT-4o and GPT-4.5 across coding (54.6% SWE-bench Verified), instruction compliance (87.4% IFEval), and multimodal understanding benchmarks. It is tuned for precise code diffs, agent reliability, and high recall in large document contexts, making it ideal for agents, IDE tooling, and enterprise knowledge retrieval.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1744651385,
      cost: {
        input: 2,
        output: 8,
        reasoning: 0,
        cache_read: 0.5,
      },
      limit: {
        context: 1047576,
      },
    },
    "openai/gpt-4.1-mini": {
      id: "openai/gpt-4.1-mini",
      name: "OpenAI: GPT-4.1 Mini",
      description:
        "GPT-4.1 Mini is a mid-sized model delivering performance competitive with GPT-4o at substantially lower latency and cost. It retains a 1 million token context window and scores 45.1% on hard instruction evals, 35.8% on MultiChallenge, and 84.1% on IFEval. Mini also shows strong coding ability (e.g., 31.6% on Aider’s polyglot diff benchmark) and vision understanding, making it suitable for interactive applications with tight performance constraints.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1744651381,
      cost: {
        input: 0.4,
        output: 1.6,
        reasoning: 0,
        cache_read: 0.1,
      },
      limit: {
        context: 1047576,
      },
    },
    "openai/gpt-4.1-nano": {
      id: "openai/gpt-4.1-nano",
      name: "OpenAI: GPT-4.1 Nano",
      description:
        "For tasks that demand low latency, GPT‑4.1 nano is the fastest and cheapest model in the GPT-4.1 series. It delivers exceptional performance at a small size with its 1 million token context window, and scores 80.1% on MMLU, 50.3% on GPQA, and 9.8% on Aider polyglot coding – even higher than GPT‑4o mini. It’s ideal for tasks like classification or autocompletion.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1744651369,
      cost: {
        input: 0.1,
        output: 0.4,
        reasoning: 0,
        cache_read: 0.025,
      },
      limit: {
        context: 1047576,
      },
    },
    "openai/o1-pro": {
      id: "openai/o1-pro",
      name: "OpenAI: o1-pro",
      description:
        "The o1 series of models are trained with reinforcement learning to think before they answer and perform complex reasoning. The o1-pro model uses more compute to think harder and provide consistently better answers.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1742423211,
      cost: {
        input: 150,
        output: 600,
        reasoning: 0,
      },
      limit: {
        context: 200000,
      },
    },
    "openai/gpt-4o-mini-search-preview": {
      id: "openai/gpt-4o-mini-search-preview",
      name: "OpenAI: GPT-4o-mini Search Preview",
      description:
        "GPT-4o mini Search Preview is a specialized model for web search in Chat Completions. It is trained to understand and execute web search queries.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1741818122,
      cost: {
        input: 0.15,
        output: 0.6,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "openai/gpt-4o-search-preview": {
      id: "openai/gpt-4o-search-preview",
      name: "OpenAI: GPT-4o Search Preview",
      description:
        "GPT-4o Search Previewis a specialized model for web search in Chat Completions. It is trained to understand and execute web search queries.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1741817949,
      cost: {
        input: 2.5,
        output: 10,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "openai/o3-mini-high": {
      id: "openai/o3-mini-high",
      name: "OpenAI: o3 Mini High",
      description:
        "OpenAI o3-mini-high is the same model as [o3-mini](/openai/o3-mini) with reasoning_effort set to high. \n\no3-mini is a cost-efficient language model optimized for STEM reasoning tasks, particularly excelling in science, mathematics, and coding. The model features three adjustable reasoning effort levels and supports key developer capabilities including function calling, structured outputs, and streaming, though it does not include vision processing capabilities.\n\nThe model demonstrates significant improvements over its predecessor, with expert testers preferring its responses 56% of the time and noting a 39% reduction in major errors on complex questions. With medium reasoning effort settings, o3-mini matches the performance of the larger o1 model on challenging reasoning evaluations like AIME and GPQA, while maintaining lower latency and cost.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1739372611,
      cost: {
        input: 1.1,
        output: 4.4,
        reasoning: 0,
        cache_read: 0.55,
      },
      limit: {
        context: 200000,
      },
    },
    "openai/o3-mini": {
      id: "openai/o3-mini",
      name: "OpenAI: o3 Mini",
      description:
        'OpenAI o3-mini is a cost-efficient language model optimized for STEM reasoning tasks, particularly excelling in science, mathematics, and coding.\n\nThis model supports the `reasoning_effort` parameter, which can be set to "high", "medium", or "low" to control the thinking time of the model. The default is "medium". OpenRouter also offers the model slug `openai/o3-mini-high` to default the parameter to "high".\n\nThe model features three adjustable reasoning effort levels and supports key developer capabilities including function calling, structured outputs, and streaming, though it does not include vision processing capabilities.\n\nThe model demonstrates significant improvements over its predecessor, with expert testers preferring its responses 56% of the time and noting a 39% reduction in major errors on complex questions. With medium reasoning effort settings, o3-mini matches the performance of the larger o1 model on challenging reasoning evaluations like AIME and GPQA, while maintaining lower latency and cost.',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1738351721,
      cost: {
        input: 1.1,
        output: 4.4,
        reasoning: 0,
        cache_read: 0.55,
      },
      limit: {
        context: 200000,
      },
    },
    "openai/o1": {
      id: "openai/o1",
      name: "OpenAI: o1",
      description:
        "The latest and strongest model family from OpenAI, o1 is designed to spend more time thinking before responding. The o1 model series is trained with large-scale reinforcement learning to reason using chain of thought. \n\nThe o1 models are optimized for math, science, programming, and other STEM-related tasks. They consistently exhibit PhD-level accuracy on benchmarks in physics, chemistry, and biology. Learn more in the [launch announcement](https://openai.com/o1).\n",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1734459999,
      cost: {
        input: 15,
        output: 60,
        reasoning: 0,
        cache_read: 7.5,
      },
      limit: {
        context: 200000,
      },
    },
    "openai/gpt-4o-2024-11-20": {
      id: "openai/gpt-4o-2024-11-20",
      name: "OpenAI: GPT-4o (2024-11-20)",
      description:
        'The 2024-11-20 version of GPT-4o offers a leveled-up creative writing ability with more natural, engaging, and tailored writing to improve relevance & readability. It’s also better at working with uploaded files, providing deeper insights & more thorough responses.\n\nGPT-4o ("o" for "omni") is OpenAI\'s latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1732127594,
      cost: {
        input: 2.5,
        output: 10,
        reasoning: 0,
        cache_read: 1.25,
      },
      limit: {
        context: 128000,
      },
    },
    "openai/o1-mini-2024-09-12": {
      id: "openai/o1-mini-2024-09-12",
      name: "OpenAI: o1-mini (2024-09-12)",
      description:
        "The latest and strongest model family from OpenAI, o1 is designed to spend more time thinking before responding.\n\nThe o1 models are optimized for math, science, programming, and other STEM-related tasks. They consistently exhibit PhD-level accuracy on benchmarks in physics, chemistry, and biology. Learn more in the [launch announcement](https://openai.com/o1).\n\nNote: This model is currently experimental and not suitable for production use-cases, and may be heavily rate-limited.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1726099200,
      cost: {
        input: 1.1,
        output: 4.4,
        reasoning: 0,
        cache_read: 0.55,
      },
      limit: {
        context: 128000,
      },
    },
    "openai/o1-mini": {
      id: "openai/o1-mini",
      name: "OpenAI: o1-mini",
      description:
        "The latest and strongest model family from OpenAI, o1 is designed to spend more time thinking before responding.\n\nThe o1 models are optimized for math, science, programming, and other STEM-related tasks. They consistently exhibit PhD-level accuracy on benchmarks in physics, chemistry, and biology. Learn more in the [launch announcement](https://openai.com/o1).\n\nNote: This model is currently experimental and not suitable for production use-cases, and may be heavily rate-limited.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1726099200,
      cost: {
        input: 1.1,
        output: 4.4,
        reasoning: 0,
        cache_read: 0.55,
      },
      limit: {
        context: 128000,
      },
    },
    "openai/chatgpt-4o-latest": {
      id: "openai/chatgpt-4o-latest",
      name: "OpenAI: ChatGPT-4o",
      description:
        "OpenAI ChatGPT 4o is continually updated by OpenAI to point to the current version of GPT-4o used by ChatGPT. It therefore differs slightly from the API version of [GPT-4o](/models/openai/gpt-4o) in that it has additional RLHF. It is intended for research and evaluation.\n\nOpenAI notes that this model is not suited for production use-cases as it may be removed or redirected to another model in the future.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1723593600,
      cost: {
        input: 5,
        output: 15,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "openai/gpt-4o-2024-08-06": {
      id: "openai/gpt-4o-2024-08-06",
      name: "OpenAI: GPT-4o (2024-08-06)",
      description:
        'The 2024-08-06 version of GPT-4o offers improved performance in structured outputs, with the ability to supply a JSON schema in the respone_format. Read more [here](https://openai.com/index/introducing-structured-outputs-in-the-api/).\n\nGPT-4o ("o" for "omni") is OpenAI\'s latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.\n\nFor benchmarking against other models, it was briefly called ["im-also-a-good-gpt2-chatbot"](https://twitter.com/LiamFedus/status/1790064963966370209)',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1722902400,
      cost: {
        input: 2.5,
        output: 10,
        reasoning: 0,
        cache_read: 1.25,
      },
      limit: {
        context: 128000,
      },
    },
    "openai/gpt-4o-mini": {
      id: "openai/gpt-4o-mini",
      name: "OpenAI: GPT-4o-mini",
      description:
        "GPT-4o mini is OpenAI's newest model after [GPT-4 Omni](/models/openai/gpt-4o), supporting both text and image inputs with text outputs.\n\nAs their most advanced small model, it is many multiples more affordable than other recent frontier models, and more than 60% cheaper than [GPT-3.5 Turbo](/models/openai/gpt-3.5-turbo). It maintains SOTA intelligence, while being significantly more cost-effective.\n\nGPT-4o mini achieves an 82% score on MMLU and presently ranks higher than GPT-4 on chat preferences [common leaderboards](https://arena.lmsys.org/).\n\nCheck out the [launch announcement](https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/) to learn more.\n\n#multimodal",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1721260800,
      cost: {
        input: 0.15,
        output: 0.6,
        reasoning: 0,
        cache_read: 0.075,
      },
      limit: {
        context: 128000,
      },
    },
    "openai/gpt-4o-mini-2024-07-18": {
      id: "openai/gpt-4o-mini-2024-07-18",
      name: "OpenAI: GPT-4o-mini (2024-07-18)",
      description:
        "GPT-4o mini is OpenAI's newest model after [GPT-4 Omni](/models/openai/gpt-4o), supporting both text and image inputs with text outputs.\n\nAs their most advanced small model, it is many multiples more affordable than other recent frontier models, and more than 60% cheaper than [GPT-3.5 Turbo](/models/openai/gpt-3.5-turbo). It maintains SOTA intelligence, while being significantly more cost-effective.\n\nGPT-4o mini achieves an 82% score on MMLU and presently ranks higher than GPT-4 on chat preferences [common leaderboards](https://arena.lmsys.org/).\n\nCheck out the [launch announcement](https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/) to learn more.\n\n#multimodal",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1721260800,
      cost: {
        input: 0.15,
        output: 0.6,
        reasoning: 0,
        cache_read: 0.075,
      },
      limit: {
        context: 128000,
      },
    },
    "openai/gpt-4o": {
      id: "openai/gpt-4o",
      name: "OpenAI: GPT-4o",
      description:
        'GPT-4o ("o" for "omni") is OpenAI\'s latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.\n\nFor benchmarking against other models, it was briefly called ["im-also-a-good-gpt2-chatbot"](https://twitter.com/LiamFedus/status/1790064963966370209)\n\n#multimodal',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1715558400,
      cost: {
        input: 2.5,
        output: 10,
        reasoning: 0,
        cache_read: 1.25,
      },
      limit: {
        context: 128000,
      },
    },
    "openai/gpt-4o:extended": {
      id: "openai/gpt-4o:extended",
      name: "OpenAI: GPT-4o (extended)",
      description:
        'GPT-4o ("o" for "omni") is OpenAI\'s latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.\n\nFor benchmarking against other models, it was briefly called ["im-also-a-good-gpt2-chatbot"](https://twitter.com/LiamFedus/status/1790064963966370209)\n\n#multimodal',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1715558400,
      cost: {
        input: 6,
        output: 18,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "openai/gpt-4o-2024-05-13": {
      id: "openai/gpt-4o-2024-05-13",
      name: "OpenAI: GPT-4o (2024-05-13)",
      description:
        'GPT-4o ("o" for "omni") is OpenAI\'s latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.\n\nFor benchmarking against other models, it was briefly called ["im-also-a-good-gpt2-chatbot"](https://twitter.com/LiamFedus/status/1790064963966370209)\n\n#multimodal',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1715558400,
      cost: {
        input: 5,
        output: 15,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "openai/gpt-4-turbo": {
      id: "openai/gpt-4-turbo",
      name: "OpenAI: GPT-4 Turbo",
      description:
        "The latest GPT-4 Turbo model with vision capabilities. Vision requests can now use JSON mode and function calling.\n\nTraining data: up to December 2023.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1712620800,
      cost: {
        input: 10,
        output: 30,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "openai/gpt-3.5-turbo-0613": {
      id: "openai/gpt-3.5-turbo-0613",
      name: "OpenAI: GPT-3.5 Turbo (older v0613)",
      description:
        "GPT-3.5 Turbo is OpenAI's fastest model. It can understand and generate natural language or code, and is optimized for chat and traditional completion tasks.\n\nTraining data up to Sep 2021.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1706140800,
      cost: {
        input: 1,
        output: 2,
        reasoning: 0,
      },
      limit: {
        context: 4095,
      },
    },
    "openai/gpt-4-turbo-preview": {
      id: "openai/gpt-4-turbo-preview",
      name: "OpenAI: GPT-4 Turbo Preview",
      description:
        "The preview GPT-4 model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Training data: up to Dec 2023.\n\n**Note:** heavily rate limited by OpenAI while in preview.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1706140800,
      cost: {
        input: 10,
        output: 30,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "openai/gpt-4-1106-preview": {
      id: "openai/gpt-4-1106-preview",
      name: "OpenAI: GPT-4 Turbo (older v1106)",
      description:
        "The latest GPT-4 Turbo model with vision capabilities. Vision requests can now use JSON mode and function calling.\n\nTraining data: up to April 2023.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1699228800,
      cost: {
        input: 10,
        output: 30,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "openai/gpt-3.5-turbo-instruct": {
      id: "openai/gpt-3.5-turbo-instruct",
      name: "OpenAI: GPT-3.5 Turbo Instruct",
      description:
        "This model is a variant of GPT-3.5 Turbo tuned for instructional prompts and omitting chat-related optimizations. Training data: up to Sep 2021.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1695859200,
      cost: {
        input: 1.5,
        output: 2,
        reasoning: 0,
      },
      limit: {
        context: 4095,
      },
    },
    "openai/gpt-3.5-turbo-16k": {
      id: "openai/gpt-3.5-turbo-16k",
      name: "OpenAI: GPT-3.5 Turbo 16k",
      description:
        "This model offers four times the context length of gpt-3.5-turbo, allowing it to support approximately 20 pages of text in a single request at a higher cost. Training data: up to Sep 2021.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1693180800,
      cost: {
        input: 3,
        output: 4,
        reasoning: 0,
      },
      limit: {
        context: 16385,
      },
    },
    "openai/gpt-4": {
      id: "openai/gpt-4",
      name: "OpenAI: GPT-4",
      description:
        "OpenAI's flagship model, GPT-4 is a large-scale multimodal language model capable of solving difficult problems with greater accuracy than previous models due to its broader general knowledge and advanced reasoning capabilities. Training data: up to Sep 2021.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1685232000,
      cost: {
        input: 30,
        output: 60,
        reasoning: 0,
      },
      limit: {
        context: 8191,
      },
    },
    "openai/gpt-3.5-turbo": {
      id: "openai/gpt-3.5-turbo",
      name: "OpenAI: GPT-3.5 Turbo",
      description:
        "GPT-3.5 Turbo is OpenAI's fastest model. It can understand and generate natural language or code, and is optimized for chat and traditional completion tasks.\n\nTraining data up to Sep 2021.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1685232000,
      cost: {
        input: 0.5,
        output: 1.5,
        reasoning: 0,
      },
      limit: {
        context: 16385,
      },
    },
    "openai/gpt-4-0314": {
      id: "openai/gpt-4-0314",
      name: "OpenAI: GPT-4 (older v0314)",
      description:
        "GPT-4-0314 is the first version of GPT-4 released, with a context length of 8,192 tokens, and was supported until June 14. Training data: up to Sep 2021.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1685232000,
      cost: {
        input: 30,
        output: 60,
        reasoning: 0,
      },
      limit: {
        context: 8191,
      },
    },
  },
} as const;
export default openaiProvider;
