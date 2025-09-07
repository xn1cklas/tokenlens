import type { Model } from '../types.js';

/**
 * Cohere models aligned with Vercel AI Gateway directory.
 */
export const cohereModels = [
  {
    id: 'cohere:command-r',
    provider: 'cohere',
    vendorId: 'command-r',
    displayName: 'Command R',
    family: 'command-r',
    status: 'stable',
    context: { combinedMax: 128_000 },
    modalities: { textIn: true, textOut: true },
    source: 'https://vercel.com/ai-gateway/models/command-r',
    pricing: { inputPerMTokens: 0.15, outputPerMTokens: 0.60 },
    aliases: ['cohere/command-r'],
  },
  {
    id: 'cohere:command-r-plus',
    provider: 'cohere',
    vendorId: 'command-r-plus',
    displayName: 'Command R+',
    family: 'command-r-plus',
    status: 'stable',
    context: { combinedMax: 128_000 },
    modalities: { textIn: true, textOut: true },
    source: 'https://vercel.com/ai-gateway/models/command-r-plus',
    pricing: { inputPerMTokens: 2.50, outputPerMTokens: 10.00 },
    aliases: ['cohere/command-r-plus', 'command-r+'],
  },
  {
    id: 'cohere:command-a',
    provider: 'cohere',
    vendorId: 'command-a',
    displayName: 'Command A',
    family: 'command-a',
    status: 'stable',
    context: { combinedMax: 256_000 },
    modalities: { textIn: true, textOut: true },
    source: 'https://vercel.com/ai-gateway/models/command-a',
    pricing: { inputPerMTokens: 2.50, outputPerMTokens: 10.00 },
    aliases: ['cohere/command-a'],
  },
  {
    id: 'cohere:embed-v4.0',
    provider: 'cohere',
    vendorId: 'embed-v4.0',
    displayName: 'embed-v4.0',
    family: 'embed-v4.0',
    status: 'stable',
    context: {},
    modalities: { textIn: true, textOut: false },
    source: 'https://vercel.com/ai-gateway/models/embed-v4.0',
    pricing: { inputPerMTokens: 0.12 },
    aliases: ['cohere/embed-v4.0'],
  },
] as const satisfies readonly Model[];
