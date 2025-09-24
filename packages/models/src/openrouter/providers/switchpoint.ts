export const switchpointProvider = {
  id: "switchpoint",
  name: "switchpoint",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "switchpoint/router": {
      id: "switchpoint/router",
      name: "Switchpoint Router",
      description:
        "Switchpoint AI's router instantly analyzes your request and directs it to the optimal AI from an ever-evolving library. \n\nAs the world of LLMs advances, our router gets smarter, ensuring you always benefit from the industry's newest models without changing your workflow.\n\nThis model is configured for a simple, flat rate per response here on OpenRouter. It's powered by the full routing engine from [Switchpoint AI](https://www.switchpoint.dev).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1752272899,
      cost: {
        input: 0.85,
        output: 3.4,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
  },
} as const;
export default switchpointProvider;
