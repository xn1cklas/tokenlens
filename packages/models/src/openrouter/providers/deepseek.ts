export const deepseekProvider = {
  id: "deepseek",
  name: "deepseek",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "deepseek/deepseek-v3.1-terminus": {
      id: "deepseek/deepseek-v3.1-terminus",
      name: "DeepSeek: DeepSeek V3.1 Terminus",
      description:
        "DeepSeek-V3.1 Terminus is an update to [DeepSeek V3.1](/deepseek/deepseek-chat-v3.1) that maintains the model's original capabilities while addressing issues reported by users, including language consistency and agent capabilities, further optimizing the model's performance in coding and search agents. It is a large hybrid reasoning model (671B parameters, 37B active) that supports both thinking and non-thinking modes. It extends the DeepSeek-V3 base with a two-phase long-context training process, reaching up to 128K tokens, and uses FP8 microscaling for efficient inference. Users can control the reasoning behaviour with the `reasoning` `enabled` boolean. [Learn more in our docs](https://openrouter.ai/docs/use-cases/reasoning-tokens#enable-reasoning-with-default-config)\n\nThe model improves tool use, code generation, and reasoning efficiency, achieving performance comparable to DeepSeek-R1 on difficult benchmarks while responding more quickly. It supports structured tool calling, code agents, and search agents, making it suitable for research, coding, and agentic workflows. ",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1758548275,
      cost: {
        input: 0.27,
        output: 1,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "deepseek/deepseek-chat-v3.1:free": {
      id: "deepseek/deepseek-chat-v3.1:free",
      name: "DeepSeek: DeepSeek V3.1 (free)",
      description:
        "DeepSeek-V3.1 is a large hybrid reasoning model (671B parameters, 37B active) that supports both thinking and non-thinking modes via prompt templates. It extends the DeepSeek-V3 base with a two-phase long-context training process, reaching up to 128K tokens, and uses FP8 microscaling for efficient inference. Users can control the reasoning behaviour with the `reasoning` `enabled` boolean. [Learn more in our docs](https://openrouter.ai/docs/use-cases/reasoning-tokens#enable-reasoning-with-default-config)\n\nThe model improves tool use, code generation, and reasoning efficiency, achieving performance comparable to DeepSeek-R1 on difficult benchmarks while responding more quickly. It supports structured tool calling, code agents, and search agents, making it suitable for research, coding, and agentic workflows. \n\nIt succeeds the [DeepSeek V3-0324](/deepseek/deepseek-chat-v3-0324) model and performs well on a variety of tasks.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1755779628,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 163840,
      },
    },
    "deepseek/deepseek-chat-v3.1": {
      id: "deepseek/deepseek-chat-v3.1",
      name: "DeepSeek: DeepSeek V3.1",
      description:
        "DeepSeek-V3.1 is a large hybrid reasoning model (671B parameters, 37B active) that supports both thinking and non-thinking modes via prompt templates. It extends the DeepSeek-V3 base with a two-phase long-context training process, reaching up to 128K tokens, and uses FP8 microscaling for efficient inference. Users can control the reasoning behaviour with the `reasoning` `enabled` boolean. [Learn more in our docs](https://openrouter.ai/docs/use-cases/reasoning-tokens#enable-reasoning-with-default-config)\n\nThe model improves tool use, code generation, and reasoning efficiency, achieving performance comparable to DeepSeek-R1 on difficult benchmarks while responding more quickly. It supports structured tool calling, code agents, and search agents, making it suitable for research, coding, and agentic workflows. \n\nIt succeeds the [DeepSeek V3-0324](/deepseek/deepseek-chat-v3-0324) model and performs well on a variety of tasks.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1755779628,
      cost: {
        input: 0.25,
        output: 1,
        reasoning: 0,
      },
      limit: {
        context: 163840,
      },
    },
    "deepseek/deepseek-v3.1-base": {
      id: "deepseek/deepseek-v3.1-base",
      name: "DeepSeek: DeepSeek V3.1 Base",
      description:
        "This is a base model, trained only for raw next-token prediction. Unlike instruct/chat models, it has not been fine-tuned to follow user instructions. Prompts need to be written more like training text or examples rather than simple requests (e.g., “Translate the following sentence…” instead of just “Translate this”).\n\nDeepSeek-V3.1 Base is a 671B parameter open Mixture-of-Experts (MoE) language model with 37B active parameters per forward pass and a context length of 128K tokens. Trained on 14.8T tokens using FP8 mixed precision, it achieves high training efficiency and stability, with strong performance across language, reasoning, math, and coding tasks. \n",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1755727017,
      cost: {
        input: 0.25,
        output: 1,
        reasoning: 0,
      },
      limit: {
        context: 163840,
      },
    },
    "deepseek/deepseek-r1-0528-qwen3-8b:free": {
      id: "deepseek/deepseek-r1-0528-qwen3-8b:free",
      name: "DeepSeek: Deepseek R1 0528 Qwen3 8B (free)",
      description:
        "DeepSeek-R1-0528 is a lightly upgraded release of DeepSeek R1 that taps more compute and smarter post-training tricks, pushing its reasoning and inference to the brink of flagship models like O3 and Gemini 2.5 Pro.\nIt now tops math, programming, and logic leaderboards, showcasing a step-change in depth-of-thought.\nThe distilled variant, DeepSeek-R1-0528-Qwen3-8B, transfers this chain-of-thought into an 8 B-parameter form, beating standard Qwen3 8B by +10 pp and tying the 235 B “thinking” giant on AIME 2024.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1748538543,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "deepseek/deepseek-r1-0528-qwen3-8b": {
      id: "deepseek/deepseek-r1-0528-qwen3-8b",
      name: "DeepSeek: Deepseek R1 0528 Qwen3 8B",
      description:
        "DeepSeek-R1-0528 is a lightly upgraded release of DeepSeek R1 that taps more compute and smarter post-training tricks, pushing its reasoning and inference to the brink of flagship models like O3 and Gemini 2.5 Pro.\nIt now tops math, programming, and logic leaderboards, showcasing a step-change in depth-of-thought.\nThe distilled variant, DeepSeek-R1-0528-Qwen3-8B, transfers this chain-of-thought into an 8 B-parameter form, beating standard Qwen3 8B by +10 pp and tying the 235 B “thinking” giant on AIME 2024.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1748538543,
      cost: {
        input: 0.01,
        output: 0.05,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "deepseek/deepseek-r1-0528:free": {
      id: "deepseek/deepseek-r1-0528:free",
      name: "DeepSeek: R1 0528 (free)",
      description:
        "May 28th update to the [original DeepSeek R1](/deepseek/deepseek-r1) Performance on par with [OpenAI o1](/openai/o1), but open-sourced and with fully open reasoning tokens. It's 671B parameters in size, with 37B active in an inference pass.\n\nFully open-source model.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1748455170,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 163840,
      },
    },
    "deepseek/deepseek-r1-0528": {
      id: "deepseek/deepseek-r1-0528",
      name: "DeepSeek: R1 0528",
      description:
        "May 28th update to the [original DeepSeek R1](/deepseek/deepseek-r1) Performance on par with [OpenAI o1](/openai/o1), but open-sourced and with fully open reasoning tokens. It's 671B parameters in size, with 37B active in an inference pass.\n\nFully open-source model.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1748455170,
      cost: {
        input: 0.4,
        output: 1.75,
        reasoning: 0,
      },
      limit: {
        context: 163840,
      },
    },
    "deepseek/deepseek-prover-v2": {
      id: "deepseek/deepseek-prover-v2",
      name: "DeepSeek: DeepSeek Prover V2",
      description:
        "DeepSeek Prover V2 is a 671B parameter model, speculated to be geared towards logic and mathematics. Likely an upgrade from [DeepSeek-Prover-V1.5](https://huggingface.co/deepseek-ai/DeepSeek-Prover-V1.5-RL) Not much is known about the model yet, as DeepSeek released it on Hugging Face without an announcement or description.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1746013094,
      cost: {
        input: 0.5,
        output: 2.18,
        reasoning: 0,
      },
      limit: {
        context: 163840,
      },
    },
    "deepseek/deepseek-chat-v3-0324:free": {
      id: "deepseek/deepseek-chat-v3-0324:free",
      name: "DeepSeek: DeepSeek V3 0324 (free)",
      description:
        "DeepSeek V3, a 685B-parameter, mixture-of-experts model, is the latest iteration of the flagship chat model family from the DeepSeek team.\n\nIt succeeds the [DeepSeek V3](/deepseek/deepseek-chat-v3) model and performs really well on a variety of tasks.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1742824755,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 163840,
      },
    },
    "deepseek/deepseek-chat-v3-0324": {
      id: "deepseek/deepseek-chat-v3-0324",
      name: "DeepSeek: DeepSeek V3 0324",
      description:
        "DeepSeek V3, a 685B-parameter, mixture-of-experts model, is the latest iteration of the flagship chat model family from the DeepSeek team.\n\nIt succeeds the [DeepSeek V3](/deepseek/deepseek-chat-v3) model and performs really well on a variety of tasks.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1742824755,
      cost: {
        input: 0.25,
        output: 1,
        reasoning: 0,
      },
      limit: {
        context: 163840,
      },
    },
    "deepseek/deepseek-r1-distill-llama-8b": {
      id: "deepseek/deepseek-r1-distill-llama-8b",
      name: "DeepSeek: R1 Distill Llama 8B",
      description:
        "DeepSeek R1 Distill Llama 8B is a distilled large language model based on [Llama-3.1-8B-Instruct](/meta-llama/llama-3.1-8b-instruct), using outputs from [DeepSeek R1](/deepseek/deepseek-r1). The model combines advanced distillation techniques to achieve high performance across multiple benchmarks, including:\n\n- AIME 2024 pass@1: 50.4\n- MATH-500 pass@1: 89.1\n- CodeForces Rating: 1205\n\nThe model leverages fine-tuning from DeepSeek R1's outputs, enabling competitive performance comparable to larger frontier models.\n\nHugging Face: \n- [Llama-3.1-8B](https://huggingface.co/meta-llama/Llama-3.1-8B) \n- [DeepSeek-R1-Distill-Llama-8B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B)   |",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1738937718,
      cost: {
        input: 0.04,
        output: 0.04,
        reasoning: 0,
      },
      limit: {
        context: 32000,
      },
    },
    "deepseek/deepseek-r1-distill-qwen-32b": {
      id: "deepseek/deepseek-r1-distill-qwen-32b",
      name: "DeepSeek: R1 Distill Qwen 32B",
      description:
        "DeepSeek R1 Distill Qwen 32B is a distilled large language model based on [Qwen 2.5 32B](https://huggingface.co/Qwen/Qwen2.5-32B), using outputs from [DeepSeek R1](/deepseek/deepseek-r1). It outperforms OpenAI's o1-mini across various benchmarks, achieving new state-of-the-art results for dense models.\\n\\nOther benchmark results include:\\n\\n- AIME 2024 pass@1: 72.6\\n- MATH-500 pass@1: 94.3\\n- CodeForces Rating: 1691\\n\\nThe model leverages fine-tuning from DeepSeek R1's outputs, enabling competitive performance comparable to larger frontier models.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1738194830,
      cost: {
        input: 0.27,
        output: 0.27,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "deepseek/deepseek-r1-distill-qwen-14b": {
      id: "deepseek/deepseek-r1-distill-qwen-14b",
      name: "DeepSeek: R1 Distill Qwen 14B",
      description:
        "DeepSeek R1 Distill Qwen 14B is a distilled large language model based on [Qwen 2.5 14B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B), using outputs from [DeepSeek R1](/deepseek/deepseek-r1). It outperforms OpenAI's o1-mini across various benchmarks, achieving new state-of-the-art results for dense models.\n\nOther benchmark results include:\n\n- AIME 2024 pass@1: 69.7\n- MATH-500 pass@1: 93.9\n- CodeForces Rating: 1481\n\nThe model leverages fine-tuning from DeepSeek R1's outputs, enabling competitive performance comparable to larger frontier models.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1738193940,
      cost: {
        input: 0.15,
        output: 0.15,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "deepseek/deepseek-r1-distill-llama-70b:free": {
      id: "deepseek/deepseek-r1-distill-llama-70b:free",
      name: "DeepSeek: R1 Distill Llama 70B (free)",
      description:
        "DeepSeek R1 Distill Llama 70B is a distilled large language model based on [Llama-3.3-70B-Instruct](/meta-llama/llama-3.3-70b-instruct), using outputs from [DeepSeek R1](/deepseek/deepseek-r1). The model combines advanced distillation techniques to achieve high performance across multiple benchmarks, including:\n\n- AIME 2024 pass@1: 70.0\n- MATH-500 pass@1: 94.5\n- CodeForces Rating: 1633\n\nThe model leverages fine-tuning from DeepSeek R1's outputs, enabling competitive performance comparable to larger frontier models.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1737663169,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 8192,
      },
    },
    "deepseek/deepseek-r1-distill-llama-70b": {
      id: "deepseek/deepseek-r1-distill-llama-70b",
      name: "DeepSeek: R1 Distill Llama 70B",
      description:
        "DeepSeek R1 Distill Llama 70B is a distilled large language model based on [Llama-3.3-70B-Instruct](/meta-llama/llama-3.3-70b-instruct), using outputs from [DeepSeek R1](/deepseek/deepseek-r1). The model combines advanced distillation techniques to achieve high performance across multiple benchmarks, including:\n\n- AIME 2024 pass@1: 70.0\n- MATH-500 pass@1: 94.5\n- CodeForces Rating: 1633\n\nThe model leverages fine-tuning from DeepSeek R1's outputs, enabling competitive performance comparable to larger frontier models.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1737663169,
      cost: {
        input: 0.03,
        output: 0.13,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "deepseek/deepseek-r1:free": {
      id: "deepseek/deepseek-r1:free",
      name: "DeepSeek: R1 (free)",
      description:
        "DeepSeek R1 is here: Performance on par with [OpenAI o1](/openai/o1), but open-sourced and with fully open reasoning tokens. It's 671B parameters in size, with 37B active in an inference pass.\n\nFully open-source model & [technical report](https://api-docs.deepseek.com/news/news250120).\n\nMIT licensed: Distill & commercialize freely!",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1737381095,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 163840,
      },
    },
    "deepseek/deepseek-r1": {
      id: "deepseek/deepseek-r1",
      name: "DeepSeek: R1",
      description:
        "DeepSeek R1 is here: Performance on par with [OpenAI o1](/openai/o1), but open-sourced and with fully open reasoning tokens. It's 671B parameters in size, with 37B active in an inference pass.\n\nFully open-source model & [technical report](https://api-docs.deepseek.com/news/news250120).\n\nMIT licensed: Distill & commercialize freely!",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1737381095,
      cost: {
        input: 0.4,
        output: 2,
        reasoning: 0,
      },
      limit: {
        context: 163840,
      },
    },
    "deepseek/deepseek-chat": {
      id: "deepseek/deepseek-chat",
      name: "DeepSeek: DeepSeek V3",
      description:
        "DeepSeek-V3 is the latest model from the DeepSeek team, building upon the instruction following and coding abilities of the previous versions. Pre-trained on nearly 15 trillion tokens, the reported evaluations reveal that the model outperforms other open-source models and rivals leading closed-source models.\n\nFor model details, please visit [the DeepSeek-V3 repo](https://github.com/deepseek-ai/DeepSeek-V3) for more information, or see the [launch announcement](https://api-docs.deepseek.com/news/news1226).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1735241320,
      cost: {
        input: 0.25,
        output: 1,
        reasoning: 0,
      },
      limit: {
        context: 163840,
      },
    },
  },
} as const;
export default deepseekProvider;
