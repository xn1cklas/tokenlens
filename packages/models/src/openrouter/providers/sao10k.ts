export const sao10kProvider = {
  id: "sao10k",
  name: "sao10k",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "sao10k/l3.3-euryale-70b": {
      id: "sao10k/l3.3-euryale-70b",
      name: "Sao10K: Llama 3.3 Euryale 70B",
      description:
        "Euryale L3.3 70B is a model focused on creative roleplay from [Sao10k](https://ko-fi.com/sao10k). It is the successor of [Euryale L3 70B v2.2](/models/sao10k/l3-euryale-70b).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1734535928,
      cost: {
        input: 0.65,
        output: 0.75,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "sao10k/l3.1-euryale-70b": {
      id: "sao10k/l3.1-euryale-70b",
      name: "Sao10K: Llama 3.1 Euryale 70B v2.2",
      description:
        "Euryale L3.1 70B v2.2 is a model focused on creative roleplay from [Sao10k](https://ko-fi.com/sao10k). It is the successor of [Euryale L3 70B v2.1](/models/sao10k/l3-euryale-70b).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1724803200,
      cost: {
        input: 0.65,
        output: 0.75,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "sao10k/l3-lunaris-8b": {
      id: "sao10k/l3-lunaris-8b",
      name: "Sao10K: Llama 3 8B Lunaris",
      description:
        "Lunaris 8B is a versatile generalist and roleplaying model based on Llama 3. It's a strategic merge of multiple models, designed to balance creativity with improved logic and general knowledge.\n\nCreated by [Sao10k](https://huggingface.co/Sao10k), this model aims to offer an improved experience over Stheno v3.2, with enhanced creativity and logical reasoning.\n\nFor best results, use with Llama 3 Instruct context template, temperature 1.4, and min_p 0.1.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1723507200,
      cost: {
        input: 0.04,
        output: 0.05,
        reasoning: 0,
      },
      limit: {
        context: 8192,
      },
    },
    "sao10k/l3-euryale-70b": {
      id: "sao10k/l3-euryale-70b",
      name: "Sao10k: Llama 3 Euryale 70B v2.1",
      description:
        "Euryale 70B v2.1 is a model focused on creative roleplay from [Sao10k](https://ko-fi.com/sao10k).\n\n- Better prompt adherence.\n- Better anatomy / spatial awareness.\n- Adapts much better to unique and custom formatting / reply formats.\n- Very creative, lots of unique swipes.\n- Is not restrictive during roleplays.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1718668800,
      cost: {
        input: 1.48,
        output: 1.48,
        reasoning: 0,
      },
      limit: {
        context: 8192,
      },
    },
  },
} as const;
export default sao10kProvider;
