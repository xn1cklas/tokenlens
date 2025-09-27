export const openrouterProvider = {
  id: "openrouter",
  name: "openrouter",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "openrouter/auto": {
      id: "openrouter/auto",
      name: "Auto Router",
      description:
        "Your prompt will be processed by a meta-model and routed to one of dozens of models (see below), optimizing for the best possible output.\n\nTo see which model was used, visit [Activity](/activity), or read the `model` attribute of the response. Your response will be priced at the same rate as the routed model.\n\nThe meta-model is powered by [Not Diamond](https://docs.notdiamond.ai/docs/how-not-diamond-works). Learn more in our [docs](/docs/model-routing).\n\nRequests will be routed to the following models:\n- [openai/gpt-4o-2024-08-06](/openai/gpt-4o-2024-08-06)\n- [openai/gpt-4o-2024-05-13](/openai/gpt-4o-2024-05-13)\n- [openai/gpt-4o-mini-2024-07-18](/openai/gpt-4o-mini-2024-07-18)\n- [openai/chatgpt-4o-latest](/openai/chatgpt-4o-latest)\n- [openai/o1-preview-2024-09-12](/openai/o1-preview-2024-09-12)\n- [openai/o1-mini-2024-09-12](/openai/o1-mini-2024-09-12)\n- [anthropic/claude-3.5-sonnet](/anthropic/claude-3.5-sonnet)\n- [anthropic/claude-3.5-haiku](/anthropic/claude-3.5-haiku)\n- [anthropic/claude-3-opus](/anthropic/claude-3-opus)\n- [anthropic/claude-2.1](/anthropic/claude-2.1)\n- [google/gemini-pro-1.5](/google/gemini-pro-1.5)\n- [google/gemini-flash-1.5](/google/gemini-flash-1.5)\n- [mistralai/mistral-large-2407](/mistralai/mistral-large-2407)\n- [mistralai/mistral-nemo](/mistralai/mistral-nemo)\n- [deepseek/deepseek-r1](/deepseek/deepseek-r1)\n- [meta-llama/llama-3.1-70b-instruct](/meta-llama/llama-3.1-70b-instruct)\n- [meta-llama/llama-3.1-405b-instruct](/meta-llama/llama-3.1-405b-instruct)\n- [mistralai/mixtral-8x22b-instruct](/mistralai/mixtral-8x22b-instruct)\n- [cohere/command-r-plus](/cohere/command-r-plus)\n- [cohere/command-r](/cohere/command-r)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1699401600,
      cost: {
        input: -1000000,
        output: -1000000,
      },
      limit: {
        context: 2000000,
      },
    },
  },
} as const;
export default openrouterProvider;
