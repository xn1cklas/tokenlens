import type { Model } from '../types.js';

/**
 * DeepSeek models aligned with Vercel AI Gateway directory.
 */
export const deepseekModels = [
  {
    id: 'deepseek:deepseek-v3',
    provider: 'deepseek',
    vendorId: 'deepseek-v3',
    displayName: 'DeepSeek-V3',
    family: 'deepseek-v3',
    status: 'stable',
    context: { combinedMax: 164_000 },
    modalities: { textIn: true, textOut: true },
    source: 'https://vercel.com/ai-gateway/models/deepseek-v3',
    pricing: { inputPerMTokens: 0.77, outputPerMTokens: 0.77 },
    aliases: ['deepseek/deepseek-v3'],
  },
  {
    id: 'deepseek:deepseek-v3.1',
    provider: 'deepseek',
    vendorId: 'deepseek-v3.1',
    displayName: 'DeepSeek-V3.1',
    family: 'deepseek-v3.1',
    status: 'stable',
    context: { combinedMax: 164_000 },
    modalities: { textIn: true, textOut: true },
    source: 'https://vercel.com/ai-gateway/models/deepseek-v3.1',
    pricing: { inputPerMTokens: 0.20, outputPerMTokens: 0.80 },
    aliases: ['deepseek/deepseek-v3.1'],
  },
] as const satisfies readonly Model[];

