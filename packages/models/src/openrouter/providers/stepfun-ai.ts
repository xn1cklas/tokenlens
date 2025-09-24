export const stepfun_aiProvider = {
  id: "stepfun-ai",
  name: "stepfun-ai",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "stepfun-ai/step3": {
      id: "stepfun-ai/step3",
      name: "StepFun: Step3",
      description:
        "Step3 is a cutting-edge multimodal reasoning model—built on a Mixture-of-Experts architecture with 321B total parameters and 38B active. It is designed end-to-end to minimize decoding costs while delivering top-tier performance in vision–language reasoning. Through the co-design of Multi-Matrix Factorization Attention (MFA) and Attention-FFN Disaggregation (AFD), Step3 maintains exceptional efficiency across both flagship and low-end accelerators.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1756415375,
      cost: {
        input: 0.57,
        output: 1.42,
        reasoning: 0,
      },
      limit: {
        context: 65536,
      },
    },
  },
} as const;
export default stepfun_aiProvider;
