export const meta_llamaProvider = {
  id: "meta-llama",
  name: "meta-llama",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "meta-llama/llama-3.3-8b-instruct:free": {
      id: "meta-llama/llama-3.3-8b-instruct:free",
      name: "Meta: Llama 3.3 8B Instruct (free)",
      description:
        "A lightweight and ultra-fast variant of Llama 3.3 70B, for use when quick response times are needed most.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1747230154,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "meta-llama/llama-guard-4-12b": {
      id: "meta-llama/llama-guard-4-12b",
      name: "Meta: Llama Guard 4 12B",
      description:
        "Llama Guard 4 is a Llama 4 Scout-derived multimodal pretrained model, fine-tuned for content safety classification. Similar to previous versions, it can be used to classify content in both LLM inputs (prompt classification) and in LLM responses (response classification). It acts as an LLM—generating text in its output that indicates whether a given prompt or response is safe or unsafe, and if unsafe, it also lists the content categories violated.\n\nLlama Guard 4 was aligned to safeguard against the standardized MLCommons hazards taxonomy and designed to support multimodal Llama 4 capabilities. Specifically, it combines features from previous Llama Guard models, providing content moderation for English and multiple supported languages, along with enhanced capabilities to handle mixed text-and-image prompts, including multiple images. Additionally, Llama Guard 4 is integrated into the Llama Moderations API, extending robust safety classification to text and images.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1745975193,
      cost: {
        input: 0.18,
        output: 0.18,
        reasoning: 0,
      },
      limit: {
        context: 163840,
      },
    },
    "meta-llama/llama-4-maverick:free": {
      id: "meta-llama/llama-4-maverick:free",
      name: "Meta: Llama 4 Maverick (free)",
      description:
        "Llama 4 Maverick 17B Instruct (128E) is a high-capacity multimodal language model from Meta, built on a mixture-of-experts (MoE) architecture with 128 experts and 17 billion active parameters per forward pass (400B total). It supports multilingual text and image input, and produces multilingual text and code output across 12 supported languages. Optimized for vision-language tasks, Maverick is instruction-tuned for assistant-like behavior, image reasoning, and general-purpose multimodal interaction.\n\nMaverick features early fusion for native multimodality and a 1 million token context window. It was trained on a curated mixture of public, licensed, and Meta-platform data, covering ~22 trillion tokens, with a knowledge cutoff in August 2024. Released on April 5, 2025 under the Llama 4 Community License, Maverick is suited for research and commercial applications requiring advanced multimodal understanding and high model throughput.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1743881822,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "meta-llama/llama-4-maverick": {
      id: "meta-llama/llama-4-maverick",
      name: "Meta: Llama 4 Maverick",
      description:
        "Llama 4 Maverick 17B Instruct (128E) is a high-capacity multimodal language model from Meta, built on a mixture-of-experts (MoE) architecture with 128 experts and 17 billion active parameters per forward pass (400B total). It supports multilingual text and image input, and produces multilingual text and code output across 12 supported languages. Optimized for vision-language tasks, Maverick is instruction-tuned for assistant-like behavior, image reasoning, and general-purpose multimodal interaction.\n\nMaverick features early fusion for native multimodality and a 1 million token context window. It was trained on a curated mixture of public, licensed, and Meta-platform data, covering ~22 trillion tokens, with a knowledge cutoff in August 2024. Released on April 5, 2025 under the Llama 4 Community License, Maverick is suited for research and commercial applications requiring advanced multimodal understanding and high model throughput.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1743881822,
      cost: {
        input: 0.15,
        output: 0.6,
        reasoning: 0,
      },
      limit: {
        context: 1048576,
      },
    },
    "meta-llama/llama-4-scout:free": {
      id: "meta-llama/llama-4-scout:free",
      name: "Meta: Llama 4 Scout (free)",
      description:
        "Llama 4 Scout 17B Instruct (16E) is a mixture-of-experts (MoE) language model developed by Meta, activating 17 billion parameters out of a total of 109B. It supports native multimodal input (text and image) and multilingual output (text and code) across 12 supported languages. Designed for assistant-style interaction and visual reasoning, Scout uses 16 experts per forward pass and features a context length of 10 million tokens, with a training corpus of ~40 trillion tokens.\n\nBuilt for high efficiency and local or commercial deployment, Llama 4 Scout incorporates early fusion for seamless modality integration. It is instruction-tuned for use in multilingual chat, captioning, and image understanding tasks. Released under the Llama 4 Community License, it was last trained on data up to August 2024 and launched publicly on April 5, 2025.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1743881519,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "meta-llama/llama-4-scout": {
      id: "meta-llama/llama-4-scout",
      name: "Meta: Llama 4 Scout",
      description:
        "Llama 4 Scout 17B Instruct (16E) is a mixture-of-experts (MoE) language model developed by Meta, activating 17 billion parameters out of a total of 109B. It supports native multimodal input (text and image) and multilingual output (text and code) across 12 supported languages. Designed for assistant-style interaction and visual reasoning, Scout uses 16 experts per forward pass and features a context length of 10 million tokens, with a training corpus of ~40 trillion tokens.\n\nBuilt for high efficiency and local or commercial deployment, Llama 4 Scout incorporates early fusion for seamless modality integration. It is instruction-tuned for use in multilingual chat, captioning, and image understanding tasks. Released under the Llama 4 Community License, it was last trained on data up to August 2024 and launched publicly on April 5, 2025.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1743881519,
      cost: {
        input: 0.08,
        output: 0.3,
        reasoning: 0,
      },
      limit: {
        context: 1048576,
      },
    },
    "meta-llama/llama-guard-3-8b": {
      id: "meta-llama/llama-guard-3-8b",
      name: "Llama Guard 3 8B",
      description:
        "Llama Guard 3 is a Llama-3.1-8B pretrained model, fine-tuned for content safety classification. Similar to previous versions, it can be used to classify content in both LLM inputs (prompt classification) and in LLM responses (response classification). It acts as an LLM – it generates text in its output that indicates whether a given prompt or response is safe or unsafe, and if unsafe, it also lists the content categories violated.\n\nLlama Guard 3 was aligned to safeguard against the MLCommons standardized hazards taxonomy and designed to support Llama 3.1 capabilities. Specifically, it provides content moderation in 8 languages, and was optimized to support safety and security for search and code interpreter tool calls.\n",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1739401318,
      cost: {
        input: 0.02,
        output: 0.06,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "meta-llama/llama-3.3-70b-instruct:free": {
      id: "meta-llama/llama-3.3-70b-instruct:free",
      name: "Meta: Llama 3.3 70B Instruct (free)",
      description:
        "The Meta Llama 3.3 multilingual large language model (LLM) is a pretrained and instruction tuned generative model in 70B (text in/text out). The Llama 3.3 instruction tuned text only model is optimized for multilingual dialogue use cases and outperforms many of the available open source and closed chat models on common industry benchmarks.\n\nSupported languages: English, German, French, Italian, Portuguese, Hindi, Spanish, and Thai.\n\n[Model Card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/MODEL_CARD.md)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1733506137,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 65536,
      },
    },
    "meta-llama/llama-3.3-70b-instruct": {
      id: "meta-llama/llama-3.3-70b-instruct",
      name: "Meta: Llama 3.3 70B Instruct",
      description:
        "The Meta Llama 3.3 multilingual large language model (LLM) is a pretrained and instruction tuned generative model in 70B (text in/text out). The Llama 3.3 instruction tuned text only model is optimized for multilingual dialogue use cases and outperforms many of the available open source and closed chat models on common industry benchmarks.\n\nSupported languages: English, German, French, Italian, Portuguese, Hindi, Spanish, and Thai.\n\n[Model Card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/MODEL_CARD.md)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1733506137,
      cost: {
        input: 0.04,
        output: 0.12,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "meta-llama/llama-3.2-11b-vision-instruct": {
      id: "meta-llama/llama-3.2-11b-vision-instruct",
      name: "Meta: Llama 3.2 11B Vision Instruct",
      description:
        "Llama 3.2 11B Vision is a multimodal model with 11 billion parameters, designed to handle tasks combining visual and textual data. It excels in tasks such as image captioning and visual question answering, bridging the gap between language generation and visual reasoning. Pre-trained on a massive dataset of image-text pairs, it performs well in complex, high-accuracy image analysis.\n\nIts ability to integrate visual understanding with language processing makes it an ideal solution for industries requiring comprehensive visual-linguistic AI applications, such as content creation, AI-driven customer service, and research.\n\nClick here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD_VISION.md).\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1727222400,
      cost: {
        input: 0.049,
        output: 0.049,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "meta-llama/llama-3.2-1b-instruct": {
      id: "meta-llama/llama-3.2-1b-instruct",
      name: "Meta: Llama 3.2 1B Instruct",
      description:
        "Llama 3.2 1B is a 1-billion-parameter language model focused on efficiently performing natural language tasks, such as summarization, dialogue, and multilingual text analysis. Its smaller size allows it to operate efficiently in low-resource environments while maintaining strong task performance.\n\nSupporting eight core languages and fine-tunable for more, Llama 1.3B is ideal for businesses or developers seeking lightweight yet powerful AI solutions that can operate in diverse multilingual settings without the high computational demand of larger models.\n\nClick here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md).\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1727222400,
      cost: {
        input: 0.005,
        output: 0.01,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "meta-llama/llama-3.2-3b-instruct:free": {
      id: "meta-llama/llama-3.2-3b-instruct:free",
      name: "Meta: Llama 3.2 3B Instruct (free)",
      description:
        "Llama 3.2 3B is a 3-billion-parameter multilingual large language model, optimized for advanced natural language processing tasks like dialogue generation, reasoning, and summarization. Designed with the latest transformer architecture, it supports eight languages, including English, Spanish, and Hindi, and is adaptable for additional languages.\n\nTrained on 9 trillion tokens, the Llama 3.2 3B model excels in instruction-following, complex reasoning, and tool use. Its balanced performance makes it ideal for applications needing accuracy and efficiency in text generation across multilingual settings.\n\nClick here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md).\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1727222400,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "meta-llama/llama-3.2-3b-instruct": {
      id: "meta-llama/llama-3.2-3b-instruct",
      name: "Meta: Llama 3.2 3B Instruct",
      description:
        "Llama 3.2 3B is a 3-billion-parameter multilingual large language model, optimized for advanced natural language processing tasks like dialogue generation, reasoning, and summarization. Designed with the latest transformer architecture, it supports eight languages, including English, Spanish, and Hindi, and is adaptable for additional languages.\n\nTrained on 9 trillion tokens, the Llama 3.2 3B model excels in instruction-following, complex reasoning, and tool use. Its balanced performance makes it ideal for applications needing accuracy and efficiency in text generation across multilingual settings.\n\nClick here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md).\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1727222400,
      cost: {
        input: 0.02,
        output: 0.02,
        reasoning: 0,
      },
      limit: {
        context: 16384,
      },
    },
    "meta-llama/llama-3.2-90b-vision-instruct": {
      id: "meta-llama/llama-3.2-90b-vision-instruct",
      name: "Meta: Llama 3.2 90B Vision Instruct",
      description:
        "The Llama 90B Vision model is a top-tier, 90-billion-parameter multimodal model designed for the most challenging visual reasoning and language tasks. It offers unparalleled accuracy in image captioning, visual question answering, and advanced image-text comprehension. Pre-trained on vast multimodal datasets and fine-tuned with human feedback, the Llama 90B Vision is engineered to handle the most demanding image-based AI tasks.\n\nThis model is perfect for industries requiring cutting-edge multimodal AI capabilities, particularly those dealing with complex, real-time visual and textual analysis.\n\nClick here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD_VISION.md).\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1727222400,
      cost: {
        input: 0.35,
        output: 0.4,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "meta-llama/llama-3.1-405b": {
      id: "meta-llama/llama-3.1-405b",
      name: "Meta: Llama 3.1 405B (base)",
      description:
        "Meta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This is the base 405B pre-trained version.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1722556800,
      cost: {
        input: 2,
        output: 2,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "meta-llama/llama-3.1-8b-instruct": {
      id: "meta-llama/llama-3.1-8b-instruct",
      name: "Meta: Llama 3.1 8B Instruct",
      description:
        "Meta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This 8B instruct-tuned version is fast and efficient.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3-1/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1721692800,
      cost: {
        input: 0.02,
        output: 0.03,
        reasoning: 0,
      },
      limit: {
        context: 16384,
      },
    },
    "meta-llama/llama-3.1-70b-instruct": {
      id: "meta-llama/llama-3.1-70b-instruct",
      name: "Meta: Llama 3.1 70B Instruct",
      description:
        "Meta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This 70B instruct-tuned version is optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3-1/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1721692800,
      cost: {
        input: 0.1,
        output: 0.28,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "meta-llama/llama-3.1-405b-instruct": {
      id: "meta-llama/llama-3.1-405b-instruct",
      name: "Meta: Llama 3.1 405B Instruct",
      description:
        "The highly anticipated 400B class of Llama3 is here! Clocking in at 128k context with impressive eval scores, the Meta AI team continues to push the frontier of open-source LLMs.\n\nMeta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This 405B instruct-tuned version is optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models including GPT-4o and Claude 3.5 Sonnet in evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3-1/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1721692800,
      cost: {
        input: 0.8,
        output: 0.8,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "meta-llama/llama-guard-2-8b": {
      id: "meta-llama/llama-guard-2-8b",
      name: "Meta: LlamaGuard 2 8B",
      description:
        "This safeguard model has 8B parameters and is based on the Llama 3 family. Just like is predecessor, [LlamaGuard 1](https://huggingface.co/meta-llama/LlamaGuard-7b), it can do both prompt and response classification.\n\nLlamaGuard 2 acts as a normal LLM would, generating text that indicates whether the given input/output is safe/unsafe. If deemed unsafe, it will also share the content categories violated.\n\nFor best results, please use raw prompt input or the `/completions` endpoint, instead of the chat API.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1715558400,
      cost: {
        input: 0.2,
        output: 0.2,
        reasoning: 0,
      },
      limit: {
        context: 8192,
      },
    },
    "meta-llama/llama-3-8b-instruct": {
      id: "meta-llama/llama-3-8b-instruct",
      name: "Meta: Llama 3 8B Instruct",
      description:
        "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 8B instruct-tuned version was optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1713398400,
      cost: {
        input: 0.03,
        output: 0.06,
        reasoning: 0,
      },
      limit: {
        context: 8192,
      },
    },
    "meta-llama/llama-3-70b-instruct": {
      id: "meta-llama/llama-3-70b-instruct",
      name: "Meta: Llama 3 70B Instruct",
      description:
        "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 70B instruct-tuned version was optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1713398400,
      cost: {
        input: 0.3,
        output: 0.4,
        reasoning: 0,
      },
      limit: {
        context: 8192,
      },
    },
  },
} as const;
export default meta_llamaProvider;
