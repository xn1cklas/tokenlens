import type { Model } from '../types.js';

/**
 * Google models aligned with Vercel AI Gateway directory.
 */
export const googleModels = [
  {
    id: 'google:gemini-2.0-flash',
    provider: 'google',
    vendorId: 'gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash',
    family: 'gemini-2.0-flash',
    status: 'stable',
    context: { combinedMax: 1_000_000 },
    modalities: { textIn: true, textOut: true, imageIn: true },
    source: 'https://vercel.com/ai-gateway/models/gemini-2.0-flash',
    pricing: { inputPerMTokens: 0.15, outputPerMTokens: 0.60 },
    aliases: ['google/gemini-2.0-flash'],
  },
  {
    id: 'google:gemini-2.5-flash-lite',
    provider: 'google',
    vendorId: 'gemini-2.5-flash-lite',
    displayName: 'Gemini 2.5 Flash-Lite',
    family: 'gemini-2.5-flash-lite',
    status: 'stable',
    context: { combinedMax: 1_000_000 },
    modalities: { textIn: true, textOut: true, imageIn: true },
    source: 'https://vercel.com/ai-gateway/models/gemini-2.5-flash-lite',
    pricing: { inputPerMTokens: 0.10, outputPerMTokens: 0.40 },
    aliases: ['google/gemini-2.5-flash-lite'],
  },
  {
    id: 'google:gemini-2.5-flash',
    provider: 'google',
    vendorId: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    family: 'gemini-2.5-flash',
    status: 'stable',
    context: { combinedMax: 1_000_000 },
    modalities: { textIn: true, textOut: true, imageIn: true },
    source: 'https://vercel.com/ai-gateway/models/gemini-2.5-flash',
    pricing: { inputPerMTokens: 0.30, outputPerMTokens: 2.50 },
    aliases: ['google/gemini-2.5-flash'],
  },
  {
    id: 'google:gemini-2.5-pro',
    provider: 'google',
    vendorId: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    family: 'gemini-2.5-pro',
    status: 'stable',
    context: { combinedMax: 1_000_000 },
    modalities: { textIn: true, textOut: true, imageIn: true },
    source: 'https://vercel.com/ai-gateway/models/gemini-2.5-pro',
    pricing: { inputPerMTokens: 2.50, outputPerMTokens: 10.00 },
    aliases: ['google/gemini-2.5-pro'],
  },
] as const satisfies readonly Model[];
