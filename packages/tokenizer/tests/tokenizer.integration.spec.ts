/**
 * Integration tests for tokenizer with real API calls
 *
 * These tests require valid API keys for each provider:
 * - GOOGLE_API_KEY: https://aistudio.google.com/app/apikey
 * - ANTHROPIC_API_KEY: https://console.anthropic.com
 *
 * OpenAI tests don't require an API key (uses tiktoken locally)
 *
 * To run these tests:
 * 1. Create a .env file in packages/tokenizer/.env with:
 *    GOOGLE_API_KEY=your_google_api_key_here
 *    ANTHROPIC_API_KEY=your_anthropic_api_key_here
 * 2. Run the tests:
 *    pnpm test:run tokenizer.integration
 *
 * Note: Tests will be automatically skipped if API keys are not set.
 */

import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

// Load .env from packages/tokenizer directory
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env") });

import { describe, expect, it } from "vitest";
import { countTokens } from "../src/index.js";

type ProviderConfig = {
    provider: string;
    modelId: string;
    apiKey?: string;
    skipIfNoKey: boolean;
    displayName: string;
};

const providers: ProviderConfig[] = [
    {
        provider: "google",
        modelId: "gemini-2.5-pro",
        apiKey: process.env.GOOGLE_API_KEY,
        skipIfNoKey: true,
        displayName: "Google (Gemini)",
    },
    {
        provider: "anthropic",
        modelId: "claude-sonnet-4-5",
        apiKey: process.env.ANTHROPIC_API_KEY,
        skipIfNoKey: true,
        displayName: "Anthropic (Claude)",
    },
    {
        provider: "openai",
        modelId: "gpt-4o",
        skipIfNoKey: false, // tiktoken works locally
        displayName: "OpenAI (GPT)",
    },
];

// Test cases to run for each provider
const testCases = [
    {
        name: "should count tokens for medium length text",
        text: "Hello, how are you doing today? This is a test message.",
        minTokens: 5,
        maxTokens: 30,
    },
    {
        name: "should count tokens for short text",
        text: "Hello world",
        minTokens: 1,
        maxTokens: 10,
    },
    {
        name: "should count tokens for longer text",
        text: `
      Tokenlens is a powerful library for tracking and managing token usage across multiple AI providers.
      It helps developers monitor costs, stay within context limits, and optimize their AI applications.
      The library supports various providers including OpenAI, Anthropic, Google, and more.
      With Tokenlens, you can easily estimate token counts before making API calls,
      compute costs based on actual usage, and get detailed information about model capabilities.
    `,
        minTokens: 30,
        maxTokens: 200,
    },
];

// Run tests for each provider
providers.forEach(({ provider, modelId, displayName }) => {
    describe(`${displayName} integration`, () => {
        testCases.forEach(({ name, text, minTokens, maxTokens }) => {
            it(name, async () => {
                const result = await countTokens(modelId, text);
                console.log(result);

                expect(result).toBeDefined();
                expect(typeof result).toBe("number");
                expect(result).toBeGreaterThan(0);
                expect(result).toBeGreaterThanOrEqual(minTokens);
                expect(result).toBeLessThanOrEqual(maxTokens);
            });
        });

        // Test with provider prefix
        it("should handle provider prefix in model ID", async () => {
            const prefixedModelId = `${provider}/${modelId}`;
            const text = "Test with prefix";
            const result = await countTokens(prefixedModelId, text);
            console.log(result);

            expect(result).toBeDefined();
            expect(typeof result).toBe("number");
            expect(result).toBeGreaterThan(0);
        });
    });
});

// Test the fallback behavior (4th case)
describe("Fallback to OpenAI GPT-5 (default)", () => {
    it("should fallback to OpenAI GPT-5 for unknown model", async () => {
        const text = "Hello, how are you doing today?";
        // Cast to bypass TypeScript validation for testing unknown provider
        const result = await countTokens("unknown-model", text);

        expect(result).toBeDefined();
        expect(typeof result).toBe("number");
        expect(result).toBeGreaterThan(0);
    });

    it("should count tokens correctly in fallback mode", async () => {
        const text = "Hello world";
        const result = await countTokens("some-future-model", text);

        expect(result).toBeDefined();
        expect(typeof result).toBe("number");
        // "Hello world" should be 2 tokens with tiktoken
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(5);
    });

    it("should handle longer text in fallback mode", async () => {
        const text = `
      This is a longer text that will be tokenized using the fallback mechanism.
      The tokenizer should default to OpenAI's GPT-5 with tiktoken locally.
      This ensures that even for unknown providers, we can still count tokens.
    `;
        const result = await countTokens("mystery-model", text);

        expect(result).toBeDefined();
        expect(typeof result).toBe("number");
        expect(result).toBeGreaterThan(20);
        expect(result).toBeLessThan(100);
    });
});
