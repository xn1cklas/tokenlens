export const anthropicProvider = {
  id: "anthropic",
  name: "anthropic",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "anthropic/claude-opus-4.1": {
      id: "anthropic/claude-opus-4.1",
      name: "Anthropic: Claude Opus 4.1",
      description:
        "Claude Opus 4.1 is an updated version of Anthropic’s flagship model, offering improved performance in coding, reasoning, and agentic tasks. It achieves 74.5% on SWE-bench Verified and shows notable gains in multi-file code refactoring, debugging precision, and detail-oriented reasoning. The model supports extended thinking up to 64K tokens and is optimized for tasks involving research, data analysis, and tool-assisted reasoning.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1754411591,
      cost: {
        input: 15,
        output: 75,
        reasoning: 0,
        cache_read: 1.5,
        cache_write: 18.75,
      },
      limit: {
        context: 200000,
      },
    },
    "anthropic/claude-opus-4": {
      id: "anthropic/claude-opus-4",
      name: "Anthropic: Claude Opus 4",
      description:
        "Claude Opus 4 is benchmarked as the world’s best coding model, at time of release, bringing sustained performance on complex, long-running tasks and agent workflows. It sets new benchmarks in software engineering, achieving leading results on SWE-bench (72.5%) and Terminal-bench (43.2%). Opus 4 supports extended, agentic workflows, handling thousands of task steps continuously for hours without degradation. \n\nRead more at the [blog post here](https://www.anthropic.com/news/claude-4)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1747931245,
      cost: {
        input: 15,
        output: 75,
        reasoning: 0,
        cache_read: 1.5,
        cache_write: 18.75,
      },
      limit: {
        context: 200000,
      },
    },
    "anthropic/claude-sonnet-4": {
      id: "anthropic/claude-sonnet-4",
      name: "Anthropic: Claude Sonnet 4",
      description:
        "Claude Sonnet 4 significantly enhances the capabilities of its predecessor, Sonnet 3.7, excelling in both coding and reasoning tasks with improved precision and controllability. Achieving state-of-the-art performance on SWE-bench (72.7%), Sonnet 4 balances capability and computational efficiency, making it suitable for a broad range of applications from routine coding tasks to complex software development projects. Key enhancements include improved autonomous codebase navigation, reduced error rates in agent-driven workflows, and increased reliability in following intricate instructions. Sonnet 4 is optimized for practical everyday use, providing advanced reasoning capabilities while maintaining efficiency and responsiveness in diverse internal and external scenarios.\n\nRead more at the [blog post here](https://www.anthropic.com/news/claude-4)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1747930371,
      cost: {
        input: 3,
        output: 15,
        reasoning: 0,
        cache_read: 0.3,
        cache_write: 3.75,
      },
      limit: {
        context: 1000000,
      },
    },
    "anthropic/claude-3.7-sonnet": {
      id: "anthropic/claude-3.7-sonnet",
      name: "Anthropic: Claude 3.7 Sonnet",
      description:
        "Claude 3.7 Sonnet is an advanced large language model with improved reasoning, coding, and problem-solving capabilities. It introduces a hybrid reasoning approach, allowing users to choose between rapid responses and extended, step-by-step processing for complex tasks. The model demonstrates notable improvements in coding, particularly in front-end development and full-stack updates, and excels in agentic workflows, where it can autonomously navigate multi-step processes. \n\nClaude 3.7 Sonnet maintains performance parity with its predecessor in standard mode while offering an extended reasoning mode for enhanced accuracy in math, coding, and instruction-following tasks.\n\nRead more at the [blog post here](https://www.anthropic.com/news/claude-3-7-sonnet)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1740422110,
      cost: {
        input: 3,
        output: 15,
        reasoning: 0,
        cache_read: 0.3,
        cache_write: 3.75,
      },
      limit: {
        context: 200000,
      },
    },
    "anthropic/claude-3.7-sonnet:thinking": {
      id: "anthropic/claude-3.7-sonnet:thinking",
      name: "Anthropic: Claude 3.7 Sonnet (thinking)",
      description:
        "Claude 3.7 Sonnet is an advanced large language model with improved reasoning, coding, and problem-solving capabilities. It introduces a hybrid reasoning approach, allowing users to choose between rapid responses and extended, step-by-step processing for complex tasks. The model demonstrates notable improvements in coding, particularly in front-end development and full-stack updates, and excels in agentic workflows, where it can autonomously navigate multi-step processes. \n\nClaude 3.7 Sonnet maintains performance parity with its predecessor in standard mode while offering an extended reasoning mode for enhanced accuracy in math, coding, and instruction-following tasks.\n\nRead more at the [blog post here](https://www.anthropic.com/news/claude-3-7-sonnet)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1740422110,
      cost: {
        input: 3,
        output: 15,
        reasoning: 0,
        cache_read: 0.3,
        cache_write: 3.75,
      },
      limit: {
        context: 200000,
      },
    },
    "anthropic/claude-3.5-haiku-20241022": {
      id: "anthropic/claude-3.5-haiku-20241022",
      name: "Anthropic: Claude 3.5 Haiku (2024-10-22)",
      description:
        "Claude 3.5 Haiku features enhancements across all skill sets including coding, tool use, and reasoning. As the fastest model in the Anthropic lineup, it offers rapid response times suitable for applications that require high interactivity and low latency, such as user-facing chatbots and on-the-fly code completions. It also excels in specialized tasks like data extraction and real-time content moderation, making it a versatile tool for a broad range of industries.\n\nIt does not support image inputs.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/3-5-models-and-computer-use)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1730678400,
      cost: {
        input: 0.8,
        output: 4,
        reasoning: 0,
        cache_read: 0.08,
        cache_write: 1,
      },
      limit: {
        context: 200000,
      },
    },
    "anthropic/claude-3.5-haiku": {
      id: "anthropic/claude-3.5-haiku",
      name: "Anthropic: Claude 3.5 Haiku",
      description:
        "Claude 3.5 Haiku features offers enhanced capabilities in speed, coding accuracy, and tool use. Engineered to excel in real-time applications, it delivers quick response times that are essential for dynamic tasks such as chat interactions and immediate coding suggestions.\n\nThis makes it highly suitable for environments that demand both speed and precision, such as software development, customer service bots, and data management systems.\n\nThis model is currently pointing to [Claude 3.5 Haiku (2024-10-22)](/anthropic/claude-3-5-haiku-20241022).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1730678400,
      cost: {
        input: 0.8,
        output: 4,
        reasoning: 0,
        cache_read: 0.08,
        cache_write: 1,
      },
      limit: {
        context: 200000,
      },
    },
    "anthropic/claude-3.5-sonnet": {
      id: "anthropic/claude-3.5-sonnet",
      name: "Anthropic: Claude 3.5 Sonnet",
      description:
        "New Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at:\n\n- Coding: Scores ~49% on SWE-Bench Verified, higher than the last best score, and without any fancy prompt scaffolding\n- Data science: Augments human data science expertise; navigates unstructured data while using multiple tools for insights\n- Visual processing: excelling at interpreting charts, graphs, and images, accurately transcribing text to derive insights beyond just the text alone\n- Agentic tasks: exceptional tool use, making it great at agentic tasks (i.e. complex, multi-step problem solving tasks that require engaging with other systems)\n\n#multimodal",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1729555200,
      cost: {
        input: 3,
        output: 15,
        reasoning: 0,
        cache_read: 0.3,
        cache_write: 3.75,
      },
      limit: {
        context: 200000,
      },
    },
    "anthropic/claude-3.5-sonnet-20240620": {
      id: "anthropic/claude-3.5-sonnet-20240620",
      name: "Anthropic: Claude 3.5 Sonnet (2024-06-20)",
      description:
        "Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at:\n\n- Coding: Autonomously writes, edits, and runs code with reasoning and troubleshooting\n- Data science: Augments human data science expertise; navigates unstructured data while using multiple tools for insights\n- Visual processing: excelling at interpreting charts, graphs, and images, accurately transcribing text to derive insights beyond just the text alone\n- Agentic tasks: exceptional tool use, making it great at agentic tasks (i.e. complex, multi-step problem solving tasks that require engaging with other systems)\n\nFor the latest version (2024-10-23), check out [Claude 3.5 Sonnet](/anthropic/claude-3.5-sonnet).\n\n#multimodal",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1718841600,
      cost: {
        input: 3,
        output: 15,
        reasoning: 0,
        cache_read: 0.3,
        cache_write: 3.75,
      },
      limit: {
        context: 200000,
      },
    },
    "anthropic/claude-3-haiku": {
      id: "anthropic/claude-3-haiku",
      name: "Anthropic: Claude 3 Haiku",
      description:
        "Claude 3 Haiku is Anthropic's fastest and most compact model for\nnear-instant responsiveness. Quick and accurate targeted performance.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-haiku)\n\n#multimodal",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1710288000,
      cost: {
        input: 0.25,
        output: 1.25,
        reasoning: 0,
        cache_read: 0.03,
        cache_write: 0.3,
      },
      limit: {
        context: 200000,
      },
    },
    "anthropic/claude-3-opus": {
      id: "anthropic/claude-3-opus",
      name: "Anthropic: Claude 3 Opus",
      description:
        "Claude 3 Opus is Anthropic's most powerful model for highly complex tasks. It boasts top-level performance, intelligence, fluency, and understanding.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-family)\n\n#multimodal",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1709596800,
      cost: {
        input: 15,
        output: 75,
        reasoning: 0,
        cache_read: 1.5,
        cache_write: 18.75,
      },
      limit: {
        context: 200000,
      },
    },
  },
} as const;
export default anthropicProvider;
