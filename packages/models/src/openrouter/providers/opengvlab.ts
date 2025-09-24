export const opengvlabProvider = {
  id: "opengvlab",
  name: "opengvlab",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "opengvlab/internvl3-78b": {
      id: "opengvlab/internvl3-78b",
      name: "OpenGVLab: InternVL3 78B",
      description:
        "The InternVL3 series is an advanced multimodal large language model (MLLM). Compared to InternVL 2.5, InternVL3 demonstrates stronger multimodal perception and reasoning capabilities. \n\nIn addition, InternVL3 is benchmarked against the Qwen2.5 Chat models, whose pre-trained base models serve as the initialization for its language component. Benefiting from Native Multimodal Pre-Training, the InternVL3 series surpasses the Qwen2.5 series in overall text performance.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1757962555,
      cost: {
        input: 0.03,
        output: 0.13,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
  },
} as const;
export default opengvlabProvider;
