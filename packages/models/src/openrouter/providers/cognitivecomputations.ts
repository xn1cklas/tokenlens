export const cognitivecomputationsProvider = {
  id: "cognitivecomputations",
  name: "cognitivecomputations",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "cognitivecomputations/dolphin-mistral-24b-venice-edition:free": {
      id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
      name: "Venice: Uncensored (free)",
      description:
        "Venice Uncensored Dolphin Mistral 24B Venice Edition is a fine-tuned variant of Mistral-Small-24B-Instruct-2501, developed by dphn.ai in collaboration with Venice.ai. This model is designed as an “uncensored” instruct-tuned LLM, preserving user control over alignment, system prompts, and behavior. Intended for advanced and unrestricted use cases, Venice Uncensored emphasizes steerability and transparent behavior, removing default safety and alignment layers typically found in mainstream assistant models.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1752094966,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "cognitivecomputations/dolphin3.0-r1-mistral-24b:free": {
      id: "cognitivecomputations/dolphin3.0-r1-mistral-24b:free",
      name: "Dolphin3.0 R1 Mistral 24B (free)",
      description:
        "Dolphin 3.0 R1 is the next generation of the Dolphin series of instruct-tuned models.  Designed to be the ultimate general purpose local model, enabling coding, math, agentic, function calling, and general use cases.\n\nThe R1 version has been trained for 3 epochs to reason using 800k reasoning traces from the Dolphin-R1 dataset.\n\nDolphin aims to be a general purpose reasoning instruct model, similar to the models behind ChatGPT, Claude, Gemini.\n\nPart of the [Dolphin 3.0 Collection](https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3) Curated and trained by [Eric Hartford](https://huggingface.co/ehartford), [Ben Gitter](https://huggingface.co/bigstorm), [BlouseJury](https://huggingface.co/BlouseJury) and [Cognitive Computations](https://huggingface.co/cognitivecomputations)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1739462498,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "cognitivecomputations/dolphin3.0-r1-mistral-24b": {
      id: "cognitivecomputations/dolphin3.0-r1-mistral-24b",
      name: "Dolphin3.0 R1 Mistral 24B",
      description:
        "Dolphin 3.0 R1 is the next generation of the Dolphin series of instruct-tuned models.  Designed to be the ultimate general purpose local model, enabling coding, math, agentic, function calling, and general use cases.\n\nThe R1 version has been trained for 3 epochs to reason using 800k reasoning traces from the Dolphin-R1 dataset.\n\nDolphin aims to be a general purpose reasoning instruct model, similar to the models behind ChatGPT, Claude, Gemini.\n\nPart of the [Dolphin 3.0 Collection](https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3) Curated and trained by [Eric Hartford](https://huggingface.co/ehartford), [Ben Gitter](https://huggingface.co/bigstorm), [BlouseJury](https://huggingface.co/BlouseJury) and [Cognitive Computations](https://huggingface.co/cognitivecomputations)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1739462498,
      cost: {
        input: 0.01,
        output: 0.03,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "cognitivecomputations/dolphin3.0-mistral-24b:free": {
      id: "cognitivecomputations/dolphin3.0-mistral-24b:free",
      name: "Dolphin3.0 Mistral 24B (free)",
      description:
        "Dolphin 3.0 is the next generation of the Dolphin series of instruct-tuned models.  Designed to be the ultimate general purpose local model, enabling coding, math, agentic, function calling, and general use cases.\n\nDolphin aims to be a general purpose instruct model, similar to the models behind ChatGPT, Claude, Gemini. \n\nPart of the [Dolphin 3.0 Collection](https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3) Curated and trained by [Eric Hartford](https://huggingface.co/ehartford), [Ben Gitter](https://huggingface.co/bigstorm), [BlouseJury](https://huggingface.co/BlouseJury) and [Cognitive Computations](https://huggingface.co/cognitivecomputations)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1739462019,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "cognitivecomputations/dolphin3.0-mistral-24b": {
      id: "cognitivecomputations/dolphin3.0-mistral-24b",
      name: "Dolphin3.0 Mistral 24B",
      description:
        "Dolphin 3.0 is the next generation of the Dolphin series of instruct-tuned models.  Designed to be the ultimate general purpose local model, enabling coding, math, agentic, function calling, and general use cases.\n\nDolphin aims to be a general purpose instruct model, similar to the models behind ChatGPT, Claude, Gemini. \n\nPart of the [Dolphin 3.0 Collection](https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3) Curated and trained by [Eric Hartford](https://huggingface.co/ehartford), [Ben Gitter](https://huggingface.co/bigstorm), [BlouseJury](https://huggingface.co/BlouseJury) and [Cognitive Computations](https://huggingface.co/cognitivecomputations)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1739462019,
      cost: {
        input: 0.03,
        output: 0.11,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
  },
} as const;
export default cognitivecomputationsProvider;
