export const googleProvider = {
  id: "google",
  name: "google",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "google/gemini-2.5-flash-image-preview": {
      id: "google/gemini-2.5-flash-image-preview",
      name: "Gemini 2.5 Flash Image (Nano Banana)",
      description:
        'Gemini 2.5 Flash Image Preview, a.k.a. "Nano Banana," is a state of the art image generation model with contextual understanding. It is capable of image generation, edits, and multi-turn conversations.',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1756218977,
      cost: {
        input: 0.3,
        output: 2.5,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "google/gemini-2.5-flash-lite": {
      id: "google/gemini-2.5-flash-lite",
      name: "Google: Gemini 2.5 Flash Lite",
      description:
        'Gemini 2.5 Flash-Lite is a lightweight reasoning model in the Gemini 2.5 family, optimized for ultra-low latency and cost efficiency. It offers improved throughput, faster token generation, and better performance across common benchmarks compared to earlier Flash models. By default, "thinking" (i.e. multi-pass reasoning) is disabled to prioritize speed, but developers can enable it via the [Reasoning API parameter](https://openrouter.ai/docs/use-cases/reasoning-tokens) to selectively trade off cost for intelligence. ',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1753200276,
      cost: {
        input: 0.1,
        output: 0.4,
        reasoning: 0,
        cache_read: 0.025,
        cache_write: 0.1833,
      },
      limit: {
        context: 1048576,
      },
    },
    "google/gemma-3n-e2b-it:free": {
      id: "google/gemma-3n-e2b-it:free",
      name: "Google: Gemma 3n 2B (free)",
      description:
        "Gemma 3n E2B IT is a multimodal, instruction-tuned model developed by Google DeepMind, designed to operate efficiently at an effective parameter size of 2B while leveraging a 6B architecture. Based on the MatFormer architecture, it supports nested submodels and modular composition via the Mix-and-Match framework. Gemma 3n models are optimized for low-resource deployment, offering 32K context length and strong multilingual and reasoning performance across common benchmarks. This variant is trained on a diverse corpus including code, math, web, and multimodal data.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1752074904,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 8192,
      },
    },
    "google/gemini-2.5-flash-lite-preview-06-17": {
      id: "google/gemini-2.5-flash-lite-preview-06-17",
      name: "Google: Gemini 2.5 Flash Lite Preview 06-17",
      description:
        'Gemini 2.5 Flash-Lite is a lightweight reasoning model in the Gemini 2.5 family, optimized for ultra-low latency and cost efficiency. It offers improved throughput, faster token generation, and better performance across common benchmarks compared to earlier Flash models. By default, "thinking" (i.e. multi-pass reasoning) is disabled to prioritize speed, but developers can enable it via the [Reasoning API parameter](https://openrouter.ai/docs/use-cases/reasoning-tokens) to selectively trade off cost for intelligence. ',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1750173831,
      cost: {
        input: 0.1,
        output: 0.4,
        reasoning: 0,
        cache_read: 0.025,
        cache_write: 0.1833,
      },
      limit: {
        context: 1048576,
      },
    },
    "google/gemini-2.5-flash": {
      id: "google/gemini-2.5-flash",
      name: "Google: Gemini 2.5 Flash",
      description:
        'Gemini 2.5 Flash is Google\'s state-of-the-art workhorse model, specifically designed for advanced reasoning, coding, mathematics, and scientific tasks. It includes built-in "thinking" capabilities, enabling it to provide responses with greater accuracy and nuanced context handling. \n\nAdditionally, Gemini 2.5 Flash is configurable through the "max tokens for reasoning" parameter, as described in the documentation (https://openrouter.ai/docs/use-cases/reasoning-tokens#max-tokens-for-reasoning).',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1750172488,
      cost: {
        input: 0.3,
        output: 2.5,
        reasoning: 0,
        cache_read: 0.075,
        cache_write: 0.3833,
      },
      limit: {
        context: 1048576,
      },
    },
    "google/gemini-2.5-pro": {
      id: "google/gemini-2.5-pro",
      name: "Google: Gemini 2.5 Pro",
      description:
        "Gemini 2.5 Pro is Google’s state-of-the-art AI model designed for advanced reasoning, coding, mathematics, and scientific tasks. It employs “thinking” capabilities, enabling it to reason through responses with enhanced accuracy and nuanced context handling. Gemini 2.5 Pro achieves top-tier performance on multiple benchmarks, including first-place positioning on the LMArena leaderboard, reflecting superior human-preference alignment and complex problem-solving abilities.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1750169544,
      cost: {
        input: 1.25,
        output: 10,
        reasoning: 0,
        cache_read: 0.31,
        cache_write: 1.625,
      },
      limit: {
        context: 1048576,
      },
    },
    "google/gemini-2.5-pro-preview": {
      id: "google/gemini-2.5-pro-preview",
      name: "Google: Gemini 2.5 Pro Preview 06-05",
      description:
        "Gemini 2.5 Pro is Google’s state-of-the-art AI model designed for advanced reasoning, coding, mathematics, and scientific tasks. It employs “thinking” capabilities, enabling it to reason through responses with enhanced accuracy and nuanced context handling. Gemini 2.5 Pro achieves top-tier performance on multiple benchmarks, including first-place positioning on the LMArena leaderboard, reflecting superior human-preference alignment and complex problem-solving abilities.\n",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1749137257,
      cost: {
        input: 1.25,
        output: 10,
        reasoning: 0,
        cache_read: 0.31,
        cache_write: 1.625,
      },
      limit: {
        context: 1048576,
      },
    },
    "google/gemma-3n-e4b-it:free": {
      id: "google/gemma-3n-e4b-it:free",
      name: "Google: Gemma 3n 4B (free)",
      description:
        "Gemma 3n E4B-it is optimized for efficient execution on mobile and low-resource devices, such as phones, laptops, and tablets. It supports multimodal inputs—including text, visual data, and audio—enabling diverse tasks such as text generation, speech recognition, translation, and image analysis. Leveraging innovations like Per-Layer Embedding (PLE) caching and the MatFormer architecture, Gemma 3n dynamically manages memory usage and computational load by selectively activating model parameters, significantly reducing runtime resource requirements.\n\nThis model supports a wide linguistic range (trained in over 140 languages) and features a flexible 32K token context window. Gemma 3n can selectively load parameters, optimizing memory and computational efficiency based on the task or device capabilities, making it well-suited for privacy-focused, offline-capable applications and on-device AI solutions. [Read more in the blog post](https://developers.googleblog.com/en/introducing-gemma-3n/)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1747776824,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 8192,
      },
    },
    "google/gemma-3n-e4b-it": {
      id: "google/gemma-3n-e4b-it",
      name: "Google: Gemma 3n 4B",
      description:
        "Gemma 3n E4B-it is optimized for efficient execution on mobile and low-resource devices, such as phones, laptops, and tablets. It supports multimodal inputs—including text, visual data, and audio—enabling diverse tasks such as text generation, speech recognition, translation, and image analysis. Leveraging innovations like Per-Layer Embedding (PLE) caching and the MatFormer architecture, Gemma 3n dynamically manages memory usage and computational load by selectively activating model parameters, significantly reducing runtime resource requirements.\n\nThis model supports a wide linguistic range (trained in over 140 languages) and features a flexible 32K token context window. Gemma 3n can selectively load parameters, optimizing memory and computational efficiency based on the task or device capabilities, making it well-suited for privacy-focused, offline-capable applications and on-device AI solutions. [Read more in the blog post](https://developers.googleblog.com/en/introducing-gemma-3n/)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1747776824,
      cost: {
        input: 0.02,
        output: 0.04,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "google/gemini-2.5-pro-preview-05-06": {
      id: "google/gemini-2.5-pro-preview-05-06",
      name: "Google: Gemini 2.5 Pro Preview 05-06",
      description:
        "Gemini 2.5 Pro is Google’s state-of-the-art AI model designed for advanced reasoning, coding, mathematics, and scientific tasks. It employs “thinking” capabilities, enabling it to reason through responses with enhanced accuracy and nuanced context handling. Gemini 2.5 Pro achieves top-tier performance on multiple benchmarks, including first-place positioning on the LMArena leaderboard, reflecting superior human-preference alignment and complex problem-solving abilities.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1746578513,
      cost: {
        input: 1.25,
        output: 10,
        reasoning: 0,
        cache_read: 0.31,
        cache_write: 1.625,
      },
      limit: {
        context: 1048576,
      },
    },
    "google/gemma-3-4b-it:free": {
      id: "google/gemma-3-4b-it:free",
      name: "Google: Gemma 3 4B (free)",
      description:
        "Gemma 3 introduces multimodality, supporting vision-language input and text outputs. It handles context windows up to 128k tokens, understands over 140 languages, and offers improved math, reasoning, and chat capabilities, including structured outputs and function calling.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1741905510,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "google/gemma-3-4b-it": {
      id: "google/gemma-3-4b-it",
      name: "Google: Gemma 3 4B",
      description:
        "Gemma 3 introduces multimodality, supporting vision-language input and text outputs. It handles context windows up to 128k tokens, understands over 140 languages, and offers improved math, reasoning, and chat capabilities, including structured outputs and function calling.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1741905510,
      cost: {
        input: 0.04,
        output: 0.08,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "google/gemma-3-12b-it:free": {
      id: "google/gemma-3-12b-it:free",
      name: "Google: Gemma 3 12B (free)",
      description:
        "Gemma 3 introduces multimodality, supporting vision-language input and text outputs. It handles context windows up to 128k tokens, understands over 140 languages, and offers improved math, reasoning, and chat capabilities, including structured outputs and function calling. Gemma 3 12B is the second largest in the family of Gemma 3 models after [Gemma 3 27B](google/gemma-3-27b-it)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1741902625,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "google/gemma-3-12b-it": {
      id: "google/gemma-3-12b-it",
      name: "Google: Gemma 3 12B",
      description:
        "Gemma 3 introduces multimodality, supporting vision-language input and text outputs. It handles context windows up to 128k tokens, understands over 140 languages, and offers improved math, reasoning, and chat capabilities, including structured outputs and function calling. Gemma 3 12B is the second largest in the family of Gemma 3 models after [Gemma 3 27B](google/gemma-3-27b-it)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1741902625,
      cost: {
        input: 0.04,
        output: 0.14,
        reasoning: 0,
      },
      limit: {
        context: 96000,
      },
    },
    "google/gemma-3-27b-it:free": {
      id: "google/gemma-3-27b-it:free",
      name: "Google: Gemma 3 27B (free)",
      description:
        "Gemma 3 introduces multimodality, supporting vision-language input and text outputs. It handles context windows up to 128k tokens, understands over 140 languages, and offers improved math, reasoning, and chat capabilities, including structured outputs and function calling. Gemma 3 27B is Google's latest open source model, successor to [Gemma 2](google/gemma-2-27b-it)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1741756359,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 96000,
      },
    },
    "google/gemma-3-27b-it": {
      id: "google/gemma-3-27b-it",
      name: "Google: Gemma 3 27B",
      description:
        "Gemma 3 introduces multimodality, supporting vision-language input and text outputs. It handles context windows up to 128k tokens, understands over 140 languages, and offers improved math, reasoning, and chat capabilities, including structured outputs and function calling. Gemma 3 27B is Google's latest open source model, successor to [Gemma 2](google/gemma-2-27b-it)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1741756359,
      cost: {
        input: 0.07,
        output: 0.26,
        reasoning: 0,
      },
      limit: {
        context: 96000,
      },
    },
    "google/gemini-2.0-flash-lite-001": {
      id: "google/gemini-2.0-flash-lite-001",
      name: "Google: Gemini 2.0 Flash Lite",
      description:
        "Gemini 2.0 Flash Lite offers a significantly faster time to first token (TTFT) compared to [Gemini Flash 1.5](/google/gemini-flash-1.5), while maintaining quality on par with larger models like [Gemini Pro 1.5](/google/gemini-pro-1.5), all at extremely economical token prices.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1740506212,
      cost: {
        input: 0.075,
        output: 0.3,
        reasoning: 0,
      },
      limit: {
        context: 1048576,
      },
    },
    "google/gemini-2.0-flash-001": {
      id: "google/gemini-2.0-flash-001",
      name: "Google: Gemini 2.0 Flash",
      description:
        "Gemini Flash 2.0 offers a significantly faster time to first token (TTFT) compared to [Gemini Flash 1.5](/google/gemini-flash-1.5), while maintaining quality on par with larger models like [Gemini Pro 1.5](/google/gemini-pro-1.5). It introduces notable enhancements in multimodal understanding, coding capabilities, complex instruction following, and function calling. These advancements come together to deliver more seamless and robust agentic experiences.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1738769413,
      cost: {
        input: 0.1,
        output: 0.4,
        reasoning: 0,
        cache_read: 0.025,
        cache_write: 0.1833,
      },
      limit: {
        context: 1048576,
      },
    },
    "google/gemini-2.0-flash-exp:free": {
      id: "google/gemini-2.0-flash-exp:free",
      name: "Google: Gemini 2.0 Flash Experimental (free)",
      description:
        "Gemini Flash 2.0 offers a significantly faster time to first token (TTFT) compared to [Gemini Flash 1.5](/google/gemini-flash-1.5), while maintaining quality on par with larger models like [Gemini Pro 1.5](/google/gemini-pro-1.5). It introduces notable enhancements in multimodal understanding, coding capabilities, complex instruction following, and function calling. These advancements come together to deliver more seamless and robust agentic experiences.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1733937523,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 1048576,
      },
    },
    "google/gemini-flash-1.5-8b": {
      id: "google/gemini-flash-1.5-8b",
      name: "Google: Gemini 1.5 Flash 8B",
      description:
        "Gemini Flash 1.5 8B is optimized for speed and efficiency, offering enhanced performance in small prompt tasks like chat, transcription, and translation. With reduced latency, it is highly effective for real-time and large-scale operations. This model focuses on cost-effective solutions while maintaining high-quality results.\n\n[Click here to learn more about this model](https://developers.googleblog.com/en/gemini-15-flash-8b-is-now-generally-available-for-use/).\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1727913600,
      cost: {
        input: 0.0375,
        output: 0.15,
        reasoning: 0,
        cache_read: 0.01,
        cache_write: 0.0583,
      },
      limit: {
        context: 1000000,
      },
    },
    "google/gemma-2-27b-it": {
      id: "google/gemma-2-27b-it",
      name: "Google: Gemma 2 27B",
      description:
        "Gemma 2 27B by Google is an open model built from the same research and technology used to create the [Gemini models](/models?q=gemini).\n\nGemma models are well-suited for a variety of text generation tasks, including question answering, summarization, and reasoning.\n\nSee the [launch announcement](https://blog.google/technology/developers/google-gemma-2/) for more details. Usage of Gemma is subject to Google's [Gemma Terms of Use](https://ai.google.dev/gemma/terms).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1720828800,
      cost: {
        input: 0.65,
        output: 0.65,
        reasoning: 0,
      },
      limit: {
        context: 8192,
      },
    },
    "google/gemma-2-9b-it:free": {
      id: "google/gemma-2-9b-it:free",
      name: "Google: Gemma 2 9B (free)",
      description:
        "Gemma 2 9B by Google is an advanced, open-source language model that sets a new standard for efficiency and performance in its size class.\n\nDesigned for a wide variety of tasks, it empowers developers and researchers to build innovative applications, while maintaining accessibility, safety, and cost-effectiveness.\n\nSee the [launch announcement](https://blog.google/technology/developers/google-gemma-2/) for more details. Usage of Gemma is subject to Google's [Gemma Terms of Use](https://ai.google.dev/gemma/terms).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1719532800,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 8192,
      },
    },
    "google/gemma-2-9b-it": {
      id: "google/gemma-2-9b-it",
      name: "Google: Gemma 2 9B",
      description:
        "Gemma 2 9B by Google is an advanced, open-source language model that sets a new standard for efficiency and performance in its size class.\n\nDesigned for a wide variety of tasks, it empowers developers and researchers to build innovative applications, while maintaining accessibility, safety, and cost-effectiveness.\n\nSee the [launch announcement](https://blog.google/technology/developers/google-gemma-2/) for more details. Usage of Gemma is subject to Google's [Gemma Terms of Use](https://ai.google.dev/gemma/terms).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1719532800,
      cost: {
        input: 0.01,
        output: 0.02,
        reasoning: 0,
      },
      limit: {
        context: 8192,
      },
    },
    "google/gemini-flash-1.5": {
      id: "google/gemini-flash-1.5",
      name: "Google: Gemini 1.5 Flash ",
      description:
        "Gemini 1.5 Flash is a foundation model that performs well at a variety of multimodal tasks such as visual understanding, classification, summarization, and creating content from image, audio and video. It's adept at processing visual and text inputs such as photographs, documents, infographics, and screenshots.\n\nGemini 1.5 Flash is designed for high-volume, high-frequency tasks where cost and latency matter. On most common tasks, Flash achieves comparable quality to other Gemini Pro models at a significantly reduced cost. Flash is well-suited for applications like chat assistants and on-demand content generation where speed and scale matter.\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).\n\n#multimodal",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1715644800,
      cost: {
        input: 0.075,
        output: 0.3,
        reasoning: 0,
        cache_read: 0.01875,
        cache_write: 0.1583,
      },
      limit: {
        context: 1000000,
      },
    },
    "google/gemini-pro-1.5": {
      id: "google/gemini-pro-1.5",
      name: "Google: Gemini 1.5 Pro",
      description:
        "Google's latest multimodal model, supports image and video[0] in text or chat prompts.\n\nOptimized for language tasks including:\n\n- Code generation\n- Text generation\n- Text editing\n- Problem solving\n- Recommendations\n- Information extraction\n- Data extraction or generation\n- AI agents\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).\n\n* [0]: Video input is not available through OpenRouter at this time.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1712620800,
      cost: {
        input: 1.25,
        output: 5,
        reasoning: 0,
      },
      limit: {
        context: 2000000,
      },
    },
  },
} as const;
export default googleProvider;
