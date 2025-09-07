import { describe, it, expect } from 'vitest';
import { normalizeUsage, breakdownTokens, remainingContext, getContextWindow, fitsContext, estimateCost, modelMeta, percentOfContextUsed, tokensRemaining } from 'tokenlens';
import type { LanguageModelV2Usage as VercelUsage } from '@ai-sdk/provider';

// The AI SDK's LanguageModelV2Usage shape as used by generateText/stream APIs.
// We don't import the type to avoid type-only dependency churn; we mirror the fields.
// If you want strict type checks, swap to: `import type { LanguageModelV2Usage } from 'ai'`

// Use the official SDK type directly to mirror usage objects

describe('AI SDK usage normalization', () => {
    it('normalizes input/output/total tokens', () => {
        const usage: VercelUsage = {
            inputTokens: 150,
            outputTokens: 50,
            totalTokens: 200,
            reasoningTokens: 100,
            cachedInputTokens: 100,
        };
        expect(normalizeUsage(usage)).toEqual({ input: 150, output: 50, total: 200 });
    });

    it('falls back to input+output when total is missing', () => {
        const usage: VercelUsage = {
            inputTokens: 10,
            outputTokens: 5,
            totalTokens: undefined,
        };
        expect(normalizeUsage(usage)).toEqual({ input: 10, output: 5, total: 15 });
    });
});

describe('AI SDK usage breakdown', () => {
    it('extracts cached input tokens as cacheReads', () => {
        const usage: VercelUsage = {
            inputTokens: 100,
            outputTokens: 20,
            totalTokens: 120,
            cachedInputTokens: 30,
        };
        const b = breakdownTokens(usage);
        expect(b.input).toBe(100);
        expect(b.output).toBe(20);
        expect(b.total).toBe(120);
        expect(b.cacheReads).toBe(30);
    });
});

describe('Helpers end-to-end with realistic values', () => {
    const modelId = 'openai:gpt-5';
    const usage: VercelUsage = {
        inputTokens: 3200,
        outputTokens: 400,
        totalTokens: 3600,
    };

    it('getContextWindow returns caps', () => {
        const caps = getContextWindow(modelId);
        expect(caps.combinedMax).toBeGreaterThan(0);
    });

    it('remainingContext computes correctly with reserve', () => {
        const rc = remainingContext({ modelId, usage, reserveOutput: 256 });
        expect(rc.remainingCombined).toBeGreaterThan(0);
        expect(rc.percentUsed).toBeGreaterThan(0);
        expect(rc.percentUsed).toBeLessThan(1);
    });

    it('fitsContext guards token counts', () => {
        expect(fitsContext({ modelId, tokens: 1000, reserveOutput: 256 })).toBe(true);
    });

    it('estimateCost returns totals for priced models', () => {
        const c = estimateCost({ modelId, usage });
        expect(c.totalUSD ?? 0).toBeGreaterThanOrEqual(0);
    });

    it('sugar helpers work', () => {
        const meta = modelMeta(modelId);
        const percent = percentOfContextUsed({ id: modelId, usage, reserveOutput: 256 });
        const remaining = tokensRemaining({ id: modelId, usage, reserveOutput: 256 });
        expect(meta.id).toBe(modelId);
        expect(percent).toBeGreaterThan(0);
        expect(remaining).toBeGreaterThan(0);
    });
});


