import type { Model } from '../types.js';

/**
 * Meta Llama 3.1 Instruct family (popular open models; context reflects common serving configs).
 */
export const metaModels = [
  {
    id: 'meta:llama-3.1-70b-instruct',
    provider: 'meta',
    vendorId: 'llama-3.1-70b-instruct',
    displayName: 'Llama 3.1 70B Instruct',
    family: 'llama-3.1',
    status: 'stable',
    context: {},
    modalities: { textIn: true, textOut: true },
    source: 'https://llama.meta.com/',
    aliases: ['llama-3.1-70b', 'llama3.1-70b-instruct'],
  },
  {
    id: 'meta:llama-3.1-8b-instruct',
    provider: 'meta',
    vendorId: 'llama-3.1-8b-instruct',
    displayName: 'Llama 3.1 8B Instruct',
    family: 'llama-3.1',
    status: 'stable',
    context: {},
    modalities: { textIn: true, textOut: true },
    source: 'https://llama.meta.com/',
    aliases: ['llama-3.1-8b', 'llama3.1-8b-instruct'],
  },
] as const satisfies readonly Model[];
