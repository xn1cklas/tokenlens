export const neversleepProvider = {
  id: "neversleep",
  name: "neversleep",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "neversleep/llama-3.1-lumimaid-8b": {
      id: "neversleep/llama-3.1-lumimaid-8b",
      name: "NeverSleep: Lumimaid v0.2 8B",
      description:
        'Lumimaid v0.2 8B is a finetune of [Llama 3.1 8B](/models/meta-llama/llama-3.1-8b-instruct) with a "HUGE step up dataset wise" compared to Lumimaid v0.1. Sloppy chats output were purged.\n\nUsage of this model is subject to [Meta\'s Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1726358400,
      cost: {
        input: 0.09,
        output: 0.6,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "neversleep/llama-3-lumimaid-70b": {
      id: "neversleep/llama-3-lumimaid-70b",
      name: "NeverSleep: Llama 3 Lumimaid 70B",
      description:
        "The NeverSleep team is back, with a Llama 3 70B finetune trained on their curated roleplay data. Striking a balance between eRP and RP, Lumimaid was designed to be serious, yet uncensored when necessary.\n\nTo enhance it's overall intelligence and chat capability, roughly 40% of the training data was not roleplay. This provides a breadth of knowledge to access, while still keeping roleplay as the primary strength.\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1715817600,
      cost: {
        input: 4,
        output: 6,
        reasoning: 0,
      },
      limit: {
        context: 8192,
      },
    },
    "neversleep/noromaid-20b": {
      id: "neversleep/noromaid-20b",
      name: "Noromaid 20B",
      description:
        "A collab between IkariDev and Undi. This merge is suitable for RP, ERP, and general knowledge.\n\n#merge #uncensored",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1700956800,
      cost: {
        input: 1,
        output: 1.75,
        reasoning: 0,
      },
      limit: {
        context: 4096,
      },
    },
  },
} as const;
export default neversleepProvider;
