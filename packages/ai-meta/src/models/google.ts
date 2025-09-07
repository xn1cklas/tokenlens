import type { Model } from '../types.js';

/**
 * Google Gemini family (popular text-capable entries).
 * Context values are only set where the docs explicitly state them.
 */
export const googleModels = [
  {
    id: 'google:gemini-2.5-pro',
    provider: 'google',
    vendorId: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    family: 'gemini-2.5-pro',
    status: 'stable',
    context: {},
    modalities: { textIn: true, textOut: true, imageIn: true },
    source: 'https://ai.google.dev/gemini-api/docs/models',
    aliases: ['gemini-2_5-pro', 'g2.5-pro', 'gemini-pro-2.5'],
  },
  {
    id: 'google:gemini-2.5-flash',
    provider: 'google',
    vendorId: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    family: 'gemini-2.5-flash',
    status: 'stable',
    context: {},
    modalities: { textIn: true, textOut: true, imageIn: true },
    source: 'https://ai.google.dev/gemini-api/docs/models',
    aliases: ['gemini-2_5-flash', 'g2.5-flash', 'gemini-flash-2.5'],
  },
  {
    id: 'google:gemini-2.0-flash',
    provider: 'google',
    vendorId: 'gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash',
    family: 'gemini-2.0-flash',
    status: 'stable',
    // Explicitly documented long-context: 1 million
    context: { combinedMax: 1_000_000 },
    modalities: { textIn: true, textOut: true, imageIn: true },
    source: 'https://ai.google.dev/gemini-api/docs/long-context',
    aliases: ['gemini-2_0-flash', 'g2.0-flash', 'gemini-flash-2.0'],
  },
] as const satisfies readonly Model[];
