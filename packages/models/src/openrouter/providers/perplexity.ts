export const perplexityProvider = {
  id: "perplexity",
  name: "perplexity",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "perplexity/sonar-reasoning-pro": {
      id: "perplexity/sonar-reasoning-pro",
      name: "Perplexity: Sonar Reasoning Pro",
      description:
        "Note: Sonar Pro pricing includes Perplexity search pricing. See [details here](https://docs.perplexity.ai/guides/pricing#detailed-pricing-breakdown-for-sonar-reasoning-pro-and-sonar-pro)\n\nSonar Reasoning Pro is a premier reasoning model powered by DeepSeek R1 with Chain of Thought (CoT). Designed for advanced use cases, it supports in-depth, multi-step queries with a larger context window and can surface more citations per search, enabling more comprehensive and extensible responses.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1741313308,
      cost: {
        input: 2,
        output: 8,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "perplexity/sonar-pro": {
      id: "perplexity/sonar-pro",
      name: "Perplexity: Sonar Pro",
      description:
        "Note: Sonar Pro pricing includes Perplexity search pricing. See [details here](https://docs.perplexity.ai/guides/pricing#detailed-pricing-breakdown-for-sonar-reasoning-pro-and-sonar-pro)\n\nFor enterprises seeking more advanced capabilities, the Sonar Pro API can handle in-depth, multi-step queries with added extensibility, like double the number of citations per search as Sonar on average. Plus, with a larger context window, it can handle longer and more nuanced searches and follow-up questions. ",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1741312423,
      cost: {
        input: 3,
        output: 15,
        reasoning: 0,
      },
      limit: {
        context: 200000,
      },
    },
    "perplexity/sonar-deep-research": {
      id: "perplexity/sonar-deep-research",
      name: "Perplexity: Sonar Deep Research",
      description:
        "Sonar Deep Research is a research-focused model designed for multi-step retrieval, synthesis, and reasoning across complex topics. It autonomously searches, reads, and evaluates sources, refining its approach as it gathers information. This enables comprehensive report generation across domains like finance, technology, health, and current events.\n\nNotes on Pricing ([Source](https://docs.perplexity.ai/guides/pricing#detailed-pricing-breakdown-for-sonar-deep-research)) \n- Input tokens comprise of Prompt tokens (user prompt) + Citation tokens (these are processed tokens from running searches)\n- Deep Research runs multiple searches to conduct exhaustive research. Searches are priced at $5/1000 searches. A request that does 30 searches will cost $0.15 in this step.\n- Reasoning is a distinct step in Deep Research since it does extensive automated reasoning through all the material it gathers during its research phase. Reasoning tokens here are a bit different than the CoTs in the answer - these are tokens that we use to reason through the research material prior to generating the outputs via the CoTs. Reasoning tokens are priced at $3/1M tokens",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1741311246,
      cost: {
        input: 2,
        output: 8,
        reasoning: 3,
      },
      limit: {
        context: 128000,
      },
    },
    "perplexity/r1-1776": {
      id: "perplexity/r1-1776",
      name: "Perplexity: R1 1776",
      description:
        "R1 1776 is a version of DeepSeek-R1 that has been post-trained to remove censorship constraints related to topics restricted by the Chinese government. The model retains its original reasoning capabilities while providing direct responses to a wider range of queries. R1 1776 is an offline chat model that does not use the perplexity search subsystem.\n\nThe model was tested on a multilingual dataset of over 1,000 examples covering sensitive topics to measure its likelihood of refusal or overly filtered responses. [Evaluation Results](https://cdn-uploads.huggingface.co/production/uploads/675c8332d01f593dc90817f5/GiN2VqC5hawUgAGJ6oHla.png) Its performance on math and reasoning benchmarks remains similar to the base R1 model. [Reasoning Performance](https://cdn-uploads.huggingface.co/production/uploads/675c8332d01f593dc90817f5/n4Z9Byqp2S7sKUvCvI40R.png)\n\nRead more on the [Blog Post](https://perplexity.ai/hub/blog/open-sourcing-r1-1776)",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1740004929,
      cost: {
        input: 2,
        output: 8,
        reasoning: 0,
      },
      limit: {
        context: 128000,
      },
    },
    "perplexity/sonar-reasoning": {
      id: "perplexity/sonar-reasoning",
      name: "Perplexity: Sonar Reasoning",
      description:
        "Sonar Reasoning is a reasoning model provided by Perplexity based on [DeepSeek R1](/deepseek/deepseek-r1).\n\nIt allows developers to utilize long chain of thought with built-in web search. Sonar Reasoning is uncensored and hosted in US datacenters. ",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1738131107,
      cost: {
        input: 1,
        output: 5,
        reasoning: 0,
      },
      limit: {
        context: 127000,
      },
    },
    "perplexity/sonar": {
      id: "perplexity/sonar",
      name: "Perplexity: Sonar",
      description:
        "Sonar is lightweight, affordable, fast, and simple to use — now featuring citations and the ability to customize sources. It is designed for companies seeking to integrate lightweight question-and-answer features optimized for speed.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1738013808,
      cost: {
        input: 1,
        output: 1,
        reasoning: 0,
      },
      limit: {
        context: 127072,
      },
    },
  },
} as const;
export default perplexityProvider;
