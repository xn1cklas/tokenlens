import type { Model } from '../types.js';

/**
 * xAI Grok models.
 */
export const xaiModels = [
  {
    id: 'xai:grok-2',
    provider: 'xai',
    vendorId: 'grok-2',
    displayName: 'Grok-2',
    family: 'grok-2',
    status: 'stable',
    context: {},
    modalities: { textIn: true, textOut: true },
    source: 'https://docs.x.ai/docs/models',
    aliases: ['grok2'],
  },
  {
    id: 'xai:grok-2-mini',
    provider: 'xai',
    vendorId: 'grok-2-mini',
    displayName: 'Grok-2 mini',
    family: 'grok-2-mini',
    status: 'stable',
    context: {},
    modalities: { textIn: true, textOut: true },
    source: 'https://docs.x.ai/docs/models',
    aliases: ['grok2-mini'],
  },
] as const satisfies readonly Model[];
