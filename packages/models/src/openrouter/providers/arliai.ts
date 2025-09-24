export const arliaiProvider = {
  id: "arliai",
  name: "arliai",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "arliai/qwq-32b-arliai-rpr-v1:free": {
      id: "arliai/qwq-32b-arliai-rpr-v1:free",
      name: "ArliAI: QwQ 32B RpR v1 (free)",
      description:
        "QwQ-32B-ArliAI-RpR-v1 is a 32B parameter model fine-tuned from Qwen/QwQ-32B using a curated creative writing and roleplay dataset originally developed for the RPMax series. It is designed to maintain coherence and reasoning across long multi-turn conversations by introducing explicit reasoning steps per dialogue turn, generated and refined using the base model itself.\n\nThe model was trained using RS-QLORA+ on 8K sequence lengths and supports up to 128K context windows (with practical performance around 32K). It is optimized for creative roleplay and dialogue generation, with an emphasis on minimizing cross-context repetition while preserving stylistic diversity.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1744555982,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "arliai/qwq-32b-arliai-rpr-v1": {
      id: "arliai/qwq-32b-arliai-rpr-v1",
      name: "ArliAI: QwQ 32B RpR v1",
      description:
        "QwQ-32B-ArliAI-RpR-v1 is a 32B parameter model fine-tuned from Qwen/QwQ-32B using a curated creative writing and roleplay dataset originally developed for the RPMax series. It is designed to maintain coherence and reasoning across long multi-turn conversations by introducing explicit reasoning steps per dialogue turn, generated and refined using the base model itself.\n\nThe model was trained using RS-QLORA+ on 8K sequence lengths and supports up to 128K context windows (with practical performance around 32K). It is optimized for creative roleplay and dialogue generation, with an emphasis on minimizing cross-context repetition while preserving stylistic diversity.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1744555982,
      cost: {
        input: 0.02,
        output: 0.07,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
  },
} as const;
export default arliaiProvider;
