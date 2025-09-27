export const inceptionProvider = {
  id: "inception",
  name: "inception",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "inception/mercury": {
      id: "inception/mercury",
      name: "Inception: Mercury",
      description:
        "Mercury is the first diffusion large language model (dLLM). Applying a breakthrough discrete diffusion approach, the model runs 5-10x faster than even speed optimized models like GPT-4.1 Nano and Claude 3.5 Haiku while matching their performance. Mercury's speed enables developers to provide responsive user experiences, including with voice agents, search interfaces, and chatbots. Read more in the blog post here. ",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1750973026,
      cost: {
        input: 0.25,
        output: 1,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "inception/mercury-coder": {
      id: "inception/mercury-coder",
      name: "Inception: Mercury Coder",
      description:
        "Mercury Coder is the first diffusion large language model (dLLM). Applying a breakthrough discrete diffusion approach, the model runs 5-10x faster than even speed optimized models like Claude 3.5 Haiku and GPT-4o Mini while matching their performance. Mercury Coder's speed means that developers can stay in the flow while coding, enjoying rapid chat-based iteration and responsive code completion suggestions. On Copilot Arena, Mercury Coder ranks 1st in speed and ties for 2nd in quality. Read more in the [blog post here](https://www.inceptionlabs.ai/introducing-mercury).",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1746033880,
      cost: {
        input: 0.25,
        output: 1,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
  },
} as const;
export default inceptionProvider;
