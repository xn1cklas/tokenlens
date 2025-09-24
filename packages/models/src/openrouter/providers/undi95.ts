export const undi95Provider = {
  id: "undi95",
  name: "undi95",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "undi95/remm-slerp-l2-13b": {
      id: "undi95/remm-slerp-l2-13b",
      name: "ReMM SLERP 13B",
      description:
        "A recreation trial of the original MythoMax-L2-B13 but with updated models. #merge",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1689984000,
      cost: {
        input: 0.45,
        output: 0.65,
        reasoning: 0,
      },
      limit: {
        context: 6144,
      },
    },
  },
} as const;
export default undi95Provider;
