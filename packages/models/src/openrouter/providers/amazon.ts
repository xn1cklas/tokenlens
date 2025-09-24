export const amazonProvider = {
  id: "amazon",
  name: "amazon",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "amazon/nova-lite-v1": {
      id: "amazon/nova-lite-v1",
      name: "Amazon: Nova Lite 1.0",
      description:
        "Amazon Nova Lite 1.0 is a very low-cost multimodal model from Amazon that focused on fast processing of image, video, and text inputs to generate text output. Amazon Nova Lite can handle real-time customer interactions, document analysis, and visual question-answering tasks with high accuracy.\n\nWith an input context of 300K tokens, it can analyze multiple images or up to 30 minutes of video in a single input.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1733437363,
      cost: {
        input: 0.06,
        output: 0.24,
        reasoning: 0,
      },
      limit: {
        context: 300000,
      },
    },
    "amazon/nova-micro-v1": {
      id: "amazon/nova-micro-v1",
      name: "Amazon: Nova Micro 1.0",
      description:
        "Amazon Nova Micro 1.0 is a text-only model that delivers the lowest latency responses in the Amazon Nova family of models at a very low cost. With a context length of 128K tokens and optimized for speed and cost, Amazon Nova Micro excels at tasks such as text summarization, translation, content classification, interactive chat, and brainstorming. It has  simple mathematical reasoning and coding abilities.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1733437237,
      cost: {
        input: 0.035,
        output: 0.14,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "amazon/nova-pro-v1": {
      id: "amazon/nova-pro-v1",
      name: "Amazon: Nova Pro 1.0",
      description:
        "Amazon Nova Pro 1.0 is a capable multimodal model from Amazon focused on providing a combination of accuracy, speed, and cost for a wide range of tasks. As of December 2024, it achieves state-of-the-art performance on key benchmarks including visual question answering (TextVQA) and video understanding (VATEX).\n\nAmazon Nova Pro demonstrates strong capabilities in processing both visual and textual information and at analyzing financial documents.\n\n**NOTE**: Video input is not supported at this time.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1733436303,
      cost: {
        input: 0.8,
        output: 3.2,
        reasoning: 0,
      },
      limit: {
        context: 300000,
      },
    },
  },
} as const;
export default amazonProvider;
