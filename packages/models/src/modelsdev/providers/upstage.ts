export const upstageProvider = {
  id: "upstage",
  name: "Upstage",
  api: "https://api.upstage.ai",
  npm: "@ai-sdk/openai-compatible",
  doc: "https://developers.upstage.ai/docs/apis/chat",
  env: ["UPSTAGE_API_KEY"],
  source: "models.dev",
  schemaVersion: 1,
  models: {
    "solar-pro2": {
      id: "solar-pro2",
      name: "solar-pro2",
      attachment: false,
      reasoning: true,
      temperature: true,
      tool_call: true,
      knowledge: "2025-03",
      release_date: "2025-05-20",
      last_updated: "2025-05-20",
      modalities: {
        input: ["text"],
        output: ["text"],
      },
      open_weights: false,
      cost: {
        input: 0.25,
        output: 0.25,
      },
      limit: {
        context: 65536,
        output: 8192,
      },
    },
    "solar-mini": {
      id: "solar-mini",
      name: "solar-mini",
      attachment: false,
      reasoning: false,
      temperature: true,
      tool_call: true,
      knowledge: "2024-09",
      release_date: "2024-06-12",
      last_updated: "2025-04-22",
      modalities: {
        input: ["text"],
        output: ["text"],
      },
      open_weights: false,
      cost: {
        input: 0.15,
        output: 0.15,
      },
      limit: {
        context: 32768,
        output: 4096,
      },
    },
  },
} as const;
export default upstageProvider;
