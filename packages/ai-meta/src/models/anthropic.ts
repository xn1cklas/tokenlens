import type { Model } from '../types.js';

/**
 * Anthropic Claude 3 and 3.5 series (text-focused entries).
 * Context windows are combined unless noted.
 */

export const anthropicModels = [
  {
    id: 'anthropic:claude-3.5-sonnet',
    provider: 'anthropic',
    vendorId: 'claude-3-5-sonnet',
    displayName: 'Claude 3.5 Sonnet',
    family: 'claude-3.5-sonnet',
    status: 'stable',
    context: { combinedMax: 200_000 },
    modalities: { textIn: true, textOut: true },
    source: 'https://docs.anthropic.com/en/docs/models-overview',
    // Pricing not set here; see pricing page for up-to-date numbers.
    aliases: ['claude-3.5-sonnet'],
  },
  {
    id: 'anthropic:claude-3.5-haiku',
    provider: 'anthropic',
    vendorId: 'claude-3-5-haiku',
    displayName: 'Claude 3.5 Haiku',
    family: 'claude-3.5-haiku',
    status: 'preview',
    context: { combinedMax: 200_000 },
    modalities: { textIn: true, textOut: true },
    source: 'https://docs.anthropic.com/en/docs/models-overview',
    aliases: ['claude-3.5-haiku'],
  },
  {
    id: 'anthropic:claude-3-opus',
    provider: 'anthropic',
    vendorId: 'claude-3-opus-20240229',
    displayName: 'Claude 3 Opus',
    family: 'claude-3-opus',
    status: 'stable',
    context: { combinedMax: 200_000 },
    modalities: { textIn: true, textOut: true },
    source: 'https://docs.anthropic.com/en/docs/models-overview',
    aliases: ['claude-3-opus', 'opus'],
  },
  {
    id: 'anthropic:claude-3-sonnet',
    provider: 'anthropic',
    vendorId: 'claude-3-sonnet-20240229',
    displayName: 'Claude 3 Sonnet',
    family: 'claude-3-sonnet',
    status: 'stable',
    context: { combinedMax: 200_000 },
    modalities: { textIn: true, textOut: true },
    source: 'https://docs.anthropic.com/en/docs/models-overview',
    aliases: ['claude-3-sonnet'],
  },
  {
    id: 'anthropic:claude-3-haiku',
    provider: 'anthropic',
    vendorId: 'claude-3-haiku-20240307',
    displayName: 'Claude 3 Haiku',
    family: 'claude-3-haiku',
    status: 'stable',
    context: { combinedMax: 200_000 },
    modalities: { textIn: true, textOut: true },
    source: 'https://docs.anthropic.com/en/docs/models-overview',
    aliases: ['claude-3-haiku'],
  },
] as const satisfies readonly Model[];
