import type { Model } from '../types.js';

/**
 * Mistral AI popular endpoints.
 */
export const mistralModels = [
  {
    id: 'mistral:mistral-large-latest',
    provider: 'mistral',
    vendorId: 'mistral-large-latest',
    displayName: 'Mistral Large (latest)',
    family: 'mistral-large',
    status: 'stable',
    context: {},
    modalities: { textIn: true, textOut: true },
    source: 'https://docs.mistral.ai/platform/models/',
    aliases: ['mistral-large'],
  },
  {
    id: 'mistral:mistral-small-latest',
    provider: 'mistral',
    vendorId: 'mistral-small-latest',
    displayName: 'Mistral Small (latest)',
    family: 'mistral-small',
    status: 'stable',
    context: {},
    modalities: { textIn: true, textOut: true },
    source: 'https://docs.mistral.ai/platform/models/',
    aliases: ['mistral-small'],
  },
  {
    id: 'mistral:codestral-latest',
    provider: 'mistral',
    vendorId: 'codestral-latest',
    displayName: 'Codestral (latest)',
    family: 'codestral',
    status: 'stable',
    context: {},
    modalities: { textIn: true, textOut: true },
    source: 'https://docs.mistral.ai/platform/models/',
    aliases: ['codestral'],
  },
] as const satisfies readonly Model[];
