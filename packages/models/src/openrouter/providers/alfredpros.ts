export const alfredprosProvider = {
  id: "alfredpros",
  name: "alfredpros",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "alfredpros/codellama-7b-instruct-solidity": {
      id: "alfredpros/codellama-7b-instruct-solidity",
      name: "AlfredPros: CodeLLaMa 7B Instruct Solidity",
      description:
        "A finetuned 7 billion parameters Code LLaMA - Instruct model to generate Solidity smart contract using 4-bit QLoRA finetuning provided by PEFT library.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1744641874,
      cost: {
        input: 0.8,
        output: 1.2,
        reasoning: 0,
      },
      limit: {
        context: 4096,
      },
    },
  },
} as const;
export default alfredprosProvider;
