export const raifleProvider = {
  id: "raifle",
  name: "raifle",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "raifle/sorcererlm-8x22b": {
      id: "raifle/sorcererlm-8x22b",
      name: "SorcererLM 8x22B",
      description:
        "SorcererLM is an advanced RP and storytelling model, built as a Low-rank 16-bit LoRA fine-tuned on [WizardLM-2 8x22B](/microsoft/wizardlm-2-8x22b).\n\n- Advanced reasoning and emotional intelligence for engaging and immersive interactions\n- Vivid writing capabilities enriched with spatial and contextual awareness\n- Enhanced narrative depth, promoting creative and dynamic storytelling",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1731105083,
      cost: {
        input: 4.5,
        output: 4.5,
        reasoning: 0,
      },
      limit: {
        context: 16000,
      },
    },
  },
} as const;
export default raifleProvider;
