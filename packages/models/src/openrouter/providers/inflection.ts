export const inflectionProvider = {
  id: "inflection",
  name: "inflection",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "inflection/inflection-3-productivity": {
      id: "inflection/inflection-3-productivity",
      name: "Inflection: Inflection 3 Productivity",
      description:
        "Inflection 3 Productivity is optimized for following instructions. It is better for tasks requiring JSON output or precise adherence to provided guidelines. It has access to recent news.\n\nFor emotional intelligence similar to Pi, see [Inflect 3 Pi](/inflection/inflection-3-pi)\n\nSee [Inflection's announcement](https://inflection.ai/blog/enterprise) for more details.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1728604800,
      cost: {
        input: 2.5,
        output: 10,
        reasoning: 0,
      },
      limit: {
        context: 8000,
      },
    },
    "inflection/inflection-3-pi": {
      id: "inflection/inflection-3-pi",
      name: "Inflection: Inflection 3 Pi",
      description:
        "Inflection 3 Pi powers Inflection's [Pi](https://pi.ai) chatbot, including backstory, emotional intelligence, productivity, and safety. It has access to recent news, and excels in scenarios like customer support and roleplay.\n\nPi has been trained to mirror your tone and style, if you use more emojis, so will Pi! Try experimenting with various prompts and conversation styles.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1728604800,
      cost: {
        input: 2.5,
        output: 10,
        reasoning: 0,
      },
      limit: {
        context: 8000,
      },
    },
  },
} as const;
export default inflectionProvider;
