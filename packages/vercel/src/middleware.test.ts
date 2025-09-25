import { expect, test, vi } from "vitest";
import { generateText } from "ai";
import { MockLanguageModelV2 } from "ai/test";
import { withTokenlens } from "./index.js";
import { Tokenlens as TokenlensClient } from "tokenlens";
import type { SourceProviders } from "tokenlens";

const inputTokenCostUSD = 0.001;
const outputTokenCostUSD = 0.002;
const totalTokenCostUSD = 0.003;

const inputTokens = 10;
const outputTokens = 20;
const totalTokens = 30;

class MockTokenlens extends TokenlensClient {
  public readonly computeCostUSDMock = vi.fn(
    async ({ modelId, provider, usage }) => ({
      inputTokenCostUSD: inputTokenCostUSD * inputTokens,
      outputTokenCostUSD: outputTokenCostUSD * outputTokens,
      totalTokenCostUSD: totalTokenCostUSD * totalTokens,
      ratesUsed: {
        inputPerMTokens: inputTokenCostUSD * 1_000_000,
        outputPerMTokens: outputTokenCostUSD * 1_000_000,
      },
    }),
  );

  constructor() {
    super({
      cacheKey: "mock-tokenlens",
      sources: ["package"],
      loaders: {
        package: async () => ({}) as SourceProviders,
      },
      fetch: async () => ({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({}),
        text: async () => "",
      }),
      cache: {
        get: async () => undefined,
        set: async () => {},
        delete: async () => {},
      },
    });
  }

  override async computeCostUSD(
    args: Parameters<TokenlensClient["computeCostUSD"]>[0],
  ): ReturnType<TokenlensClient["computeCostUSD"]> {
    return this.computeCostUSDMock(args);
  }
}

const mockModel = new MockLanguageModelV2({
  doGenerate: async () => ({
    finishReason: "stop",
    usage: {
      inputTokens: inputTokens,
      outputTokens: outputTokens,
      totalTokens: totalTokens,
    },
    content: [{ type: "text", text: "Hello, world!" }],
    warnings: [],
  }),
});

const sampleCosts = {
  inputTokenCostUSD: inputTokenCostUSD * inputTokens,
  outputTokenCostUSD: outputTokenCostUSD * outputTokens,
  totalTokenCostUSD: totalTokenCostUSD * totalTokens,
};

test("wrapVercelLanguageModel", async () => {
  const tokenlens = new MockTokenlens();
  tokenlens.computeCostUSDMock.mockImplementation(
    async ({ modelId, provider, usage }) => {
      expect(modelId).toBe(mockModel.modelId);
      expect(provider).toBe(mockModel.provider);
      expect(usage).toEqual({
        inputTokens,
        outputTokens,
        totalTokens,
      });
      return {
        ...sampleCosts,
        ratesUsed: {
          inputPerMTokens: inputTokenCostUSD * 1_000_000,
          outputPerMTokens: outputTokenCostUSD * 1_000_000,
        },
      };
    },
  );

  const model = withTokenlens(mockModel, tokenlens);

  const result = await generateText({
    model,
    prompt: "Hello, how are you?",
  });

  expect(result.usage).toBeDefined();
  expect(result.usage?.inputTokens).toBe(10);
  expect(result.usage?.outputTokens).toBe(20);
  expect(result.usage?.totalTokens).toBe(30);

  expect(result.providerMetadata?.tokenlens?.inputTokenCostUSD).toBe(
    sampleCosts.inputTokenCostUSD,
  );
  expect(result.providerMetadata?.tokenlens?.outputTokenCostUSD).toBe(
    sampleCosts.outputTokenCostUSD,
  );
  expect(result.providerMetadata?.tokenlens?.totalTokenCostUSD).toBe(
    sampleCosts.totalTokenCostUSD,
  );

  expect(tokenlens.computeCostUSDMock).toHaveBeenCalledTimes(1);
});
