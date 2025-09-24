export const nousresearchProvider = {
  id: "nousresearch",
  name: "nousresearch",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "nousresearch/hermes-4-70b": {
      id: "nousresearch/hermes-4-70b",
      name: "Nous: Hermes 4 70B",
      description:
        "Hermes 4 70B is a hybrid reasoning model from Nous Research, built on Meta-Llama-3.1-70B. It introduces the same hybrid mode as the larger 405B release, allowing the model to either respond directly or generate explicit <think>...</think> reasoning traces before answering. Users can control the reasoning behaviour with the `reasoning` `enabled` boolean. [Learn more in our docs](https://openrouter.ai/docs/use-cases/reasoning-tokens#enable-reasoning-with-default-config)\n\nThis 70B variant is trained with the expanded post-training corpus (~60B tokens) emphasizing verified reasoning data, leading to improvements in mathematics, coding, STEM, logic, and structured outputs while maintaining general assistant performance. It supports JSON mode, schema adherence, function calling, and tool use, and is designed for greater steerability with reduced refusal rates.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1756236182,
      cost: {
        input: 0.11,
        output: 0.38,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "nousresearch/hermes-4-405b": {
      id: "nousresearch/hermes-4-405b",
      name: "Nous: Hermes 4 405B",
      description:
        "Hermes 4 is a large-scale reasoning model built on Meta-Llama-3.1-405B and released by Nous Research. It introduces a hybrid reasoning mode, where the model can choose to deliberate internally with <think>...</think> traces or respond directly, offering flexibility between speed and depth. Users can control the reasoning behaviour with the `reasoning` `enabled` boolean. [Learn more in our docs](https://openrouter.ai/docs/use-cases/reasoning-tokens#enable-reasoning-with-default-config)\n\nThe model is instruction-tuned with an expanded post-training corpus (~60B tokens) emphasizing reasoning traces, improving performance in math, code, STEM, and logical reasoning, while retaining broad assistant utility. It also supports structured outputs, including JSON mode, schema adherence, function calling, and tool use. Hermes 4 is trained for steerability, lower refusal rates, and alignment toward neutral, user-directed behavior.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1756235463,
      cost: {
        input: 0.25,
        output: 1,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "nousresearch/deephermes-3-mistral-24b-preview": {
      id: "nousresearch/deephermes-3-mistral-24b-preview",
      name: "Nous: DeepHermes 3 Mistral 24B Preview",
      description:
        'DeepHermes 3 (Mistral 24B Preview) is an instruction-tuned language model by Nous Research based on Mistral-Small-24B, designed for chat, function calling, and advanced multi-turn reasoning. It introduces a dual-mode system that toggles between intuitive chat responses and structured “deep reasoning” mode using special system prompts. Fine-tuned via distillation from R1, it supports structured output (JSON mode) and function call syntax for agent-based applications.\n\nDeepHermes 3 supports a **reasoning toggle via system prompt**, allowing users to switch between fast, intuitive responses and deliberate, multi-step reasoning. When activated with the following specific system instruction, the model enters a *"deep thinking"* mode—generating extended chains of thought wrapped in `<think></think>` tags before delivering a final answer. \n\nSystem Prompt: You are a deep thinking AI, you may use extremely long chains of thought to deeply consider the problem and deliberate with yourself via systematic reasoning processes to help come to a correct solution prior to answering. You should enclose your thoughts and internal monologue inside <think> </think> tags, and then provide your solution or response to the problem.\n',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1746830904,
      cost: {
        input: 0.13,
        output: 0.51,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "nousresearch/deephermes-3-llama-3-8b-preview:free": {
      id: "nousresearch/deephermes-3-llama-3-8b-preview:free",
      name: "Nous: DeepHermes 3 Llama 3 8B Preview (free)",
      description:
        'DeepHermes 3 Preview is the latest version of our flagship Hermes series of LLMs by Nous Research, and one of the first models in the world to unify Reasoning (long chains of thought that improve answer accuracy) and normal LLM response modes into one model. We have also improved LLM annotation, judgement, and function calling.\n\nDeepHermes 3 Preview is one of the first LLM models to unify both "intuitive", traditional mode responses and long chain of thought reasoning responses into a single model, toggled by a system prompt.',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1740719372,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "nousresearch/deephermes-3-llama-3-8b-preview": {
      id: "nousresearch/deephermes-3-llama-3-8b-preview",
      name: "Nous: DeepHermes 3 Llama 3 8B Preview",
      description:
        'DeepHermes 3 Preview is the latest version of our flagship Hermes series of LLMs by Nous Research, and one of the first models in the world to unify Reasoning (long chains of thought that improve answer accuracy) and normal LLM response modes into one model. We have also improved LLM annotation, judgement, and function calling.\n\nDeepHermes 3 Preview is one of the first LLM models to unify both "intuitive", traditional mode responses and long chain of thought reasoning responses into a single model, toggled by a system prompt.',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1740719372,
      cost: {
        input: 0.01,
        output: 0.05,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "nousresearch/hermes-3-llama-3.1-70b": {
      id: "nousresearch/hermes-3-llama-3.1-70b",
      name: "Nous: Hermes 3 70B Instruct",
      description:
        "Hermes 3 is a generalist language model with many improvements over [Hermes 2](/models/nousresearch/nous-hermes-2-mistral-7b-dpo), including advanced agentic capabilities, much better roleplaying, reasoning, multi-turn conversation, long context coherence, and improvements across the board.\n\nHermes 3 70B is a competitive, if not superior finetune of the [Llama-3.1 70B foundation model](/models/meta-llama/llama-3.1-70b-instruct), focused on aligning LLMs to the user, with powerful steering capabilities and control given to the end user.\n\nThe Hermes 3 series builds and expands on the Hermes 2 set of capabilities, including more powerful and reliable function calling and structured output capabilities, generalist assistant capabilities, and improved code generation skills.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1723939200,
      cost: {
        input: 0.12,
        output: 0.3,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "nousresearch/hermes-3-llama-3.1-405b": {
      id: "nousresearch/hermes-3-llama-3.1-405b",
      name: "Nous: Hermes 3 405B Instruct",
      description:
        "Hermes 3 is a generalist language model with many improvements over Hermes 2, including advanced agentic capabilities, much better roleplaying, reasoning, multi-turn conversation, long context coherence, and improvements across the board.\n\nHermes 3 405B is a frontier-level, full-parameter finetune of the Llama-3.1 405B foundation model, focused on aligning LLMs to the user, with powerful steering capabilities and control given to the end user.\n\nThe Hermes 3 series builds and expands on the Hermes 2 set of capabilities, including more powerful and reliable function calling and structured output capabilities, generalist assistant capabilities, and improved code generation skills.\n\nHermes 3 is competitive, if not superior, to Llama-3.1 Instruct models at general capabilities, with varying strengths and weaknesses attributable between the two.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1723766400,
      cost: {
        input: 0.8,
        output: 0.8,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "nousresearch/hermes-2-pro-llama-3-8b": {
      id: "nousresearch/hermes-2-pro-llama-3-8b",
      name: "NousResearch: Hermes 2 Pro - Llama-3 8B",
      description:
        "Hermes 2 Pro is an upgraded, retrained version of Nous Hermes 2, consisting of an updated and cleaned version of the OpenHermes 2.5 Dataset, as well as a newly introduced Function Calling and JSON Mode dataset developed in-house.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1716768000,
      cost: {
        input: 0.025,
        output: 0.04,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
  },
} as const;
export default nousresearchProvider;
