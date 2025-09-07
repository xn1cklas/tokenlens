import type { Model } from '../types.js';

/**
 * Curated OpenAI model entries focused on mainstream, text-capable models.
 * Context windows are combined (input + output) unless noted.
 * Note: Values reflect widely published ranges as of 2024 and may change.
 */

export const openAIModels = [
  {
    id: 'openai:gpt-4o',
    provider: 'openai',
    vendorId: 'gpt-4o',
    displayName: 'GPT-4o',
    family: 'gpt-4o',
    status: 'stable',
    context: { combinedMax: 128_000 },
    modalities: { textIn: true, textOut: true, imageIn: true },
    source: 'https://platform.openai.com/docs/models',
    // Pricing not set here; see pricing page for up-to-date numbers.
    aliases: ['gpt4o'],
  },
  {
    id: 'openai:gpt-4o-mini',
    provider: 'openai',
    vendorId: 'gpt-4o-mini',
    displayName: 'GPT-4o mini',
    family: 'gpt-4o-mini',
    status: 'stable',
    context: { combinedMax: 128_000 },
    modalities: { textIn: true, textOut: true, imageIn: true },
    source: 'https://platform.openai.com/docs/models',
    // Pricing not set here; see pricing page for up-to-date numbers.
    aliases: ['gpt4o-mini'],
  },
  {
    id: 'openai:gpt-4.1',
    provider: 'openai',
    vendorId: 'gpt-4.1',
    displayName: 'GPT-4.1',
    family: 'gpt-4.1',
    status: 'stable',
    context: { combinedMax: 128_000 },
    modalities: { textIn: true, textOut: true },
    source: 'https://platform.openai.com/docs/models',
    aliases: ['gpt-4_1'],
  },
  {
    id: 'openai:gpt-4.1-mini',
    provider: 'openai',
    vendorId: 'gpt-4.1-mini',
    displayName: 'GPT-4.1 mini',
    family: 'gpt-4.1-mini',
    status: 'stable',
    context: { combinedMax: 128_000 },
    modalities: { textIn: true, textOut: true },
    source: 'https://platform.openai.com/docs/models',
    aliases: ['gpt-4_1-mini'],
  },
  // Older model — increasingly deprecated in many apps; kept for reference
  {
    id: 'openai:gpt-3.5-turbo-0125',
    provider: 'openai',
    vendorId: 'gpt-3.5-turbo-0125',
    displayName: 'GPT-3.5 Turbo (0125)',
    family: 'gpt-3.5-turbo',
    status: 'deprecated',
    context: { combinedMax: 16_385 },
    modalities: { textIn: true, textOut: true },
    source: 'https://platform.openai.com/docs/models',
    aliases: ['gpt-3.5-turbo'],
  },
] as const satisfies readonly Model[];
