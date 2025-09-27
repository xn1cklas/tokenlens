export const qwenProvider = {
  id: "qwen",
  name: "qwen",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "qwen/qwen3-vl-235b-a22b-thinking": {
      id: "qwen/qwen3-vl-235b-a22b-thinking",
      name: "Qwen: Qwen3 VL 235B A22B Thinking",
      description:
        "Qwen3-VL-235B-A22B Thinking is a multimodal model that unifies strong text generation with visual understanding across images and video. The Thinking model is optimized for multimodal reasoning in STEM and math. The series emphasizes robust perception (recognition of diverse real-world and synthetic categories), spatial understanding (2D/3D grounding), and long-form visual comprehension, with competitive results on public multimodal benchmarks for both perception and reasoning.\n\nBeyond analysis, Qwen3-VL supports agentic interaction and tool use: it can follow complex instructions over multi-image, multi-turn dialogues; align text to video timelines for precise temporal queries; and operate GUI elements for automation tasks. The models also enable visual coding workflows, turning sketches or mockups into code and assisting with UI debugging, while maintaining strong text-only performance comparable to the flagship Qwen3 language models. This makes Qwen3-VL suitable for production scenarios spanning document AI, multilingual OCR, software/UI assistance, spatial/embodied tasks, and research on vision-language agents.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1758668690,
      cost: {
        input: 0.3,
        output: 3,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "qwen/qwen3-vl-235b-a22b-instruct": {
      id: "qwen/qwen3-vl-235b-a22b-instruct",
      name: "Qwen: Qwen3 VL 235B A22B Instruct",
      description:
        "Qwen3-VL-235B-A22B Instruct is an open-weight multimodal model that unifies strong text generation with visual understanding across images and video. The Instruct model targets general vision-language use (VQA, document parsing, chart/table extraction, multilingual OCR). The series emphasizes robust perception (recognition of diverse real-world and synthetic categories), spatial understanding (2D/3D grounding), and long-form visual comprehension, with competitive results on public multimodal benchmarks for both perception and reasoning.\n\nBeyond analysis, Qwen3-VL supports agentic interaction and tool use: it can follow complex instructions over multi-image, multi-turn dialogues; align text to video timelines for precise temporal queries; and operate GUI elements for automation tasks. The models also enable visual coding workflows—turning sketches or mockups into code and assisting with UI debugging—while maintaining strong text-only performance comparable to the flagship Qwen3 language models. This makes Qwen3-VL suitable for production scenarios spanning document AI, multilingual OCR, software/UI assistance, spatial/embodied tasks, and research on vision-language agents.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1758668687,
      cost: {
        input: 0.3,
        output: 1.5,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "qwen/qwen3-max": {
      id: "qwen/qwen3-max",
      name: "Qwen: Qwen3 Max",
      description:
        "Qwen3-Max is an updated release built on the Qwen3 series, offering major improvements in reasoning, instruction following, multilingual support, and long-tail knowledge coverage compared to the January 2025 version. It delivers higher accuracy in math, coding, logic, and science tasks, follows complex instructions in Chinese and English more reliably, reduces hallucinations, and produces higher-quality responses for open-ended Q&A, writing, and conversation. The model supports over 100 languages with stronger translation and commonsense reasoning, and is optimized for retrieval-augmented generation (RAG) and tool calling, though it does not include a dedicated “thinking” mode.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1758662808,
      cost: {
        input: 1.2,
        output: 6,
        reasoning: 0,
        cache_read: 0.24,
      },
      limit: {
        context: 256000,
      },
    },
    "qwen/qwen3-coder-plus": {
      id: "qwen/qwen3-coder-plus",
      name: "Qwen: Qwen3 Coder Plus",
      description:
        "Qwen3 Coder Plus is Alibaba's proprietary version of the Open Source Qwen3 Coder 480B A35B. It is a powerful coding agent model specializing in autonomous programming via tool calling and environment interaction, combining coding proficiency with versatile general-purpose abilities.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1758662707,
      cost: {
        input: 1,
        output: 5,
        reasoning: 0,
        cache_read: 0.1,
      },
      limit: {
        context: 128000,
      },
    },
    "qwen/qwen3-coder-flash": {
      id: "qwen/qwen3-coder-flash",
      name: "Qwen: Qwen3 Coder Flash",
      description:
        "Qwen3 Coder Flash is Alibaba's fast and cost efficient version of their proprietary Qwen3 Coder Plus. It is a powerful coding agent model specializing in autonomous programming via tool calling and environment interaction, combining coding proficiency with versatile general-purpose abilities.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1758115536,
      cost: {
        input: 0.3,
        output: 1.5,
        reasoning: 0,
        cache_read: 0.08,
      },
      limit: {
        context: 128000,
      },
    },
    "qwen/qwen3-next-80b-a3b-thinking": {
      id: "qwen/qwen3-next-80b-a3b-thinking",
      name: "Qwen: Qwen3 Next 80B A3B Thinking",
      description:
        "Qwen3-Next-80B-A3B-Thinking is a reasoning-first chat model in the Qwen3-Next line that outputs structured “thinking” traces by default. It’s designed for hard multi-step problems; math proofs, code synthesis/debugging, logic, and agentic planning, and reports strong results across knowledge, reasoning, coding, alignment, and multilingual evaluations. Compared with prior Qwen3 variants, it emphasizes stability under long chains of thought and efficient scaling during inference, and it is tuned to follow complex instructions while reducing repetitive or off-task behavior.\n\nThe model is suitable for agent frameworks and tool use (function calling), retrieval-heavy workflows, and standardized benchmarking where step-by-step solutions are required. It supports long, detailed completions and leverages throughput-oriented techniques (e.g., multi-token prediction) for faster generation. Note that it operates in thinking-only mode.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1757612284,
      cost: {
        input: 0.1,
        output: 0.8,
        reasoning: 0,
      },
      limit: {
        context: 262144,
      },
    },
    "qwen/qwen3-next-80b-a3b-instruct": {
      id: "qwen/qwen3-next-80b-a3b-instruct",
      name: "Qwen: Qwen3 Next 80B A3B Instruct",
      description:
        "Qwen3-Next-80B-A3B-Instruct is an instruction-tuned chat model in the Qwen3-Next series optimized for fast, stable responses without “thinking” traces. It targets complex tasks across reasoning, code generation, knowledge QA, and multilingual use, while remaining robust on alignment and formatting. Compared with prior Qwen3 instruct variants, it focuses on higher throughput and stability on ultra-long inputs and multi-turn dialogues, making it well-suited for RAG, tool use, and agentic workflows that require consistent final answers rather than visible chain-of-thought.\n\nThe model employs scaling-efficient training and decoding to improve parameter efficiency and inference speed, and has been validated on a broad set of public benchmarks where it reaches or approaches larger Qwen3 systems in several categories while outperforming earlier mid-sized baselines. It is best used as a general assistant, code helper, and long-context task solver in production settings where deterministic, instruction-following outputs are preferred.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1757612213,
      cost: {
        input: 0.1,
        output: 0.8,
        reasoning: 0,
      },
      limit: {
        context: 262144,
      },
    },
    "qwen/qwen-plus-2025-07-28": {
      id: "qwen/qwen-plus-2025-07-28",
      name: "Qwen: Qwen Plus 0728",
      description:
        "Qwen Plus 0728, based on the Qwen3 foundation model, is a 1 million context hybrid reasoning model with a balanced performance, speed, and cost combination.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1757347599,
      cost: {
        input: 0.4,
        output: 1.2,
        reasoning: 0,
      },
      limit: {
        context: 1000000,
      },
    },
    "qwen/qwen-plus-2025-07-28:thinking": {
      id: "qwen/qwen-plus-2025-07-28:thinking",
      name: "Qwen: Qwen Plus 0728 (thinking)",
      description:
        "Qwen Plus 0728, based on the Qwen3 foundation model, is a 1 million context hybrid reasoning model with a balanced performance, speed, and cost combination.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1757347599,
      cost: {
        input: 0.4,
        output: 4,
        reasoning: 0,
      },
      limit: {
        context: 1000000,
      },
    },
    "qwen/qwen3-30b-a3b-thinking-2507": {
      id: "qwen/qwen3-30b-a3b-thinking-2507",
      name: "Qwen: Qwen3 30B A3B Thinking 2507",
      description:
        "Qwen3-30B-A3B-Thinking-2507 is a 30B parameter Mixture-of-Experts reasoning model optimized for complex tasks requiring extended multi-step thinking. The model is designed specifically for “thinking mode,” where internal reasoning traces are separated from final answers.\n\nCompared to earlier Qwen3-30B releases, this version improves performance across logical reasoning, mathematics, science, coding, and multilingual benchmarks. It also demonstrates stronger instruction following, tool use, and alignment with human preferences. With higher reasoning efficiency and extended output budgets, it is best suited for advanced research, competitive problem solving, and agentic applications requiring structured long-context reasoning.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1756399192,
      cost: {
        input: 0.08,
        output: 0.29,
        reasoning: 0,
      },
      limit: {
        context: 262144,
      },
    },
    "qwen/qwen3-coder-30b-a3b-instruct": {
      id: "qwen/qwen3-coder-30b-a3b-instruct",
      name: "Qwen: Qwen3 Coder 30B A3B Instruct",
      description:
        "Qwen3-Coder-30B-A3B-Instruct is a 30.5B parameter Mixture-of-Experts (MoE) model with 128 experts (8 active per forward pass), designed for advanced code generation, repository-scale understanding, and agentic tool use. Built on the Qwen3 architecture, it supports a native context length of 256K tokens (extendable to 1M with Yarn) and performs strongly in tasks involving function calls, browser use, and structured code completion.\n\nThis model is optimized for instruction-following without “thinking mode”, and integrates well with OpenAI-compatible tool-use formats. ",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1753972379,
      cost: {
        input: 0.07,
        output: 0.28,
        reasoning: 0,
      },
      limit: {
        context: 262144,
      },
    },
    "qwen/qwen3-30b-a3b-instruct-2507": {
      id: "qwen/qwen3-30b-a3b-instruct-2507",
      name: "Qwen: Qwen3 30B A3B Instruct 2507",
      description:
        "Qwen3-30B-A3B-Instruct-2507 is a 30.5B-parameter mixture-of-experts language model from Qwen, with 3.3B active parameters per inference. It operates in non-thinking mode and is designed for high-quality instruction following, multilingual understanding, and agentic tool use. Post-trained on instruction data, it demonstrates competitive performance across reasoning (AIME, ZebraLogic), coding (MultiPL-E, LiveCodeBench), and alignment (IFEval, WritingBench) benchmarks. It outperforms its non-instruct variant on subjective and open-ended tasks while retaining strong factual and coding performance.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1753806965,
      cost: {
        input: 0.07,
        output: 0.28,
        reasoning: 0,
      },
      limit: {
        context: 262144,
      },
    },
    "qwen/qwen3-235b-a22b-thinking-2507": {
      id: "qwen/qwen3-235b-a22b-thinking-2507",
      name: "Qwen: Qwen3 235B A22B Thinking 2507",
      description:
        'Qwen3-235B-A22B-Thinking-2507 is a high-performance, open-weight Mixture-of-Experts (MoE) language model optimized for complex reasoning tasks. It activates 22B of its 235B parameters per forward pass and natively supports up to 262,144 tokens of context. This "thinking-only" variant enhances structured logical reasoning, mathematics, science, and long-form generation, showing strong benchmark performance across AIME, SuperGPQA, LiveCodeBench, and MMLU-Redux. It enforces a special reasoning mode (</think>) and is designed for high-token outputs (up to 81,920 tokens) in challenging domains.\n\nThe model is instruction-tuned and excels at step-by-step reasoning, tool use, agentic workflows, and multilingual tasks. This release represents the most capable open-source variant in the Qwen3-235B series, surpassing many closed models in structured reasoning use cases.',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1753449557,
      cost: {
        input: 0.1,
        output: 0.39,
        reasoning: 0,
      },
      limit: {
        context: 262144,
      },
    },
    "qwen/qwen3-coder:free": {
      id: "qwen/qwen3-coder:free",
      name: "Qwen: Qwen3 Coder 480B A35B (free)",
      description:
        "Qwen3-Coder-480B-A35B-Instruct is a Mixture-of-Experts (MoE) code generation model developed by the Qwen team. It is optimized for agentic coding tasks such as function calling, tool use, and long-context reasoning over repositories. The model features 480 billion total parameters, with 35 billion active per forward pass (8 out of 160 experts).\n\nPricing for the Alibaba endpoints varies by context length. Once a request is greater than 128k input tokens, the higher pricing is used.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1753230546,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 262144,
      },
    },
    "qwen/qwen3-coder": {
      id: "qwen/qwen3-coder",
      name: "Qwen: Qwen3 Coder 480B A35B",
      description:
        "Qwen3-Coder-480B-A35B-Instruct is a Mixture-of-Experts (MoE) code generation model developed by the Qwen team. It is optimized for agentic coding tasks such as function calling, tool use, and long-context reasoning over repositories. The model features 480 billion total parameters, with 35 billion active per forward pass (8 out of 160 experts).\n\nPricing for the Alibaba endpoints varies by context length. Once a request is greater than 128k input tokens, the higher pricing is used.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1753230546,
      cost: {
        input: 0.22,
        output: 0.95,
        reasoning: 0,
      },
      limit: {
        context: 262144,
      },
    },
    "qwen/qwen3-235b-a22b-2507": {
      id: "qwen/qwen3-235b-a22b-2507",
      name: "Qwen: Qwen3 235B A22B Instruct 2507",
      description:
        'Qwen3-235B-A22B-Instruct-2507 is a multilingual, instruction-tuned mixture-of-experts language model based on the Qwen3-235B architecture, with 22B active parameters per forward pass. It is optimized for general-purpose text generation, including instruction following, logical reasoning, math, code, and tool usage. The model supports a native 262K context length and does not implement "thinking mode" (<think> blocks).\n\nCompared to its base variant, this version delivers significant gains in knowledge coverage, long-context reasoning, coding benchmarks, and alignment with open-ended tasks. It is particularly strong on multilingual understanding, math reasoning (e.g., AIME, HMMT), and alignment evaluations like Arena-Hard and WritingBench.',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1753119555,
      cost: {
        input: 0.09,
        output: 0.6,
        reasoning: 0,
      },
      limit: {
        context: 262144,
      },
    },
    "qwen/qwen3-4b:free": {
      id: "qwen/qwen3-4b:free",
      name: "Qwen: Qwen3 4B (free)",
      description:
        "Qwen3-4B is a 4 billion parameter dense language model from the Qwen3 series, designed to support both general-purpose and reasoning-intensive tasks. It introduces a dual-mode architecture—thinking and non-thinking—allowing dynamic switching between high-precision logical reasoning and efficient dialogue generation. This makes it well-suited for multi-turn chat, instruction following, and complex agent workflows.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1746031104,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 40960,
      },
    },
    "qwen/qwen3-30b-a3b:free": {
      id: "qwen/qwen3-30b-a3b:free",
      name: "Qwen: Qwen3 30B A3B (free)",
      description:
        "Qwen3, the latest generation in the Qwen large language model series, features both dense and mixture-of-experts (MoE) architectures to excel in reasoning, multilingual support, and advanced agent tasks. Its unique ability to switch seamlessly between a thinking mode for complex reasoning and a non-thinking mode for efficient dialogue ensures versatile, high-quality performance.\n\nSignificantly outperforming prior models like QwQ and Qwen2.5, Qwen3 delivers superior mathematics, coding, commonsense reasoning, creative writing, and interactive dialogue capabilities. The Qwen3-30B-A3B variant includes 30.5 billion parameters (3.3 billion activated), 48 layers, 128 experts (8 activated per task), and supports up to 131K token contexts with YaRN, setting a new standard among open-source models.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1745878604,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 40960,
      },
    },
    "qwen/qwen3-30b-a3b": {
      id: "qwen/qwen3-30b-a3b",
      name: "Qwen: Qwen3 30B A3B",
      description:
        "Qwen3, the latest generation in the Qwen large language model series, features both dense and mixture-of-experts (MoE) architectures to excel in reasoning, multilingual support, and advanced agent tasks. Its unique ability to switch seamlessly between a thinking mode for complex reasoning and a non-thinking mode for efficient dialogue ensures versatile, high-quality performance.\n\nSignificantly outperforming prior models like QwQ and Qwen2.5, Qwen3 delivers superior mathematics, coding, commonsense reasoning, creative writing, and interactive dialogue capabilities. The Qwen3-30B-A3B variant includes 30.5 billion parameters (3.3 billion activated), 48 layers, 128 experts (8 activated per task), and supports up to 131K token contexts with YaRN, setting a new standard among open-source models.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1745878604,
      cost: {
        input: 0.06,
        output: 0.22,
        reasoning: 0,
      },
      limit: {
        context: 40960,
      },
    },
    "qwen/qwen3-8b:free": {
      id: "qwen/qwen3-8b:free",
      name: "Qwen: Qwen3 8B (free)",
      description:
        'Qwen3-8B is a dense 8.2B parameter causal language model from the Qwen3 series, designed for both reasoning-heavy tasks and efficient dialogue. It supports seamless switching between "thinking" mode for math, coding, and logical inference, and "non-thinking" mode for general conversation. The model is fine-tuned for instruction-following, agent integration, creative writing, and multilingual use across 100+ languages and dialects. It natively supports a 32K token context window and can extend to 131K tokens with YaRN scaling.',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1745876632,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 40960,
      },
    },
    "qwen/qwen3-8b": {
      id: "qwen/qwen3-8b",
      name: "Qwen: Qwen3 8B",
      description:
        'Qwen3-8B is a dense 8.2B parameter causal language model from the Qwen3 series, designed for both reasoning-heavy tasks and efficient dialogue. It supports seamless switching between "thinking" mode for math, coding, and logical inference, and "non-thinking" mode for general conversation. The model is fine-tuned for instruction-following, agent integration, creative writing, and multilingual use across 100+ languages and dialects. It natively supports a 32K token context window and can extend to 131K tokens with YaRN scaling.',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1745876632,
      cost: {
        input: 0.035,
        output: 0.138,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "qwen/qwen3-14b:free": {
      id: "qwen/qwen3-14b:free",
      name: "Qwen: Qwen3 14B (free)",
      description:
        'Qwen3-14B is a dense 14.8B parameter causal language model from the Qwen3 series, designed for both complex reasoning and efficient dialogue. It supports seamless switching between a "thinking" mode for tasks like math, programming, and logical inference, and a "non-thinking" mode for general-purpose conversation. The model is fine-tuned for instruction-following, agent tool use, creative writing, and multilingual tasks across 100+ languages and dialects. It natively handles 32K token contexts and can extend to 131K tokens using YaRN-based scaling.',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1745876478,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 40960,
      },
    },
    "qwen/qwen3-14b": {
      id: "qwen/qwen3-14b",
      name: "Qwen: Qwen3 14B",
      description:
        'Qwen3-14B is a dense 14.8B parameter causal language model from the Qwen3 series, designed for both complex reasoning and efficient dialogue. It supports seamless switching between a "thinking" mode for tasks like math, programming, and logical inference, and a "non-thinking" mode for general-purpose conversation. The model is fine-tuned for instruction-following, agent tool use, creative writing, and multilingual tasks across 100+ languages and dialects. It natively handles 32K token contexts and can extend to 131K tokens using YaRN-based scaling.',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1745876478,
      cost: {
        input: 0.04,
        output: 0.14,
        reasoning: 0,
      },
      limit: {
        context: 40960,
      },
    },
    "qwen/qwen3-32b": {
      id: "qwen/qwen3-32b",
      name: "Qwen: Qwen3 32B",
      description:
        'Qwen3-32B is a dense 32.8B parameter causal language model from the Qwen3 series, optimized for both complex reasoning and efficient dialogue. It supports seamless switching between a "thinking" mode for tasks like math, coding, and logical inference, and a "non-thinking" mode for faster, general-purpose conversation. The model demonstrates strong performance in instruction-following, agent tool use, creative writing, and multilingual tasks across 100+ languages and dialects. It natively handles 32K token contexts and can extend to 131K tokens using YaRN-based scaling. ',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1745875945,
      cost: {
        input: 0.03,
        output: 0.13,
        reasoning: 0,
      },
      limit: {
        context: 40960,
      },
    },
    "qwen/qwen3-235b-a22b:free": {
      id: "qwen/qwen3-235b-a22b:free",
      name: "Qwen: Qwen3 235B A22B (free)",
      description:
        'Qwen3-235B-A22B is a 235B parameter mixture-of-experts (MoE) model developed by Qwen, activating 22B parameters per forward pass. It supports seamless switching between a "thinking" mode for complex reasoning, math, and code tasks, and a "non-thinking" mode for general conversational efficiency. The model demonstrates strong reasoning ability, multilingual support (100+ languages and dialects), advanced instruction-following, and agent tool-calling capabilities. It natively handles a 32K token context window and extends up to 131K tokens using YaRN-based scaling.',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1745875757,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "qwen/qwen3-235b-a22b": {
      id: "qwen/qwen3-235b-a22b",
      name: "Qwen: Qwen3 235B A22B",
      description:
        'Qwen3-235B-A22B is a 235B parameter mixture-of-experts (MoE) model developed by Qwen, activating 22B parameters per forward pass. It supports seamless switching between a "thinking" mode for complex reasoning, math, and code tasks, and a "non-thinking" mode for general conversational efficiency. The model demonstrates strong reasoning ability, multilingual support (100+ languages and dialects), advanced instruction-following, and agent tool-calling capabilities. It natively handles a 32K token context window and extends up to 131K tokens using YaRN-based scaling.',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1745875757,
      cost: {
        input: 0.18,
        output: 0.54,
        reasoning: 0,
      },
      limit: {
        context: 40960,
      },
    },
    "qwen/qwen2.5-vl-32b-instruct:free": {
      id: "qwen/qwen2.5-vl-32b-instruct:free",
      name: "Qwen: Qwen2.5 VL 32B Instruct (free)",
      description:
        "Qwen2.5-VL-32B is a multimodal vision-language model fine-tuned through reinforcement learning for enhanced mathematical reasoning, structured outputs, and visual problem-solving capabilities. It excels at visual analysis tasks, including object recognition, textual interpretation within images, and precise event localization in extended videos. Qwen2.5-VL-32B demonstrates state-of-the-art performance across multimodal benchmarks such as MMMU, MathVista, and VideoMME, while maintaining strong reasoning and clarity in text-based tasks like MMLU, mathematical problem-solving, and code generation.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1742839838,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 8192,
      },
    },
    "qwen/qwen2.5-vl-32b-instruct": {
      id: "qwen/qwen2.5-vl-32b-instruct",
      name: "Qwen: Qwen2.5 VL 32B Instruct",
      description:
        "Qwen2.5-VL-32B is a multimodal vision-language model fine-tuned through reinforcement learning for enhanced mathematical reasoning, structured outputs, and visual problem-solving capabilities. It excels at visual analysis tasks, including object recognition, textual interpretation within images, and precise event localization in extended videos. Qwen2.5-VL-32B demonstrates state-of-the-art performance across multimodal benchmarks such as MMMU, MathVista, and VideoMME, while maintaining strong reasoning and clarity in text-based tasks like MMLU, mathematical problem-solving, and code generation.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1742839838,
      cost: {
        input: 0.04,
        output: 0.14,
        reasoning: 0,
      },
      limit: {
        context: 16384,
      },
    },
    "qwen/qwq-32b": {
      id: "qwen/qwq-32b",
      name: "Qwen: QwQ 32B",
      description:
        "QwQ is the reasoning model of the Qwen series. Compared with conventional instruction-tuned models, QwQ, which is capable of thinking and reasoning, can achieve significantly enhanced performance in downstream tasks, especially hard problems. QwQ-32B is the medium-sized reasoning model, which is capable of achieving competitive performance against state-of-the-art reasoning models, e.g., DeepSeek-R1, o1-mini.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1741208814,
      cost: {
        input: 0.15,
        output: 0.4,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "qwen/qwen-vl-plus": {
      id: "qwen/qwen-vl-plus",
      name: "Qwen: Qwen VL Plus",
      description:
        "Qwen's Enhanced Large Visual Language Model. Significantly upgraded for detailed recognition capabilities and text recognition abilities, supporting ultra-high pixel resolutions up to millions of pixels and extreme aspect ratios for image input. It delivers significant performance across a broad range of visual tasks.\n",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1738731255,
      cost: {
        input: 0.21,
        output: 0.63,
        reasoning: 0,
      },
      limit: {
        context: 7500,
      },
    },
    "qwen/qwen-vl-max": {
      id: "qwen/qwen-vl-max",
      name: "Qwen: Qwen VL Max",
      description:
        "Qwen VL Max is a visual understanding model with 7500 tokens context length. It excels in delivering optimal performance for a broader spectrum of complex tasks.\n",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1738434304,
      cost: {
        input: 0.8,
        output: 3.2,
        reasoning: 0,
      },
      limit: {
        context: 7500,
      },
    },
    "qwen/qwen-turbo": {
      id: "qwen/qwen-turbo",
      name: "Qwen: Qwen-Turbo",
      description:
        "Qwen-Turbo, based on Qwen2.5, is a 1M context model that provides fast speed and low cost, suitable for simple tasks.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1738410974,
      cost: {
        input: 0.05,
        output: 0.2,
        reasoning: 0,
        cache_read: 0.02,
      },
      limit: {
        context: 1000000,
      },
    },
    "qwen/qwen2.5-vl-72b-instruct:free": {
      id: "qwen/qwen2.5-vl-72b-instruct:free",
      name: "Qwen: Qwen2.5 VL 72B Instruct (free)",
      description:
        "Qwen2.5-VL is proficient in recognizing common objects such as flowers, birds, fish, and insects. It is also highly capable of analyzing texts, charts, icons, graphics, and layouts within images.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1738410311,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "qwen/qwen2.5-vl-72b-instruct": {
      id: "qwen/qwen2.5-vl-72b-instruct",
      name: "Qwen: Qwen2.5 VL 72B Instruct",
      description:
        "Qwen2.5-VL is proficient in recognizing common objects such as flowers, birds, fish, and insects. It is also highly capable of analyzing texts, charts, icons, graphics, and layouts within images.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1738410311,
      cost: {
        input: 0.07,
        output: 0.28,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "qwen/qwen-plus": {
      id: "qwen/qwen-plus",
      name: "Qwen: Qwen-Plus",
      description:
        "Qwen-Plus, based on the Qwen2.5 foundation model, is a 131K context model with a balanced performance, speed, and cost combination.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1738409840,
      cost: {
        input: 0.4,
        output: 1.2,
        reasoning: 0,
        cache_read: 0.16,
      },
      limit: {
        context: 131072,
      },
    },
    "qwen/qwen-max": {
      id: "qwen/qwen-max",
      name: "Qwen: Qwen-Max ",
      description:
        "Qwen-Max, based on Qwen2.5, provides the best inference performance among [Qwen models](/qwen), especially for complex multi-step tasks. It's a large-scale MoE model that has been pretrained on over 20 trillion tokens and further post-trained with curated Supervised Fine-Tuning (SFT) and Reinforcement Learning from Human Feedback (RLHF) methodologies. The parameter count is unknown.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1738402289,
      cost: {
        input: 1.6,
        output: 6.4,
        reasoning: 0,
        cache_read: 0.64,
      },
      limit: {
        context: 32768,
      },
    },
    "qwen/qwen-2.5-coder-32b-instruct:free": {
      id: "qwen/qwen-2.5-coder-32b-instruct:free",
      name: "Qwen2.5 Coder 32B Instruct (free)",
      description:
        "Qwen2.5-Coder is the latest series of Code-Specific Qwen large language models (formerly known as CodeQwen). Qwen2.5-Coder brings the following improvements upon CodeQwen1.5:\n\n- Significantly improvements in **code generation**, **code reasoning** and **code fixing**. \n- A more comprehensive foundation for real-world applications such as **Code Agents**. Not only enhancing coding capabilities but also maintaining its strengths in mathematics and general competencies.\n\nTo read more about its evaluation results, check out [Qwen 2.5 Coder's blog](https://qwenlm.github.io/blog/qwen2.5-coder-family/).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1731368400,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "qwen/qwen-2.5-coder-32b-instruct": {
      id: "qwen/qwen-2.5-coder-32b-instruct",
      name: "Qwen2.5 Coder 32B Instruct",
      description:
        "Qwen2.5-Coder is the latest series of Code-Specific Qwen large language models (formerly known as CodeQwen). Qwen2.5-Coder brings the following improvements upon CodeQwen1.5:\n\n- Significantly improvements in **code generation**, **code reasoning** and **code fixing**. \n- A more comprehensive foundation for real-world applications such as **Code Agents**. Not only enhancing coding capabilities but also maintaining its strengths in mathematics and general competencies.\n\nTo read more about its evaluation results, check out [Qwen 2.5 Coder's blog](https://qwenlm.github.io/blog/qwen2.5-coder-family/).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1731368400,
      cost: {
        input: 0.06,
        output: 0.15,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "qwen/qwen-2.5-7b-instruct": {
      id: "qwen/qwen-2.5-7b-instruct",
      name: "Qwen2.5 7B Instruct",
      description:
        "Qwen2.5 7B is the latest series of Qwen large language models. Qwen2.5 brings the following improvements upon Qwen2:\n\n- Significantly more knowledge and has greatly improved capabilities in coding and mathematics, thanks to our specialized expert models in these domains.\n\n- Significant improvements in instruction following, generating long texts (over 8K tokens), understanding structured data (e.g, tables), and generating structured outputs especially JSON. More resilient to the diversity of system prompts, enhancing role-play implementation and condition-setting for chatbots.\n\n- Long-context Support up to 128K tokens and can generate up to 8K tokens.\n\n- Multilingual support for over 29 languages, including Chinese, English, French, Spanish, Portuguese, German, Italian, Russian, Japanese, Korean, Vietnamese, Thai, Arabic, and more.\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1729036800,
      cost: {
        input: 0.04,
        output: 0.1,
        reasoning: 0,
      },
      limit: {
        context: 65536,
      },
    },
    "qwen/qwen-2.5-72b-instruct:free": {
      id: "qwen/qwen-2.5-72b-instruct:free",
      name: "Qwen2.5 72B Instruct (free)",
      description:
        "Qwen2.5 72B is the latest series of Qwen large language models. Qwen2.5 brings the following improvements upon Qwen2:\n\n- Significantly more knowledge and has greatly improved capabilities in coding and mathematics, thanks to our specialized expert models in these domains.\n\n- Significant improvements in instruction following, generating long texts (over 8K tokens), understanding structured data (e.g, tables), and generating structured outputs especially JSON. More resilient to the diversity of system prompts, enhancing role-play implementation and condition-setting for chatbots.\n\n- Long-context Support up to 128K tokens and can generate up to 8K tokens.\n\n- Multilingual support for over 29 languages, including Chinese, English, French, Spanish, Portuguese, German, Italian, Russian, Japanese, Korean, Vietnamese, Thai, Arabic, and more.\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1726704000,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "qwen/qwen-2.5-72b-instruct": {
      id: "qwen/qwen-2.5-72b-instruct",
      name: "Qwen2.5 72B Instruct",
      description:
        "Qwen2.5 72B is the latest series of Qwen large language models. Qwen2.5 brings the following improvements upon Qwen2:\n\n- Significantly more knowledge and has greatly improved capabilities in coding and mathematics, thanks to our specialized expert models in these domains.\n\n- Significant improvements in instruction following, generating long texts (over 8K tokens), understanding structured data (e.g, tables), and generating structured outputs especially JSON. More resilient to the diversity of system prompts, enhancing role-play implementation and condition-setting for chatbots.\n\n- Long-context Support up to 128K tokens and can generate up to 8K tokens.\n\n- Multilingual support for over 29 languages, including Chinese, English, French, Spanish, Portuguese, German, Italian, Russian, Japanese, Korean, Vietnamese, Thai, Arabic, and more.\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1726704000,
      cost: {
        input: 0.07,
        output: 0.26,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "qwen/qwen-2.5-vl-7b-instruct": {
      id: "qwen/qwen-2.5-vl-7b-instruct",
      name: "Qwen: Qwen2.5-VL 7B Instruct",
      description:
        "Qwen2.5 VL 7B is a multimodal LLM from the Qwen Team with the following key enhancements:\n\n- SoTA understanding of images of various resolution & ratio: Qwen2.5-VL achieves state-of-the-art performance on visual understanding benchmarks, including MathVista, DocVQA, RealWorldQA, MTVQA, etc.\n\n- Understanding videos of 20min+: Qwen2.5-VL can understand videos over 20 minutes for high-quality video-based question answering, dialog, content creation, etc.\n\n- Agent that can operate your mobiles, robots, etc.: with the abilities of complex reasoning and decision making, Qwen2.5-VL can be integrated with devices like mobile phones, robots, etc., for automatic operation based on visual environment and text instructions.\n\n- Multilingual Support: to serve global users, besides English and Chinese, Qwen2.5-VL now supports the understanding of texts in different languages inside images, including most European languages, Japanese, Korean, Arabic, Vietnamese, etc.\n\nFor more details, see this [blog post](https://qwenlm.github.io/blog/qwen2-vl/) and [GitHub repo](https://github.com/QwenLM/Qwen2-VL).\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1724803200,
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
export default qwenProvider;
