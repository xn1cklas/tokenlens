import type { Model } from '../types.js';

/**
 * Cohere Command family.
 */
export const cohereModels = [
  {
    id: 'cohere:command-r-plus',
    provider: 'cohere',
    vendorId: 'command-r-plus',
    displayName: 'Command R+',
    family: 'command-r-plus',
    status: 'stable',
    context: {},
    modalities: { textIn: true, textOut: true },
    source: 'https://docs.cohere.com/docs/models',
    aliases: ['command-r+'],
  },
  {
    id: 'cohere:command-r',
    provider: 'cohere',
    vendorId: 'command-r',
    displayName: 'Command R',
    family: 'command-r',
    status: 'stable',
    context: {},
    modalities: { textIn: true, textOut: true },
    source: 'https://docs.cohere.com/docs/models',
    aliases: ['commandr'],
  },
] as const satisfies readonly Model[];

