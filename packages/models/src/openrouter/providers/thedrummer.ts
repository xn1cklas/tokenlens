export const thedrummerProvider = {
  id: "thedrummer",
  name: "thedrummer",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "thedrummer/anubis-70b-v1.1": {
      id: "thedrummer/anubis-70b-v1.1",
      name: "TheDrummer: Anubis 70B V1.1",
      description:
        "TheDrummer's Anubis v1.1 is an unaligned, creative Llama 3.3 70B model focused on providing character-driven roleplay & stories. It excels at gritty, visceral prose, unique character adherence, and coherent narratives, while maintaining the instruction following Llama 3.3 70B is known for.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1751208347,
      cost: {
        input: 0.4,
        output: 0.7,
        reasoning: 0,
      },
      limit: {
        context: 4096,
      },
    },
    "thedrummer/anubis-pro-105b-v1": {
      id: "thedrummer/anubis-pro-105b-v1",
      name: "TheDrummer: Anubis Pro 105B V1",
      description:
        "Anubis Pro 105B v1 is an expanded and refined variant of Meta’s Llama 3.3 70B, featuring 50% additional layers and further fine-tuning to leverage its increased capacity. Designed for advanced narrative, roleplay, and instructional tasks, it demonstrates enhanced emotional intelligence, creativity, nuanced character portrayal, and superior prompt adherence compared to smaller models. Its larger parameter count allows for deeper contextual understanding and extended reasoning capabilities, optimized for engaging, intelligent, and coherent interactions.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1741642290,
      cost: {
        input: 0.5,
        output: 1,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "thedrummer/skyfall-36b-v2": {
      id: "thedrummer/skyfall-36b-v2",
      name: "TheDrummer: Skyfall 36B V2",
      description:
        "Skyfall 36B v2 is an enhanced iteration of Mistral Small 2501, specifically fine-tuned for improved creativity, nuanced writing, role-playing, and coherent storytelling.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1741636566,
      cost: {
        input: 0.04,
        output: 0.16,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "thedrummer/unslopnemo-12b": {
      id: "thedrummer/unslopnemo-12b",
      name: "TheDrummer: UnslopNemo 12B",
      description:
        "UnslopNemo v4.1 is the latest addition from the creator of Rocinante, designed for adventure writing and role-play scenarios.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1731103448,
      cost: {
        input: 0.4,
        output: 0.4,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
    "thedrummer/rocinante-12b": {
      id: "thedrummer/rocinante-12b",
      name: "TheDrummer: Rocinante 12B",
      description:
        "Rocinante 12B is designed for engaging storytelling and rich prose.\n\nEarly testers have reported:\n- Expanded vocabulary with unique and expressive word choices\n- Enhanced creativity for vivid narratives\n- Adventure-filled and captivating stories",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1727654400,
      cost: {
        input: 0.17,
        output: 0.43,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
  },
} as const;
export default thedrummerProvider;
