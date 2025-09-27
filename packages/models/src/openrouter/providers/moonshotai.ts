export const moonshotaiProvider = {
  id: "moonshotai",
  name: "moonshotai",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "moonshotai/kimi-k2-0905": {
      id: "moonshotai/kimi-k2-0905",
      name: "MoonshotAI: Kimi K2 0905",
      description:
        "Kimi K2 0905 is the September update of [Kimi K2 0711](moonshotai/kimi-k2). It is a large-scale Mixture-of-Experts (MoE) language model developed by Moonshot AI, featuring 1 trillion total parameters with 32 billion active per forward pass. It supports long-context inference up to 256k tokens, extended from the previous 128k.\n\nThis update improves agentic coding with higher accuracy and better generalization across scaffolds, and enhances frontend coding with more aesthetic and functional outputs for web, 3D, and related tasks. Kimi K2 is optimized for agentic capabilities, including advanced tool use, reasoning, and code synthesis. It excels across coding (LiveCodeBench, SWE-bench), reasoning (ZebraLogic, GPQA), and tool-use (Tau2, AceBench) benchmarks. The model is trained with a novel stack incorporating the MuonClip optimizer for stable large-scale MoE training.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1757021147,
      cost: {
        input: 0.38,
        output: 1.52,
        reasoning: 0,
      },
      limit: {
        context: 262144,
      },
    },
    "moonshotai/kimi-k2:free": {
      id: "moonshotai/kimi-k2:free",
      name: "MoonshotAI: Kimi K2 0711 (free)",
      description:
        "Kimi K2 Instruct is a large-scale Mixture-of-Experts (MoE) language model developed by Moonshot AI, featuring 1 trillion total parameters with 32 billion active per forward pass. It is optimized for agentic capabilities, including advanced tool use, reasoning, and code synthesis. Kimi K2 excels across a broad range of benchmarks, particularly in coding (LiveCodeBench, SWE-bench), reasoning (ZebraLogic, GPQA), and tool-use (Tau2, AceBench) tasks. It supports long-context inference up to 128K tokens and is designed with a novel training stack that includes the MuonClip optimizer for stable large-scale MoE training.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1752263252,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "moonshotai/kimi-k2": {
      id: "moonshotai/kimi-k2",
      name: "MoonshotAI: Kimi K2 0711",
      description:
        "Kimi K2 Instruct is a large-scale Mixture-of-Experts (MoE) language model developed by Moonshot AI, featuring 1 trillion total parameters with 32 billion active per forward pass. It is optimized for agentic capabilities, including advanced tool use, reasoning, and code synthesis. Kimi K2 excels across a broad range of benchmarks, particularly in coding (LiveCodeBench, SWE-bench), reasoning (ZebraLogic, GPQA), and tool-use (Tau2, AceBench) tasks. It supports long-context inference up to 128K tokens and is designed with a novel training stack that includes the MuonClip optimizer for stable large-scale MoE training.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1752263252,
      cost: {
        input: 0.14,
        output: 2.49,
        reasoning: 0,
      },
      limit: {
        context: 63000,
      },
    },
    "moonshotai/kimi-dev-72b:free": {
      id: "moonshotai/kimi-dev-72b:free",
      name: "MoonshotAI: Kimi Dev 72B (free)",
      description:
        "Kimi-Dev-72B is an open-source large language model fine-tuned for software engineering and issue resolution tasks. Based on Qwen2.5-72B, it is optimized using large-scale reinforcement learning that applies code patches in real repositories and validates them via full test suite execution—rewarding only correct, robust completions. The model achieves 60.4% on SWE-bench Verified, setting a new benchmark among open-source models for software bug fixing and code reasoning.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1750115909,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "moonshotai/kimi-dev-72b": {
      id: "moonshotai/kimi-dev-72b",
      name: "MoonshotAI: Kimi Dev 72B",
      description:
        "Kimi-Dev-72B is an open-source large language model fine-tuned for software engineering and issue resolution tasks. Based on Qwen2.5-72B, it is optimized using large-scale reinforcement learning that applies code patches in real repositories and validates them via full test suite execution—rewarding only correct, robust completions. The model achieves 60.4% on SWE-bench Verified, setting a new benchmark among open-source models for software bug fixing and code reasoning.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1750115909,
      cost: {
        input: 0.29,
        output: 1.15,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "moonshotai/kimi-vl-a3b-thinking:free": {
      id: "moonshotai/kimi-vl-a3b-thinking:free",
      name: "MoonshotAI: Kimi VL A3B Thinking (free)",
      description:
        "Kimi-VL is a lightweight Mixture-of-Experts vision-language model that activates only 2.8B parameters per step while delivering strong performance on multimodal reasoning and long-context tasks. The Kimi-VL-A3B-Thinking variant, fine-tuned with chain-of-thought and reinforcement learning, excels in math and visual reasoning benchmarks like MathVision, MMMU, and MathVista, rivaling much larger models such as Qwen2.5-VL-7B and Gemma-3-12B. It supports 128K context and high-resolution input via its MoonViT encoder.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1744304841,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "moonshotai/kimi-vl-a3b-thinking": {
      id: "moonshotai/kimi-vl-a3b-thinking",
      name: "MoonshotAI: Kimi VL A3B Thinking",
      description:
        "Kimi-VL is a lightweight Mixture-of-Experts vision-language model that activates only 2.8B parameters per step while delivering strong performance on multimodal reasoning and long-context tasks. The Kimi-VL-A3B-Thinking variant, fine-tuned with chain-of-thought and reinforcement learning, excels in math and visual reasoning benchmarks like MathVision, MMMU, and MathVista, rivaling much larger models such as Qwen2.5-VL-7B and Gemma-3-12B. It supports 128K context and high-resolution input via its MoonViT encoder.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1744304841,
      cost: {
        input: 0.02,
        output: 0.07,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
  },
} as const;
export default moonshotaiProvider;
