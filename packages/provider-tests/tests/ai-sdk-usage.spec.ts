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

    it('extracts reasoningTokens when present', () => {
        const usage: VercelUsage = {
            inputTokens: 200,
            outputTokens: 50,
            totalTokens: 250,
            reasoningTokens: 75,
        };
        const b = breakdownTokens(usage);
        expect(b.input).toBe(200);
        expect(b.output).toBe(50);
        expect(b.total).toBe(250);
        expect(b.reasoningTokens).toBe(75);
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

    it('estimateCost ignores reasoningTokens when model has no reasoning pricing', () => {
        // openai:o1 currently has input/output pricing only
        const modelId2 = 'openai:o1';
        const usage2: VercelUsage = {
            inputTokens: 1000,
            outputTokens: 500,
            totalTokens: 1500,
            reasoningTokens: 200, // present but no pricing configured in registry
        };
        const c = estimateCost({ modelId: modelId2, usage: usage2 });
        // expected: (1000/1e6)*15 + (500/1e6)*60 = 0.045
        expect(c.reasoningUSD).toBeUndefined();
        expect(c.inputUSD).toBeCloseTo(0.015, 10);
        expect(c.outputUSD).toBeCloseTo(0.03, 10);
        expect(c.totalUSD).toBeCloseTo(0.045, 10);
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

