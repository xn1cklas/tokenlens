export const mancerProvider = {
  id: "mancer",
  name: "mancer",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "mancer/weaver": {
      id: "mancer/weaver",
      name: "Mancer: Weaver (alpha)",
      description:
        "An attempt to recreate Claude-style verbosity, but don't expect the same level of coherence or memory. Meant for use in roleplay/narrative situations.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1690934400,
      cost: {
        input: 1.125,
        output: 1.125,
        reasoning: 0,
      },
      limit: {
        context: 8000,
      },
    },
  },
} as const;
export default mancerProvider;
