export const arcee_aiProvider = {
  id: "arcee-ai",
  name: "arcee-ai",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "arcee-ai/afm-4.5b": {
      id: "arcee-ai/afm-4.5b",
      name: "Arcee AI: AFM 4.5B",
      description:
        "AFM-4.5B is a 4.5 billion parameter instruction-tuned language model developed by Arcee AI. The model was pretrained on approximately 8 trillion tokens, including 6.5 trillion tokens of general data and 1.5 trillion tokens with an emphasis on mathematical reasoning and code generation. ",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1758040484,
      cost: {
        input: 0.1,
        output: 0.4,
        reasoning: 0,
      },
      limit: {
        context: 65536,
      },
    },
    "arcee-ai/spotlight": {
      id: "arcee-ai/spotlight",
      name: "Arcee AI: Spotlight",
      description:
        "Spotlight is a 7‑billion‑parameter vision‑language model derived from Qwen 2.5‑VL and fine‑tuned by Arcee AI for tight image‑text grounding tasks. It offers a 32 k‑token context window, enabling rich multimodal conversations that combine lengthy documents with one or more images. Training emphasized fast inference on consumer GPUs while retaining strong captioning, visual‐question‑answering, and diagram‑analysis accuracy. As a result, Spotlight slots neatly into agent workflows where screenshots, charts or UI mock‑ups need to be interpreted on the fly. Early benchmarks show it matching or out‑scoring larger VLMs such as LLaVA‑1.6 13 B on popular VQA and POPE alignment tests. ",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1746481552,
      cost: {
        input: 0.18,
        output: 0.18,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "arcee-ai/maestro-reasoning": {
      id: "arcee-ai/maestro-reasoning",
      name: "Arcee AI: Maestro Reasoning",
      description:
        'Maestro Reasoning is Arcee\'s flagship analysis model: a 32 B‑parameter derivative of Qwen 2.5‑32 B tuned with DPO and chain‑of‑thought RL for step‑by‑step logic. Compared to the earlier 7 B preview, the production 32 B release widens the context window to 128 k tokens and doubles pass‑rate on MATH and GSM‑8K, while also lifting code completion accuracy. Its instruction style encourages structured "thought → answer" traces that can be parsed or hidden according to user preference. That transparency pairs well with audit‑focused industries like finance or healthcare where seeing the reasoning path matters. In Arcee Conductor, Maestro is automatically selected for complex, multi‑constraint queries that smaller SLMs bounce. ',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1746481269,
      cost: {
        input: 0.9,
        output: 3.3,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "arcee-ai/virtuoso-large": {
      id: "arcee-ai/virtuoso-large",
      name: "Arcee AI: Virtuoso Large",
      description:
        'Virtuoso‑Large is Arcee\'s top‑tier general‑purpose LLM at 72 B parameters, tuned to tackle cross‑domain reasoning, creative writing and enterprise QA. Unlike many 70 B peers, it retains the 128 k context inherited from Qwen 2.5, letting it ingest books, codebases or financial filings wholesale. Training blended DeepSeek R1 distillation, multi‑epoch supervised fine‑tuning and a final DPO/RLHF alignment stage, yielding strong performance on BIG‑Bench‑Hard, GSM‑8K and long‑context Needle‑In‑Haystack tests. Enterprises use Virtuoso‑Large as the "fallback" brain in Conductor pipelines when other SLMs flag low confidence. Despite its size, aggressive KV‑cache optimizations keep first‑token latency in the low‑second range on 8× H100 nodes, making it a practical production‑grade powerhouse.',
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1746478885,
      cost: {
        input: 0.75,
        output: 1.2,
        reasoning: 0,
      },
      limit: {
        context: 131072,
      },
    },
    "arcee-ai/coder-large": {
      id: "arcee-ai/coder-large",
      name: "Arcee AI: Coder Large",
      description:
        "Coder‑Large is a 32 B‑parameter offspring of Qwen 2.5‑Instruct that has been further trained on permissively‑licensed GitHub, CodeSearchNet and synthetic bug‑fix corpora. It supports a 32k context window, enabling multi‑file refactoring or long diff review in a single call, and understands 30‑plus programming languages with special attention to TypeScript, Go and Terraform. Internal benchmarks show 5–8 pt gains over CodeLlama‑34 B‑Python on HumanEval and competitive BugFix scores thanks to a reinforcement pass that rewards compilable output. The model emits structured explanations alongside code blocks by default, making it suitable for educational tooling as well as production copilot scenarios. Cost‑wise, Together AI prices it well below proprietary incumbents, so teams can scale interactive coding without runaway spend. ",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1746478663,
      cost: {
        input: 0.5,
        output: 0.8,
        reasoning: 0,
      },
      limit: {
        context: 32768,
      },
    },
  },
} as const;
export default arcee_aiProvider;
