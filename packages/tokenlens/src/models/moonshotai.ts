import type { Model } from '../types.js';

/**
 * Moonshot AI models aligned with Vercel AI Gateway directory.
 */
export const moonshotaiModels = [
  {
    id: 'moonshotai:kimi-k2',
    provider: 'moonshotai',
    vendorId: 'kimi-k2',
    displayName: 'Kimi K2',
    family: 'kimi-k2',
    status: 'stable',
    context: { combinedMax: 131_000 },
    modalities: { textIn: true, textOut: true },
    source: 'https://vercel.com/ai-gateway/models/kimi-k2',
    pricing: { inputPerMTokens: 0.50, outputPerMTokens: 2.00 },
    aliases: ['moonshotai/kimi-k2'],
  },
  {
    id: 'moonshotai:kimi-k2-0905',
    provider: 'moonshotai',
    vendorId: 'kimi-k2-0905',
    displayName: 'Kimi K2 0905',
    family: 'kimi-k2-0905',
    status: 'stable',
    context: { combinedMax: 256_000 },
    modalities: { textIn: true, textOut: true },
    source: 'https://vercel.com/ai-gateway/models/kimi-k2-0905',
    pricing: { inputPerMTokens: 0.60, outputPerMTokens: 1.20 },
    aliases: ['moonshotai/kimi-k2-0905'],
  },
] as const satisfies readonly Model[];

