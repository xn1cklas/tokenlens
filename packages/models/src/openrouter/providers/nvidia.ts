export const nvidiaProvider = {
  id: "nvidia",
  name: "nvidia",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "nvidia/nemotron-nano-9b-v2:free": {
      id: "nvidia/nemotron-nano-9b-v2:free",
      name: "NVIDIA: Nemotron Nano 9B V2 (free)",
      description:
        "NVIDIA-Nemotron-Nano-9B-v2 is a large language model (LLM) trained from scratch by NVIDIA, and designed as a unified model for both reasoning and non-reasoning tasks. It responds to user queries and tasks by first generating a reasoning trace and then concluding with a final response. \n\nThe model's reasoning capabilities can be controlled via a system prompt. If the user prefers the model to provide its final answer without intermediate reasoning traces, it can be configured to do so.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1757106807,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "nvidia/nemotron-nano-9b-v2": {
      id: "nvidia/nemotron-nano-9b-v2",
      name: "NVIDIA: Nemotron Nano 9B V2",
      description:
        "NVIDIA-Nemotron-Nano-9B-v2 is a large language model (LLM) trained from scratch by NVIDIA, and designed as a unified model for both reasoning and non-reasoning tasks. It responds to user queries and tasks by first generating a reasoning trace and then concluding with a final response. \n\nThe model's reasoning capabilities can be controlled via a system prompt. If the user prefers the model to provide its final answer without intermediate reasoning traces, it can be configured to do so.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1757106807,
      cost: {
        input: 0.04,
        output: 0.16,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "nvidia/llama-3.1-nemotron-ultra-253b-v1": {
      id: "nvidia/llama-3.1-nemotron-ultra-253b-v1",
      name: "NVIDIA: Llama 3.1 Nemotron Ultra 253B v1",
      description:
        "Llama-3.1-Nemotron-Ultra-253B-v1 is a large language model (LLM) optimized for advanced reasoning, human-interactive chat, retrieval-augmented generation (RAG), and tool-calling tasks. Derived from Meta’s Llama-3.1-405B-Instruct, it has been significantly customized using Neural Architecture Search (NAS), resulting in enhanced efficiency, reduced memory usage, and improved inference latency. The model supports a context length of up to 128K tokens and can operate efficiently on an 8x NVIDIA H100 node.\n\nNote: you must include `detailed thinking on` in the system prompt to enable reasoning. Please see [Usage Recommendations](https://huggingface.co/nvidia/Llama-3_1-Nemotron-Ultra-253B-v1#quick-start-and-usage-recommendations) for more.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1744115059,
      cost: {
        input: 0.6,
        output: 1.8,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "nvidia/llama-3.1-nemotron-70b-instruct": {
      id: "nvidia/llama-3.1-nemotron-70b-instruct",
      name: "NVIDIA: Llama 3.1 Nemotron 70B Instruct",
      description:
        "NVIDIA's Llama 3.1 Nemotron 70B is a language model designed for generating precise and useful responses. Leveraging [Llama 3.1 70B](/models/meta-llama/llama-3.1-70b-instruct) architecture and Reinforcement Learning from Human Feedback (RLHF), it excels in automatic alignment benchmarks. This model is tailored for applications requiring high accuracy in helpfulness and response generation, suitable for diverse user queries across multiple domains.\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1728950400,
      cost: {
        input: 0.6,
        output: 0.6,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
  },
} as const;
export default nvidiaProvider;
