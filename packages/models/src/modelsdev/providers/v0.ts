export const v0Provider = {
  id: "v0",
  name: "v0",
  npm: "@ai-sdk/vercel",
  doc: "https://sdk.vercel.ai/providers/ai-sdk-providers/vercel",
  env: ["V0_API_KEY"],
  source: "models.dev",
  schemaVersion: 1,
  models: {
    "v0-1.5-md": {
      id: "v0-1.5-md",
      name: "v0-1.5-md",
      attachment: true,
      reasoning: true,
      temperature: true,
      tool_call: true,
      release_date: "2025-06-09",
      last_updated: "2025-06-09",
      modalities: {
        input: ["text", "image"],
        output: ["text"],
      },
      open_weights: false,
      cost: {
        input: 3,
        output: 15,
      },
      limit: {
        context: 128000,
        output: 32000,
      },
    },
    "v0-1.0-md": {
      id: "v0-1.0-md",
      name: "v0-1.0-md",
      attachment: true,
      reasoning: true,
      temperature: true,
      tool_call: true,
      release_date: "2025-05-22",
      last_updated: "2025-05-22",
      modalities: {
        input: ["text", "image"],
        output: ["text"],
      },
      open_weights: false,
      cost: {
        input: 3,
        output: 15,
      },
      limit: {
        context: 128000,
        output: 32000,
      },
    },
    "v0-1.5-lg": {
      id: "v0-1.5-lg",
      name: "v0-1.5-lg",
      attachment: true,
      reasoning: true,
      temperature: true,
      tool_call: true,
      release_date: "2025-06-09",
      last_updated: "2025-06-09",
      modalities: {
        input: ["text", "image"],
        output: ["text"],
      },
      open_weights: false,
      cost: {
        input: 15,
        output: 75,
      },
      limit: {
        context: 512000,
        output: 32000,
      },
    },
  },
} as const;
export default v0Provider;
