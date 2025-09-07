import type { Model } from '../types.js';

/**
 * Anthropic models aligned with Vercel AI Gateway directory.
 */
export const anthropicModels = [
  {
    id: 'anthropic:claude-sonnet-4',
    provider: 'anthropic',
    vendorId: 'claude-sonnet-4',
    displayName: 'Claude Sonnet 4',
    family: 'claude-4',
    status: 'stable',
    context: { combinedMax: 200_000 },
    modalities: { textIn: true, textOut: true },
    source: 'https://vercel.com/ai-gateway/models/claude-sonnet-4',
    pricing: { inputPerMTokens: 3.0, outputPerMTokens: 15.0 },
    aliases: ['anthropic/claude-sonnet-4', 'claude-sonnet-4'],
  },
  {
    id: 'anthropic:claude-3.7-sonnet',
    provider: 'anthropic',
    vendorId: 'claude-3.7-sonnet',
    displayName: 'Claude 3.7 Sonnet',
    family: 'claude-3.7',
    status: 'stable',
    context: { combinedMax: 200_000 },
    modalities: { textIn: true, textOut: true },
    source: 'https://vercel.com/ai-gateway/models/claude-3.7-sonnet',
    pricing: { inputPerMTokens: 3.0, outputPerMTokens: 15.0 },
    aliases: ['anthropic/claude-3.7-sonnet', 'claude-3.7-sonnet'],
  },
  {
    id: 'anthropic:claude-opus-4.1',
    provider: 'anthropic',
    vendorId: 'claude-opus-4.1',
    displayName: 'Claude Opus 4.1',
    family: 'claude-opus-4.1',
    status: 'stable',
    context: { combinedMax: 200_000 },
    modalities: { textIn: true, textOut: true },
    source: 'https://vercel.com/ai-gateway/models/claude-opus-4.1',
    pricing: { inputPerMTokens: 15.0, outputPerMTokens: 75.0 },
    aliases: ['anthropic/claude-opus-4.1', 'claude-opus-4.1'],
  },
] as const satisfies readonly Model[];
