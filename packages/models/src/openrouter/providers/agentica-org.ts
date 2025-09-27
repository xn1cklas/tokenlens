export const agentica_orgProvider = {
  id: "agentica-org",
  name: "agentica-org",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "agentica-org/deepcoder-14b-preview:free": {
      id: "agentica-org/deepcoder-14b-preview:free",
      name: "Agentica: Deepcoder 14B Preview (free)",
      description:
        "DeepCoder-14B-Preview is a 14B parameter code generation model fine-tuned from DeepSeek-R1-Distill-Qwen-14B using reinforcement learning with GRPO+ and iterative context lengthening. It is optimized for long-context program synthesis and achieves strong performance across coding benchmarks, including 60.6% on LiveCodeBench v5, competitive with models like o3-Mini",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1744555395,
      cost: {
        input: 0,
        output: 0,
        reasoning: 0,
      },
      limit: {
        context: 96000,
      },
    },
    "agentica-org/deepcoder-14b-preview": {
      id: "agentica-org/deepcoder-14b-preview",
      name: "Agentica: Deepcoder 14B Preview",
      description:
        "DeepCoder-14B-Preview is a 14B parameter code generation model fine-tuned from DeepSeek-R1-Distill-Qwen-14B using reinforcement learning with GRPO+ and iterative context lengthening. It is optimized for long-context program synthesis and achieves strong performance across coding benchmarks, including 60.6% on LiveCodeBench v5, competitive with models like o3-Mini",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1744555395,
      cost: {
        input: 0.015,
        output: 0.015,
        reasoning: 0,
      },
      limit: {
        context: 96000,
      },
    },
  },
} as const;
export default agentica_orgProvider;
