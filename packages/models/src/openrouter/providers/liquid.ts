export const liquidProvider = {
  id: "liquid",
  name: "liquid",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "liquid/lfm-7b": {
      id: "liquid/lfm-7b",
      name: "Liquid: LFM 7B",
      description:
        "LFM-7B, a new best-in-class language model. LFM-7B is designed for exceptional chat capabilities, including languages like Arabic and Japanese. Powered by the Liquid Foundation Model (LFM) architecture, it exhibits unique features like low memory footprint and fast inference speed. \n\nLFM-7B is the world’s best-in-class multilingual language model in English, Arabic, and Japanese.\n\nSee the [launch announcement](https://www.liquid.ai/lfm-7b) for benchmarks and more info.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1737806883,
      cost: {
        input: 0.01,
        output: 0.01,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "liquid/lfm-3b": {
      id: "liquid/lfm-3b",
      name: "Liquid: LFM 3B",
      description:
        "Liquid's LFM 3B delivers incredible performance for its size. It positions itself as first place among 3B parameter transformers, hybrids, and RNN models It is also on par with Phi-3.5-mini on multiple benchmarks, while being 18.4% smaller.\n\nLFM-3B is the ideal choice for mobile and other edge text-based applications.\n\nSee the [launch announcement](https://www.liquid.ai/liquid-foundation-models) for benchmarks and more info.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1737806501,
      cost: {
        input: 0.02,
        output: 0.02,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
  },
} as const;
export default liquidProvider;
