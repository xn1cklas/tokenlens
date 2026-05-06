import { generateText } from "ai";
import { MockLanguageModelV2 } from "ai/test";
import type { Tokenlens } from "tokenlens";
import { expect, test, vi } from "vitest";
import {
  tokenlensMiddlewareV5,
  tokenlensMiddlewareV6,
  withTokenlens,
  withTokenlensV5,
} from "./index.js";

const inputTokenCostUSD = 0.001;
const outputTokenCostUSD = 0.002;
const totalTokenCostUSD = 0.003;

const inputTokens = 10;
const outputTokens = 20;
const totalTokens = 30;

const computeCostUSDMock = vi.fn(
  async (_args: Parameters<Tokenlens["computeCostUSD"]>[0]) => ({
    inputTokenCostUSD: inputTokenCostUSD * inputTokens,
    outputTokenCostUSD: outputTokenCostUSD * outputTokens,
    totalTokenCostUSD: totalTokenCostUSD * totalTokens,
    ratesUsed: {
      inputPerMTokens: inputTokenCostUSD * 1_000_000,
      outputPerMTokens: outputTokenCostUSD * 1_000_000,
    },
  }),
);

const tokenlens: Pick<Tokenlens, "computeCostUSD"> = {
  computeCostUSD: computeCostUSDMock,
};

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
  expect(tokenlensMiddlewareV5(tokenlens).middlewareVersion).toBe("v2");
  expect(tokenlensMiddlewareV6(tokenlens).specificationVersion).toBe("v3");

  computeCostUSDMock.mockImplementation(
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

  const metadata = result.providerMetadata?.tokenlens as
    | { costs?: typeof sampleCosts }
    | undefined;

  expect(metadata?.costs).toBeDefined();
  expect(metadata?.costs?.inputTokenCostUSD).toBe(
    sampleCosts.inputTokenCostUSD,
  );
  expect(metadata?.costs?.outputTokenCostUSD).toBe(
    sampleCosts.outputTokenCostUSD,
  );
  expect(metadata?.costs?.totalTokenCostUSD).toBe(
    sampleCosts.totalTokenCostUSD,
  );

  expect(computeCostUSDMock).toHaveBeenCalledTimes(1);
});

test("withTokenlensV5 wraps AI SDK v5 models explicitly", async () => {
  computeCostUSDMock.mockClear();

  const model = withTokenlensV5(mockModel, tokenlens);

  await generateText({
    model,
    prompt: "Hello, how are you?",
  });

  expect(computeCostUSDMock).toHaveBeenCalledTimes(1);
});
