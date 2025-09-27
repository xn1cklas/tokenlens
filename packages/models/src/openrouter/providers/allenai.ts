export const allenaiProvider = {
  id: "allenai",
  name: "allenai",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "allenai/molmo-7b-d": {
      id: "allenai/molmo-7b-d",
      name: "AllenAI: Molmo 7B D",
      description:
        "Molmo is a family of open vision-language models developed by the Allen Institute for AI. Molmo models are trained on PixMo, a dataset of 1 million, highly-curated image-text pairs. It has state-of-the-art performance among multimodal models with a similar size while being fully open-source. You can find all models in the Molmo family [here](https://huggingface.co/collections/allenai/molmo-66f379e6fe3b8ef090a8ca19). Learn more about the Molmo family [in the announcement blog post](https://molmo.allenai.org/blog) or the [paper](https://huggingface.co/papers/2409.17146).\n\nMolmo 7B-D is based on [Qwen2-7B](https://huggingface.co/Qwen/Qwen2-7B) and uses [OpenAI CLIP](https://huggingface.co/openai/clip-vit-large-patch14-336) as vision backbone. It performs comfortably between GPT-4V and GPT-4o on both academic benchmarks and human evaluation.\n\nThis checkpoint is a preview of the Molmo release. All artifacts used in creating Molmo (PixMo dataset, training code, evaluations, intermediate checkpoints) will be made available at a later date, furthering our commitment to open-source AI development and reproducibility.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1743023247,
      cost: {
        input: 0.1,
        output: 0.2,
        reasoning: 0,
      },
      limit: {
        context: 4096,
      },
    },
    "allenai/olmo-2-0325-32b-instruct": {
      id: "allenai/olmo-2-0325-32b-instruct",
      name: "AllenAI: Olmo 2 32B Instruct",
      description:
        "OLMo-2 32B Instruct is a supervised instruction-finetuned variant of the OLMo-2 32B March 2025 base model. It excels in complex reasoning and instruction-following tasks across diverse benchmarks such as GSM8K, MATH, IFEval, and general NLP evaluation. Developed by AI2, OLMo-2 32B is part of an open, research-oriented initiative, trained primarily on English-language datasets to advance the understanding and development of open-source language models.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1741988556,
      cost: {
        input: 1,
        output: 1.5,
        reasoning: 0,
      },
      limit: {
        context: 4096,
      },
    },
  },
} as const;
export default allenaiProvider;
