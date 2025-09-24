export const lucidqueryProvider = {
  id: "lucidquery",
  name: "LucidQuery AI",
  api: "https://lucidquery.com/api/v1",
  npm: "@ai-sdk/openai-compatible",
  doc: "https://lucidquery.com/api/docs",
  env: ["LUCIDQUERY_API_KEY"],
  source: "models.dev",
  schemaVersion: 1,
  models: {
    "lucidnova-rf1-100b": {
      id: "lucidnova-rf1-100b",
      name: "LucidNova RF1 100B",
      attachment: true,
      reasoning: true,
      temperature: false,
      tool_call: true,
      knowledge: "2025-09-16",
      release_date: "2024-12-28",
      last_updated: "2025-09-10",
      modalities: {
        input: ["text"],
        output: ["text"],
      },
      open_weights: false,
      cost: {
        input: 2,
        output: 5,
      },
      limit: {
        context: 120000,
        output: 8000,
      },
    },
    "lucidquery-nexus-coder": {
      id: "lucidquery-nexus-coder",
      name: "LucidQuery Nexus Coder",
      attachment: true,
      reasoning: true,
      temperature: false,
      tool_call: true,
      knowledge: "2025-08-01",
      release_date: "2025-09-01",
      last_updated: "2025-09-01",
      modalities: {
        input: ["text"],
        output: ["text"],
      },
      open_weights: false,
      cost: {
        input: 2,
        output: 5,
      },
      limit: {
        context: 250000,
        output: 60000,
      },
    },
  },
} as const;
export default lucidqueryProvider;
