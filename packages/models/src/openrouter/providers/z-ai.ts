export const z_aiProvider = {
  id: "z-ai",
  name: "z-ai",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "z-ai/glm-4.5v": {
      id: "z-ai/glm-4.5v",
      name: "Z.AI: GLM 4.5V",
      description:
        'GLM-4.5V is a vision-language foundation model for multimodal agent applications. Built on a Mixture-of-Experts (MoE) architecture with 106B parameters and 12B activated parameters, it achieves state-of-the-art results in video understanding, image Q&A, OCR, and document parsing, with strong gains in front-end web coding, grounding, and spatial reasoning. It offers a hybrid inference mode: a "thinking mode" for deep reasoning and a "non-thinking mode" for fast responses. Reasoning behavior can be toggled via the `reasoning` `enabled` boolean. [Learn more in our docs](https://openrouter.ai/docs/use-cases/reasoning-tokens#enable-reasoning-with-default-config)',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1754922288,
      cost: {
        input: 0.5,
        output: 1.8,
        reasoning: 0,
      },
      limit: {
        context: 65536,
      },
    },
    "z-ai/glm-4.5": {
      id: "z-ai/glm-4.5",
      name: "Z.AI: GLM 4.5",
      description:
        'GLM-4.5 is our latest flagship foundation model, purpose-built for agent-based applications. It leverages a Mixture-of-Experts (MoE) architecture and supports a context length of up to 128k tokens. GLM-4.5 delivers significantly enhanced capabilities in reasoning, code generation, and agent alignment. It supports a hybrid inference mode with two options, a "thinking mode" designed for complex reasoning and tool use, and a "non-thinking mode" optimized for instant responses. Users can control the reasoning behaviour with the `reasoning` `enabled` boolean. [Learn more in our docs](https://openrouter.ai/docs/use-cases/reasoning-tokens#enable-reasoning-with-default-config)',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1753471347,
      cost: {
        input: 0.41,
        output: 1.65,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "z-ai/glm-4.5-air:free": {
      id: "z-ai/glm-4.5-air:free",
      name: "Z.AI: GLM 4.5 Air (free)",
      description:
        'GLM-4.5-Air is the lightweight variant of our latest flagship model family, also purpose-built for agent-centric applications. Like GLM-4.5, it adopts the Mixture-of-Experts (MoE) architecture but with a more compact parameter size. GLM-4.5-Air also supports hybrid inference modes, offering a "thinking mode" for advanced reasoning and tool use, and a "non-thinking mode" for real-time interaction. Users can control the reasoning behaviour with the `reasoning` `enabled` boolean. [Learn more in our docs](https://openrouter.ai/docs/use-cases/reasoning-tokens#enable-reasoning-with-default-config)',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1753471258,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "z-ai/glm-4.5-air": {
      id: "z-ai/glm-4.5-air",
      name: "Z.AI: GLM 4.5 Air",
      description:
        'GLM-4.5-Air is the lightweight variant of our latest flagship model family, also purpose-built for agent-centric applications. Like GLM-4.5, it adopts the Mixture-of-Experts (MoE) architecture but with a more compact parameter size. GLM-4.5-Air also supports hybrid inference modes, offering a "thinking mode" for advanced reasoning and tool use, and a "non-thinking mode" for real-time interaction. Users can control the reasoning behaviour with the `reasoning` `enabled` boolean. [Learn more in our docs](https://openrouter.ai/docs/use-cases/reasoning-tokens#enable-reasoning-with-default-config)',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1753471258,
      cost: {
        input: 0.14,
        output: 0.86,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "z-ai/glm-4-32b": {
      id: "z-ai/glm-4-32b",
      name: "Z.AI: GLM 4 32B ",
      description:
        "GLM 4 32B is a cost-effective foundation language model.\n\nIt can efficiently perform complex tasks and has significantly enhanced capabilities in tool use, online search, and code-related intelligent tasks.\n\nIt is made by the same lab behind the thudm models.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1753376617,
      cost: {
        input: 0.1,
        output: 0.1,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
  },
} as const;
export default z_aiProvider;
