import { generateText } from "ai";
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

const createMockModel = (options?: {
  provider?: string;
  modelId?: string;
}): Parameters<typeof withTokenlens>[0] => ({
  specificationVersion: "v2",
  provider: options?.provider ?? "mock-provider",
  modelId: options?.modelId ?? "mock-model-id",
  supportedUrls: {},
  doGenerate: async () => ({
    finishReason: "stop",
    usage: {
      inputTokens,
      outputTokens,
      totalTokens,
    },
    content: [{ type: "text", text: "Hello, world!" }],
    warnings: [],
  }),
  doStream: async () => ({
    stream: new ReadableStream({
      start(controller) {
        controller.enqueue({
          type: "finish",
          usage: {
            inputTokens,
            outputTokens,
            totalTokens,
          },
          finishReason: "stop",
        });
        controller.close();
      },
    }),
  }),
});

const mockModel = createMockModel();

const gatewayModel = createMockModel({
  provider: "gateway",
  modelId: "openai/gpt-5",
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

test("withTokenlens resolves gateway-prefixed model ids without forcing gateway provider", async () => {
  computeCostUSDMock.mockClear();
  computeCostUSDMock.mockImplementation(async ({ modelId, provider }) => {
    expect(modelId).toBe("openai/gpt-5");
    expect(provider).toBeUndefined();
    return {
      ...sampleCosts,
      ratesUsed: {
        inputPerMTokens: inputTokenCostUSD * 1_000_000,
        outputPerMTokens: outputTokenCostUSD * 1_000_000,
      },
    };
  });

  const model = withTokenlens(gatewayModel, tokenlens);

  await generateText({
    model,
    prompt: "Hello, how are you?",
  });

  expect(computeCostUSDMock).toHaveBeenCalledTimes(1);
});

test("withTokenlensV5 wraps AI SDK v5 models explicitly", async () => {
  computeCostUSDMock.mockClear();
  computeCostUSDMock.mockImplementation(async () => ({
    ...sampleCosts,
    ratesUsed: {
      inputPerMTokens: inputTokenCostUSD * 1_000_000,
      outputPerMTokens: outputTokenCostUSD * 1_000_000,
    },
  }));

  const model = withTokenlensV5(mockModel, tokenlens);

  await generateText({
    model,
    prompt: "Hello, how are you?",
  });

  expect(computeCostUSDMock).toHaveBeenCalledTimes(1);
});
