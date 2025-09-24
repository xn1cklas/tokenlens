export const mistralaiProvider = {
  id: "mistralai",
  name: "mistralai",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "mistralai/mistral-medium-3.1": {
      id: "mistralai/mistral-medium-3.1",
      name: "Mistral: Mistral Medium 3.1",
      description:
        "Mistral Medium 3.1 is an updated version of Mistral Medium 3, which is a high-performance enterprise-grade language model designed to deliver frontier-level capabilities at significantly reduced operational cost. It balances state-of-the-art reasoning and multimodal performance with 8× lower cost compared to traditional large models, making it suitable for scalable deployments across professional and industrial use cases.\n\nThe model excels in domains such as coding, STEM reasoning, and enterprise adaptation. It supports hybrid, on-prem, and in-VPC deployments and is optimized for integration into custom workflows. Mistral Medium 3.1 offers competitive accuracy relative to larger models like Claude Sonnet 3.5/3.7, Llama 4 Maverick, and Command R+, while maintaining broad compatibility across cloud environments.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1755095639,
      cost: {
        input: 0.4,
        output: 2,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "mistralai/codestral-2508": {
      id: "mistralai/codestral-2508",
      name: "Mistral: Codestral 2508",
      description:
        "Mistral's cutting-edge language model for coding released end of July 2025. Codestral specializes in low-latency, high-frequency tasks such as fill-in-the-middle (FIM), code correction and test generation.\n\n[Blog Post](https://mistral.ai/news/codestral-25-08)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1754079630,
      cost: {
        input: 0.3,
        output: 0.9,
        reasoning: 0,
      },
      limit: {
        context: 256000,
      },
    },
    "mistralai/devstral-medium": {
      id: "mistralai/devstral-medium",
      name: "Mistral: Devstral Medium",
      description:
        "Devstral Medium is a high-performance code generation and agentic reasoning model developed jointly by Mistral AI and All Hands AI. Positioned as a step up from Devstral Small, it achieves 61.6% on SWE-Bench Verified, placing it ahead of Gemini 2.5 Pro and GPT-4.1 in code-related tasks, at a fraction of the cost. It is designed for generalization across prompt styles and tool use in code agents and frameworks.\n\nDevstral Medium is available via API only (not open-weight), and supports enterprise deployment on private infrastructure, with optional fine-tuning capabilities.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1752161321,
      cost: {
        input: 0.4,
        output: 2,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "mistralai/devstral-small": {
      id: "mistralai/devstral-small",
      name: "Mistral: Devstral Small 1.1",
      description:
        "Devstral Small 1.1 is a 24B parameter open-weight language model for software engineering agents, developed by Mistral AI in collaboration with All Hands AI. Finetuned from Mistral Small 3.1 and released under the Apache 2.0 license, it features a 128k token context window and supports both Mistral-style function calling and XML output formats.\n\nDesigned for agentic coding workflows, Devstral Small 1.1 is optimized for tasks such as codebase exploration, multi-file edits, and integration into autonomous development agents like OpenHands and Cline. It achieves 53.6% on SWE-Bench Verified, surpassing all other open models on this benchmark, while remaining lightweight enough to run on a single 4090 GPU or Apple silicon machine. The model uses a Tekken tokenizer with a 131k vocabulary and is deployable via vLLM, Transformers, Ollama, LM Studio, and other OpenAI-compatible runtimes.\n",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1752160751,
      cost: {
        input: 0.07,
        output: 0.28,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "mistralai/mistral-small-3.2-24b-instruct:free": {
      id: "mistralai/mistral-small-3.2-24b-instruct:free",
      name: "Mistral: Mistral Small 3.2 24B (free)",
      description:
        "Mistral-Small-3.2-24B-Instruct-2506 is an updated 24B parameter model from Mistral optimized for instruction following, repetition reduction, and improved function calling. Compared to the 3.1 release, version 3.2 significantly improves accuracy on WildBench and Arena Hard, reduces infinite generations, and delivers gains in tool use and structured output tasks.\n\nIt supports image and text inputs with structured outputs, function/tool calling, and strong performance across coding (HumanEval+, MBPP), STEM (MMLU, MATH, GPQA), and vision benchmarks (ChartQA, DocVQA).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1750443016,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "mistralai/mistral-small-3.2-24b-instruct": {
      id: "mistralai/mistral-small-3.2-24b-instruct",
      name: "Mistral: Mistral Small 3.2 24B",
      description:
        "Mistral-Small-3.2-24B-Instruct-2506 is an updated 24B parameter model from Mistral optimized for instruction following, repetition reduction, and improved function calling. Compared to the 3.1 release, version 3.2 significantly improves accuracy on WildBench and Arena Hard, reduces infinite generations, and delivers gains in tool use and structured output tasks.\n\nIt supports image and text inputs with structured outputs, function/tool calling, and strong performance across coding (HumanEval+, MBPP), STEM (MMLU, MATH, GPQA), and vision benchmarks (ChartQA, DocVQA).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1750443016,
      cost: {
        input: 0.075,
        output: 0.2,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "mistralai/magistral-small-2506": {
      id: "mistralai/magistral-small-2506",
      name: "Mistral: Magistral Small 2506",
      description:
        "Magistral Small is a 24B parameter instruction-tuned model based on Mistral-Small-3.1 (2503), enhanced through supervised fine-tuning on traces from Magistral Medium and further refined via reinforcement learning. It is optimized for reasoning and supports a wide multilingual range, including over 20 languages.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1749569561,
      cost: {
        input: 0.5,
        output: 1.5,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "mistralai/magistral-medium-2506": {
      id: "mistralai/magistral-medium-2506",
      name: "Mistral: Magistral Medium 2506",
      description:
        "Magistral is Mistral's first reasoning model. It is ideal for general purpose use requiring longer thought processing and better accuracy than with non-reasoning LLMs. From legal research and financial forecasting to software development and creative storytelling — this model solves multi-step challenges where transparency and precision are critical.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1749354054,
      cost: {
        input: 2,
        output: 5,
        reasoning: 0,
      },
      limit: {
        context: 40960,
      },
    },
    "mistralai/magistral-medium-2506:thinking": {
      id: "mistralai/magistral-medium-2506:thinking",
      name: "Mistral: Magistral Medium 2506 (thinking)",
      description:
        "Magistral is Mistral's first reasoning model. It is ideal for general purpose use requiring longer thought processing and better accuracy than with non-reasoning LLMs. From legal research and financial forecasting to software development and creative storytelling — this model solves multi-step challenges where transparency and precision are critical.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1749354054,
      cost: {
        input: 2,
        output: 5,
        reasoning: 0,
      },
      limit: {
        context: 40960,
      },
    },
    "mistralai/devstral-small-2505:free": {
      id: "mistralai/devstral-small-2505:free",
      name: "Mistral: Devstral Small 2505 (free)",
      description:
        "Devstral-Small-2505 is a 24B parameter agentic LLM fine-tuned from Mistral-Small-3.1, jointly developed by Mistral AI and All Hands AI for advanced software engineering tasks. It is optimized for codebase exploration, multi-file editing, and integration into coding agents, achieving state-of-the-art results on SWE-Bench Verified (46.8%).\n\nDevstral supports a 128k context window and uses a custom Tekken tokenizer. It is text-only, with the vision encoder removed, and is suitable for local deployment on high-end consumer hardware (e.g., RTX 4090, 32GB RAM Macs). Devstral is best used in agentic workflows via the OpenHands scaffold and is compatible with inference frameworks like vLLM, Transformers, and Ollama. It is released under the Apache 2.0 license.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1747837379,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "mistralai/devstral-small-2505": {
      id: "mistralai/devstral-small-2505",
      name: "Mistral: Devstral Small 2505",
      description:
        "Devstral-Small-2505 is a 24B parameter agentic LLM fine-tuned from Mistral-Small-3.1, jointly developed by Mistral AI and All Hands AI for advanced software engineering tasks. It is optimized for codebase exploration, multi-file editing, and integration into coding agents, achieving state-of-the-art results on SWE-Bench Verified (46.8%).\n\nDevstral supports a 128k context window and uses a custom Tekken tokenizer. It is text-only, with the vision encoder removed, and is suitable for local deployment on high-end consumer hardware (e.g., RTX 4090, 32GB RAM Macs). Devstral is best used in agentic workflows via the OpenHands scaffold and is compatible with inference frameworks like vLLM, Transformers, and Ollama. It is released under the Apache 2.0 license.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1747837379,
      cost: {
        input: 0.04,
        output: 0.14,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "mistralai/mistral-medium-3": {
      id: "mistralai/mistral-medium-3",
      name: "Mistral: Mistral Medium 3",
      description:
        "Mistral Medium 3 is a high-performance enterprise-grade language model designed to deliver frontier-level capabilities at significantly reduced operational cost. It balances state-of-the-art reasoning and multimodal performance with 8× lower cost compared to traditional large models, making it suitable for scalable deployments across professional and industrial use cases.\n\nThe model excels in domains such as coding, STEM reasoning, and enterprise adaptation. It supports hybrid, on-prem, and in-VPC deployments and is optimized for integration into custom workflows. Mistral Medium 3 offers competitive accuracy relative to larger models like Claude Sonnet 3.5/3.7, Llama 4 Maverick, and Command R+, while maintaining broad compatibility across cloud environments.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1746627341,
      cost: {
        input: 0.4,
        output: 2,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "mistralai/mistral-small-3.1-24b-instruct:free": {
      id: "mistralai/mistral-small-3.1-24b-instruct:free",
      name: "Mistral: Mistral Small 3.1 24B (free)",
      description:
        "Mistral Small 3.1 24B Instruct is an upgraded variant of Mistral Small 3 (2501), featuring 24 billion parameters with advanced multimodal capabilities. It provides state-of-the-art performance in text-based reasoning and vision tasks, including image analysis, programming, mathematical reasoning, and multilingual support across dozens of languages. Equipped with an extensive 128k token context window and optimized for efficient local inference, it supports use cases such as conversational agents, function calling, long-document comprehension, and privacy-sensitive deployments. The updated version is [Mistral Small 3.2](mistralai/mistral-small-3.2-24b-instruct)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1742238937,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "mistralai/mistral-small-3.1-24b-instruct": {
      id: "mistralai/mistral-small-3.1-24b-instruct",
      name: "Mistral: Mistral Small 3.1 24B",
      description:
        "Mistral Small 3.1 24B Instruct is an upgraded variant of Mistral Small 3 (2501), featuring 24 billion parameters with advanced multimodal capabilities. It provides state-of-the-art performance in text-based reasoning and vision tasks, including image analysis, programming, mathematical reasoning, and multilingual support across dozens of languages. Equipped with an extensive 128k token context window and optimized for efficient local inference, it supports use cases such as conversational agents, function calling, long-document comprehension, and privacy-sensitive deployments. The updated version is [Mistral Small 3.2](mistralai/mistral-small-3.2-24b-instruct)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1742238937,
      cost: {
        input: 0.04,
        output: 0.15,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "mistralai/mistral-saba": {
      id: "mistralai/mistral-saba",
      name: "Mistral: Saba",
      description:
        "Mistral Saba is a 24B-parameter language model specifically designed for the Middle East and South Asia, delivering accurate and contextually relevant responses while maintaining efficient performance. Trained on curated regional datasets, it supports multiple Indian-origin languages—including Tamil and Malayalam—alongside Arabic. This makes it a versatile option for a range of regional and multilingual applications. Read more at the blog post [here](https://mistral.ai/en/news/mistral-saba)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1739803239,
      cost: {
        input: 0.2,
        output: 0.6,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "mistralai/mistral-small-24b-instruct-2501:free": {
      id: "mistralai/mistral-small-24b-instruct-2501:free",
      name: "Mistral: Mistral Small 3 (free)",
      description:
        "Mistral Small 3 is a 24B-parameter language model optimized for low-latency performance across common AI tasks. Released under the Apache 2.0 license, it features both pre-trained and instruction-tuned versions designed for efficient local deployment.\n\nThe model achieves 81% accuracy on the MMLU benchmark and performs competitively with larger models like Llama 3.3 70B and Qwen 32B, while operating at three times the speed on equivalent hardware. [Read the blog post about the model here.](https://mistral.ai/news/mistral-small-3/)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1738255409,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "mistralai/mistral-small-24b-instruct-2501": {
      id: "mistralai/mistral-small-24b-instruct-2501",
      name: "Mistral: Mistral Small 3",
      description:
        "Mistral Small 3 is a 24B-parameter language model optimized for low-latency performance across common AI tasks. Released under the Apache 2.0 license, it features both pre-trained and instruction-tuned versions designed for efficient local deployment.\n\nThe model achieves 81% accuracy on the MMLU benchmark and performs competitively with larger models like Llama 3.3 70B and Qwen 32B, while operating at three times the speed on equivalent hardware. [Read the blog post about the model here.](https://mistral.ai/news/mistral-small-3/)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1738255409,
      cost: {
        input: 0.04,
        output: 0.15,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "mistralai/codestral-2501": {
      id: "mistralai/codestral-2501",
      name: "Mistral: Codestral 2501",
      description:
        "[Mistral](/mistralai)'s cutting-edge language model for coding. Codestral specializes in low-latency, high-frequency tasks such as fill-in-the-middle (FIM), code correction and test generation. \n\nLearn more on their blog post: https://mistral.ai/news/codestral-2501/",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1736895522,
      cost: {
        input: 0.3,
        output: 0.9,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "mistralai/mistral-large-2411": {
      id: "mistralai/mistral-large-2411",
      name: "Mistral Large 2411",
      description:
        "Mistral Large 2 2411 is an update of [Mistral Large 2](/mistralai/mistral-large) released together with [Pixtral Large 2411](/mistralai/pixtral-large-2411)\n\nIt provides a significant upgrade on the previous [Mistral Large 24.07](/mistralai/mistral-large-2407), with notable improvements in long context understanding, a new system prompt, and more accurate function calling.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1731978685,
      cost: {
        input: 2,
        output: 6,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "mistralai/mistral-large-2407": {
      id: "mistralai/mistral-large-2407",
      name: "Mistral Large 2407",
      description:
        "This is Mistral AI's flagship model, Mistral Large 2 (version mistral-large-2407). It's a proprietary weights-available model and excels at reasoning, code, JSON, chat, and more. Read the launch announcement [here](https://mistral.ai/news/mistral-large-2407/).\n\nIt supports dozens of languages including French, German, Spanish, Italian, Portuguese, Arabic, Hindi, Russian, Chinese, Japanese, and Korean, along with 80+ coding languages including Python, Java, C, C++, JavaScript, and Bash. Its long context window allows precise information recall from large documents.\n",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1731978415,
      cost: {
        input: 2,
        output: 6,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "mistralai/pixtral-large-2411": {
      id: "mistralai/pixtral-large-2411",
      name: "Mistral: Pixtral Large 2411",
      description:
        "Pixtral Large is a 124B parameter, open-weight, multimodal model built on top of [Mistral Large 2](/mistralai/mistral-large-2411). The model is able to understand documents, charts and natural images.\n\nThe model is available under the Mistral Research License (MRL) for research and educational use, and the Mistral Commercial License for experimentation, testing, and production for commercial purposes.\n\n",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1731977388,
      cost: {
        input: 2,
        output: 6,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "mistralai/ministral-8b": {
      id: "mistralai/ministral-8b",
      name: "Mistral: Ministral 8B",
      description:
        "Ministral 8B is an 8B parameter model featuring a unique interleaved sliding-window attention pattern for faster, memory-efficient inference. Designed for edge use cases, it supports up to 128k context length and excels in knowledge and reasoning tasks. It outperforms peers in the sub-10B category, making it perfect for low-latency, privacy-first applications.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1729123200,
      cost: {
        input: 0.1,
        output: 0.1,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "mistralai/ministral-3b": {
      id: "mistralai/ministral-3b",
      name: "Mistral: Ministral 3B",
      description:
        "Ministral 3B is a 3B parameter model optimized for on-device and edge computing. It excels in knowledge, commonsense reasoning, and function-calling, outperforming larger models like Mistral 7B on most benchmarks. Supporting up to 128k context length, it’s ideal for orchestrating agentic workflows and specialist tasks with efficient inference.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1729123200,
      cost: {
        input: 0.04,
        output: 0.04,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "mistralai/pixtral-12b": {
      id: "mistralai/pixtral-12b",
      name: "Mistral: Pixtral 12B",
      description:
        "The first multi-modal, text+image-to-text model from Mistral AI. Its weights were launched via torrent: https://x.com/mistralai/status/1833758285167722836.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1725926400,
      cost: {
        input: 0.1,
        output: 0.1,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "mistralai/mistral-nemo:free": {
      id: "mistralai/mistral-nemo:free",
      name: "Mistral: Mistral Nemo (free)",
      description:
        "A 12B parameter model with a 128k token context length built by Mistral in collaboration with NVIDIA.\n\nThe model is multilingual, supporting English, French, German, Spanish, Italian, Portuguese, Chinese, Japanese, Korean, Arabic, and Hindi.\n\nIt supports function calling and is released under the Apache 2.0 license.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1721347200,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "mistralai/mistral-nemo": {
      id: "mistralai/mistral-nemo",
      name: "Mistral: Mistral Nemo",
      description:
        "A 12B parameter model with a 128k token context length built by Mistral in collaboration with NVIDIA.\n\nThe model is multilingual, supporting English, French, German, Spanish, Italian, Portuguese, Chinese, Japanese, Korean, Arabic, and Hindi.\n\nIt supports function calling and is released under the Apache 2.0 license.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1721347200,
      cost: {
        input: 0.02,
        output: 0.04,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "mistralai/mistral-7b-instruct-v0.3": {
      id: "mistralai/mistral-7b-instruct-v0.3",
      name: "Mistral: Mistral 7B Instruct v0.3",
      description:
        "A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.\n\nAn improved version of [Mistral 7B Instruct v0.2](/models/mistralai/mistral-7b-instruct-v0.2), with the following changes:\n\n- Extended vocabulary to 32768\n- Supports v3 Tokenizer\n- Supports function calling\n\nNOTE: Support for function calling depends on the provider.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1716768000,
      cost: {
        input: 0.028,
        output: 0.054,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "mistralai/mistral-7b-instruct:free": {
      id: "mistralai/mistral-7b-instruct:free",
      name: "Mistral: Mistral 7B Instruct (free)",
      description:
        "A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.\n\n*Mistral 7B Instruct has multiple version variants, and this is intended to be the latest version.*",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1716768000,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "mistralai/mistral-7b-instruct": {
      id: "mistralai/mistral-7b-instruct",
      name: "Mistral: Mistral 7B Instruct",
      description:
        "A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.\n\n*Mistral 7B Instruct has multiple version variants, and this is intended to be the latest version.*",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1716768000,
      cost: {
        input: 0.028,
        output: 0.054,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "mistralai/mixtral-8x22b-instruct": {
      id: "mistralai/mixtral-8x22b-instruct",
      name: "Mistral: Mixtral 8x22B Instruct",
      description:
        "Mistral's official instruct fine-tuned version of [Mixtral 8x22B](/models/mistralai/mixtral-8x22b). It uses 39B active parameters out of 141B, offering unparalleled cost efficiency for its size. Its strengths include:\n- strong math, coding, and reasoning\n- large context length (64k)\n- fluency in English, French, Italian, German, and Spanish\n\nSee benchmarks on the launch announcement [here](https://mistral.ai/news/mixtral-8x22b/).\n#moe",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1713312000,
      cost: {
        input: 0.9,
        output: 0.9,
        reasoning: 0,
      },
      limit: {
        context: 65536,
      },
    },
    "mistralai/mistral-large": {
      id: "mistralai/mistral-large",
      name: "Mistral Large",
      description:
        "This is Mistral AI's flagship model, Mistral Large 2 (version `mistral-large-2407`). It's a proprietary weights-available model and excels at reasoning, code, JSON, chat, and more. Read the launch announcement [here](https://mistral.ai/news/mistral-large-2407/).\n\nIt supports dozens of languages including French, German, Spanish, Italian, Portuguese, Arabic, Hindi, Russian, Chinese, Japanese, and Korean, along with 80+ coding languages including Python, Java, C, C++, JavaScript, and Bash. Its long context window allows precise information recall from large documents.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1708905600,
      cost: {
        input: 2,
        output: 6,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "mistralai/mistral-tiny": {
      id: "mistralai/mistral-tiny",
      name: "Mistral Tiny",
      description:
        'Note: This model is being deprecated. Recommended replacement is the newer [Ministral 8B](/mistral/ministral-8b)\n\nThis model is currently powered by Mistral-7B-v0.2, and incorporates a "better" fine-tuning than [Mistral 7B](/models/mistralai/mistral-7b-instruct-v0.1), inspired by community work. It\'s best used for large batch processing tasks where cost is a significant factor but reasoning capabilities are not crucial.',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1704844800,
      cost: {
        input: 0.25,
        output: 0.25,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "mistralai/mistral-small": {
      id: "mistralai/mistral-small",
      name: "Mistral Small",
      description:
        "With 22 billion parameters, Mistral Small v24.09 offers a convenient mid-point between (Mistral NeMo 12B)[/mistralai/mistral-nemo] and (Mistral Large 2)[/mistralai/mistral-large], providing a cost-effective solution that can be deployed across various platforms and environments. It has better reasoning, exhibits more capabilities, can produce and reason about code, and is multiligual, supporting English, French, German, Italian, and Spanish.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1704844800,
      cost: {
        input: 0.2,
        output: 0.6,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "mistralai/mixtral-8x7b-instruct": {
      id: "mistralai/mixtral-8x7b-instruct",
      name: "Mistral: Mixtral 8x7B Instruct",
      description:
        "Mixtral 8x7B Instruct is a pretrained generative Sparse Mixture of Experts, by Mistral AI, for chat and instruction use. Incorporates 8 experts (feed-forward networks) for a total of 47 billion parameters.\n\nInstruct model fine-tuned by Mistral. #moe",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1702166400,
      cost: {
        input: 0.4,
        output: 0.4,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "mistralai/mistral-7b-instruct-v0.1": {
      id: "mistralai/mistral-7b-instruct-v0.1",
      name: "Mistral: Mistral 7B Instruct v0.1",
      description:
        "A 7.3B parameter model that outperforms Llama 2 13B on all benchmarks, with optimizations for speed and context length.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1695859200,
      cost: {
        input: 0.11,
        output: 0.19,
        reasoning: 0,
      },
      limit: {
        context: 2824,
      },
    },
  },
} as const;
export default mistralaiProvider;
