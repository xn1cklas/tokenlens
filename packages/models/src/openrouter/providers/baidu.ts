export const baiduProvider = {
  id: "baidu",
  name: "baidu",
  api: "https://openrouter.ai/api/v1",
  doc: "https://openrouter.ai/models",
  env: ["OPENROUTER_API_KEY"],
  source: "openrouter",
  schemaVersion: 1,
  models: {
    "baidu/ernie-4.5-21b-a3b": {
      id: "baidu/ernie-4.5-21b-a3b",
      name: "Baidu: ERNIE 4.5 21B A3B",
      description:
        "A sophisticated text-based Mixture-of-Experts (MoE) model featuring 21B total parameters with 3B activated per token, delivering exceptional multimodal understanding and generation through heterogeneous MoE structures and modality-isolated routing. Supporting an extensive 131K token context length, the model achieves efficient inference via multi-expert parallel collaboration and quantization, while advanced post-training techniques including SFT, DPO, and UPO ensure optimized performance across diverse applications with specialized routing and balancing losses for superior task handling.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1755034167,
      cost: {
        input: 0.07,
        output: 0.28,
        reasoning: 0,
      },
      limit: {
        context: 120000,
      },
    },
    "baidu/ernie-4.5-vl-28b-a3b": {
      id: "baidu/ernie-4.5-vl-28b-a3b",
      name: "Baidu: ERNIE 4.5 VL 28B A3B",
      description:
        "A powerful multimodal Mixture-of-Experts chat model featuring 28B total parameters with 3B activated per token, delivering exceptional text and vision understanding through its innovative heterogeneous MoE structure with modality-isolated routing. Built with scaling-efficient infrastructure for high-throughput training and inference, the model leverages advanced post-training techniques including SFT, DPO, and UPO for optimized performance, while supporting an impressive 131K context length and RLVR alignment for superior cross-modal reasoning and generation capabilities.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1755032836,
      cost: {
        input: 0.14,
        output: 0.56,
        reasoning: 0,
      },
      limit: {
        context: 30000,
      },
    },
    "baidu/ernie-4.5-vl-424b-a47b": {
      id: "baidu/ernie-4.5-vl-424b-a47b",
      name: "Baidu: ERNIE 4.5 VL 424B A47B ",
      description:
        "ERNIE-4.5-VL-424B-A47B is a multimodal Mixture-of-Experts (MoE) model from Baidu’s ERNIE 4.5 series, featuring 424B total parameters with 47B active per token. It is trained jointly on text and image data using a heterogeneous MoE architecture and modality-isolated routing to enable high-fidelity cross-modal reasoning, image understanding, and long-context generation (up to 131k tokens). Fine-tuned with techniques like SFT, DPO, UPO, and RLVR, this model supports both “thinking” and non-thinking inference modes. Designed for vision-language tasks in English and Chinese, it is optimized for efficient scaling and can operate under 4-bit/8-bit quantization.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1751300903,
      cost: {
        input: 0.42,
        output: 1.25,
        reasoning: 0,
      },
      limit: {
        context: 123000,
      },
    },
    "baidu/ernie-4.5-300b-a47b": {
      id: "baidu/ernie-4.5-300b-a47b",
      name: "Baidu: ERNIE 4.5 300B A47B ",
      description:
        "ERNIE-4.5-300B-A47B is a 300B parameter Mixture-of-Experts (MoE) language model developed by Baidu as part of the ERNIE 4.5 series. It activates 47B parameters per token and supports text generation in both English and Chinese. Optimized for high-throughput inference and efficient scaling, it uses a heterogeneous MoE structure with advanced routing and quantization strategies, including FP8 and 2-bit formats. This version is fine-tuned for language-only tasks and supports reasoning, tool parameters, and extended context lengths up to 131k tokens. Suitable for general-purpose LLM applications with high reasoning and throughput demands.",
      attachment: false,
      reasoning: false,
      tool_call: false,
      created: 1751300139,
      cost: {
        input: 0.28,
        output: 1.1,
        reasoning: 0,
      },
      limit: {
        context: 123000,
      },
    },
  },
} as const;
export default baiduProvider;
