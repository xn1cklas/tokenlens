import type { Model } from '../types.js';

/**
 * Alibaba Qwen models aligned with Vercel AI Gateway directory.
 */
export const alibabaModels = [
  {
    id: 'alibaba:qwen3-coder',
    provider: 'alibaba',
    vendorId: 'qwen3-coder',
    displayName: 'Qwen3 Coder',
    family: 'qwen3-coder',
    status: 'stable',
    context: { combinedMax: 131_000 },
    modalities: { textIn: true, textOut: true },
    source: 'https://vercel.com/ai-gateway/models/qwen3-coder',
    pricing: { inputPerMTokens: 0.40, outputPerMTokens: 1.60 },
    aliases: ['alibaba/qwen3-coder'],
  },
] as const satisfies readonly Model[];

