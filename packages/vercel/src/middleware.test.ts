import { generateText } from "ai";
import type { Tokenlens } from "tokenlens";
import { expect, test, vi } from "vitest";
import {
  tokenlensMiddlewareV5,
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

async function readStreamParts<T>(stream: ReadableStream<T>): Promise<T[]> {
  const reader = stream.getReader();
  const parts: T[] = [];
  while (true) {
    const result = await reader.read();
    if (result.done) break;
    parts.push(result.value);
  }
  return parts;
}

test("wrapVercelLanguageModel", async () => {
  expect(tokenlensMiddlewareV5(tokenlens).middlewareVersion).toBe("v2");
  expect(tokenlensMiddlewareV5(tokenlens).specificationVersion).toBe("v3");

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

test("middleware leaves generate results without usage untouched", async () => {
  computeCostUSDMock.mockClear();
  const middleware = tokenlensMiddlewareV5(tokenlens);
  const resultWithoutUsage = {
    finishReason: "stop",
    content: [{ type: "text" as const, text: "No usage" }],
    warnings: [],
  };

  const result = await middleware.wrapGenerate?.({
    model: mockModel,
    doGenerate: async () => resultWithoutUsage,
  } as never);

  expect(result).toBe(resultWithoutUsage);
  expect(computeCostUSDMock).not.toHaveBeenCalled();
});

test("middleware records cost errors as metadata by default", async () => {
  computeCostUSDMock.mockClear();
  const pricingError = Object.assign(new Error("pricing unavailable"), {
    code: "MODEL_NOT_FOUND",
    meta: { modelId: "mock-model-id" },
  });
  computeCostUSDMock.mockRejectedValue(pricingError);
  const middleware = tokenlensMiddlewareV5(tokenlens);

  const result = await middleware.wrapGenerate?.({
    model: mockModel,
    doGenerate: async () => ({
      finishReason: "stop",
      usage: {
        inputTokens,
        outputTokens,
        totalTokens,
      },
      content: [{ type: "text" as const, text: "Still succeeds" }],
      warnings: [],
    }),
  } as never);

  expect(result).toMatchObject({
    providerMetadata: {
      tokenlens: {
        error: {
          message: "pricing unavailable",
          code: "MODEL_NOT_FOUND",
          meta: { modelId: "mock-model-id" },
        },
      },
    },
  });
});

test("middleware can fail closed in strict mode", async () => {
  computeCostUSDMock.mockClear();
  const pricingError = new Error("pricing unavailable");
  computeCostUSDMock.mockRejectedValue(pricingError);
  const middleware = tokenlensMiddlewareV5(tokenlens, { strict: true });

  await expect(
    middleware.wrapGenerate?.({
      model: mockModel,
      doGenerate: async () => ({
        finishReason: "stop",
        usage: {
          inputTokens,
          outputTokens,
          totalTokens,
        },
        content: [{ type: "text" as const, text: "Strict" }],
        warnings: [],
      }),
    } as never),
  ).rejects.toThrow("pricing unavailable");
});

test("middleware records plain cost errors as metadata", async () => {
  computeCostUSDMock.mockClear();
  computeCostUSDMock.mockRejectedValue("pricing unavailable");
  const middleware = tokenlensMiddlewareV5(tokenlens);

  const result = await middleware.wrapGenerate?.({
    model: mockModel,
    doGenerate: async () => ({
      finishReason: "stop",
      usage: {
        inputTokens,
        outputTokens,
        totalTokens,
      },
      content: [{ type: "text" as const, text: "Still succeeds" }],
      warnings: [],
    }),
  } as never);

  expect(result).toMatchObject({
    providerMetadata: {
      tokenlens: {
        error: {
          message: "pricing unavailable",
        },
      },
    },
  });
});

test("middleware records Error cost failures without optional fields", async () => {
  computeCostUSDMock.mockClear();
  computeCostUSDMock.mockRejectedValue(new Error("pricing unavailable"));
  const middleware = tokenlensMiddlewareV5(tokenlens);

  const result = await middleware.wrapGenerate?.({
    model: mockModel,
    doGenerate: async () => ({
      finishReason: "stop",
      usage: {
        inputTokens,
        outputTokens,
        totalTokens,
      },
      content: [{ type: "text" as const, text: "Still succeeds" }],
      warnings: [],
    }),
  } as never);

  expect(result).toMatchObject({
    providerMetadata: {
      tokenlens: {
        error: {
          message: "pricing unavailable",
        },
      },
    },
  });
  expect(
    (result as { providerMetadata?: { tokenlens?: { error?: object } } })
      .providerMetadata?.tokenlens?.error,
  ).not.toHaveProperty("code");
});

test("middleware handles empty nested AI SDK usage objects", async () => {
  computeCostUSDMock.mockClear();
  computeCostUSDMock.mockImplementation(async ({ usage }) => {
    expect(usage).toEqual({});
    return {
      ...sampleCosts,
      ratesUsed: {
        inputPerMTokens: inputTokenCostUSD * 1_000_000,
        outputPerMTokens: outputTokenCostUSD * 1_000_000,
      },
    };
  });
  const middleware = tokenlensMiddlewareV5(tokenlens);

  const result = await middleware.wrapGenerate?.({
    model: mockModel,
    doGenerate: async () => ({
      finishReason: "stop",
      usage: {
        inputTokens: {},
        outputTokens: {},
      },
      content: [{ type: "text" as const, text: "No counters" }],
      warnings: [],
    }),
  } as never);

  expect(result?.providerMetadata?.tokenlens).toBeDefined();
  expect(computeCostUSDMock).toHaveBeenCalledTimes(1);
});

test("middleware totals nested usage when only one side is present", async () => {
  computeCostUSDMock.mockClear();
  const usages: Array<Parameters<Tokenlens["computeCostUSD"]>[0]["usage"]> = [];
  computeCostUSDMock.mockImplementation(async ({ usage }) => {
    usages.push(usage);
    return {
      ...sampleCosts,
      ratesUsed: {
        inputPerMTokens: inputTokenCostUSD * 1_000_000,
        outputPerMTokens: outputTokenCostUSD * 1_000_000,
      },
    };
  });
  const middleware = tokenlensMiddlewareV5(tokenlens);

  await middleware.wrapGenerate?.({
    model: mockModel,
    doGenerate: async () => ({
      finishReason: "stop",
      usage: {
        inputTokens: { total: 10 },
        outputTokens: {},
      },
      content: [{ type: "text" as const, text: "Input only" }],
      warnings: [],
    }),
  } as never);
  await middleware.wrapGenerate?.({
    model: mockModel,
    doGenerate: async () => ({
      finishReason: "stop",
      usage: {
        inputTokens: {},
        outputTokens: { total: 20 },
      },
      content: [{ type: "text" as const, text: "Output only" }],
      warnings: [],
    }),
  } as never);

  expect(usages).toEqual([
    { input_tokens: 10, total_tokens: 10 },
    { output_tokens: 20, total_tokens: 20 },
  ]);
});

test("middleware converts nested AI SDK usage and enriches streamed finish parts", async () => {
  computeCostUSDMock.mockClear();
  computeCostUSDMock.mockImplementation(
    async ({ modelId, provider, usage }) => {
      expect(modelId).toBe("gpt-5");
      expect(provider).toBe("gateway");
      expect(usage).toEqual({
        input_tokens: 10,
        output_tokens: 20,
        total_tokens: 30,
        reasoning_tokens: 4,
        cache_read_tokens: 2,
        cache_write_tokens: 3,
      });
      return {
        ...sampleCosts,
        ratesUsed: {
          inputPerMTokens: inputTokenCostUSD * 1_000_000,
          outputPerMTokens: outputTokenCostUSD * 1_000_000,
        },
        debug: {
          kept: true,
          skipped: undefined,
          unsupported: () => "not JSON",
          values: [1, undefined, () => "not JSON"],
        },
      } as never;
    },
  );
  const middleware = tokenlensMiddlewareV5(tokenlens);
  const textPart = { type: "text-delta", textDelta: "hello" };
  const finishPart = {
    type: "finish",
    usage: {
      inputTokens: {
        total: 10,
        cacheRead: 2,
        cacheWrite: 3,
      },
      outputTokens: {
        total: 20,
        reasoning: 4,
      },
    },
    finishReason: "stop",
    providerMetadata: {
      existing: {
        keep: true,
      },
    },
  };

  const result = await middleware.wrapStream?.({
    model: createMockModel({ provider: "gateway", modelId: "gpt-5" }),
    doStream: async () => ({
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue(textPart);
          controller.enqueue(finishPart);
          controller.close();
        },
      }),
    }),
  } as never);

  const parts = await readStreamParts(
    result?.stream as ReadableStream<unknown>,
  );

  expect(parts[0]).toBe(textPart);
  expect(parts[1]).toMatchObject({
    type: "finish",
    providerMetadata: {
      existing: { keep: true },
      tokenlens: {
        costs: {
          inputTokenCostUSD: sampleCosts.inputTokenCostUSD,
          outputTokenCostUSD: sampleCosts.outputTokenCostUSD,
          totalTokenCostUSD: sampleCosts.totalTokenCostUSD,
          debug: {
            kept: true,
            unsupported: null,
            values: [1, null, null],
          },
        },
      },
    },
  });
  expect(
    (
      parts[1] as {
        providerMetadata?: { tokenlens?: { costs?: { debug?: object } } };
      }
    ).providerMetadata?.tokenlens?.costs?.debug,
  ).not.toHaveProperty("skipped");
  expect(computeCostUSDMock).toHaveBeenCalledTimes(1);
});

test("middleware records streamed cost errors as metadata by default", async () => {
  computeCostUSDMock.mockClear();
  computeCostUSDMock.mockRejectedValue(new Error("stream pricing unavailable"));
  const middleware = tokenlensMiddlewareV5(tokenlens);
  const finishPart = {
    type: "finish",
    usage: {
      inputTokens,
      outputTokens,
      totalTokens,
    },
    finishReason: "stop",
  };

  const result = await middleware.wrapStream?.({
    model: mockModel,
    doStream: async () => ({
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue(finishPart);
          controller.close();
        },
      }),
    }),
  } as never);

  const parts = await readStreamParts(
    result?.stream as ReadableStream<unknown>,
  );

  expect(parts).toHaveLength(1);
  expect(parts[0]).toMatchObject({
    type: "finish",
    providerMetadata: {
      tokenlens: {
        error: {
          message: "stream pricing unavailable",
        },
      },
    },
  });
});

test("middleware can fail closed for streamed cost errors", async () => {
  computeCostUSDMock.mockClear();
  computeCostUSDMock.mockRejectedValue(new Error("stream pricing unavailable"));
  const middleware = tokenlensMiddlewareV5(tokenlens, { strict: true });

  const result = await middleware.wrapStream?.({
    model: mockModel,
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
  } as never);

  await expect(
    readStreamParts(result?.stream as ReadableStream<unknown>),
  ).rejects.toThrow("stream pricing unavailable");
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
