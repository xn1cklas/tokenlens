import {
  type JSONValue,
  type LanguageModelMiddleware,
  wrapLanguageModel,
} from "ai";
import type { Tokenlens } from "tokenlens";

type TokenlensClient = Pick<Tokenlens, "computeCostUSD">;
type WrapLanguageModelOptions = Parameters<typeof wrapLanguageModel>[0];
type WrappedLanguageModel = ReturnType<typeof wrapLanguageModel>;
type StreamResult = Awaited<
  ReturnType<NonNullable<LanguageModelMiddleware["wrapStream"]>>
>;
type StreamPart = StreamResult extends { stream: ReadableStream<infer Part> }
  ? Part
  : never;
type TokenlensMiddleware = LanguageModelMiddleware & {
  readonly middlewareVersion: "v2";
  readonly specificationVersion: "v3";
};
export type TokenlensMiddlewareOptions = {
  /**
   * When true, cost computation errors fail the AI SDK call/stream.
   * The default is fail-open so observability metadata cannot break a
   * successful model response.
   */
  strict?: boolean;
};
type AiSdkTokenUsage = {
  total?: unknown;
  reasoning?: unknown;
  cacheRead?: unknown;
  cacheWrite?: unknown;
};
type AiSdkUsage = {
  inputTokens?: unknown;
  outputTokens?: unknown;
};

const toJSONValue = (value: unknown): JSONValue => {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(toJSONValue);
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, toJSONValue(entry)]),
    );
  }

  return null;
};

const withTokenlensMetadata = <
  T extends { providerMetadata?: Record<string, unknown> },
>(
  value: T,
  metadata: Record<string, JSONValue>,
): T => ({
  ...value,
  providerMetadata: {
    ...value.providerMetadata,
    tokenlens: {
      ...metadata,
    },
  },
});

const tokenlensErrorMetadata = (error: unknown): Record<string, JSONValue> => {
  if (error instanceof Error) {
    const code =
      "code" in error && typeof error.code === "string"
        ? error.code
        : undefined;
    const meta = "meta" in error ? toJSONValue(error.meta) : undefined;
    return {
      error: {
        message: error.message,
        ...(code ? { code } : {}),
        ...(meta !== undefined ? { meta } : {}),
      },
    };
  }

  return {
    error: {
      message: String(error),
    },
  };
};

const num = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const toRecord = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const toTokenlensUsage = (
  usage: unknown,
): Parameters<TokenlensClient["computeCostUSD"]>[0]["usage"] => {
  const value = toRecord(usage) as AiSdkUsage | undefined;
  const inputTokens = toRecord(value?.inputTokens) as
    | AiSdkTokenUsage
    | undefined;
  const outputTokens = toRecord(value?.outputTokens) as
    | AiSdkTokenUsage
    | undefined;

  if (inputTokens || outputTokens) {
    const input = num(inputTokens?.total);
    const output = num(outputTokens?.total);
    const reasoning = num(outputTokens?.reasoning);
    const cacheRead = num(inputTokens?.cacheRead);
    const cacheWrite = num(inputTokens?.cacheWrite);
    const total =
      input !== undefined || output !== undefined
        ? (input ?? 0) + (output ?? 0)
        : undefined;

    return {
      ...(input !== undefined ? { input_tokens: input } : {}),
      ...(output !== undefined ? { output_tokens: output } : {}),
      ...(total !== undefined ? { total_tokens: total } : {}),
      ...(reasoning !== undefined ? { reasoning_tokens: reasoning } : {}),
      ...(cacheRead !== undefined ? { cache_read_tokens: cacheRead } : {}),
      ...(cacheWrite !== undefined ? { cache_write_tokens: cacheWrite } : {}),
    };
  }

  return usage as Parameters<TokenlensClient["computeCostUSD"]>[0]["usage"];
};

const computeCosts = async ({
  tokenlens,
  model,
  usage,
}: {
  tokenlens: TokenlensClient;
  model: { modelId: string; provider: string };
  usage: unknown;
}) => {
  const provider =
    model.provider === "gateway" && model.modelId.includes("/")
      ? undefined
      : model.provider;

  return tokenlens.computeCostUSD({
    modelId: model.modelId,
    ...(provider !== undefined ? { provider } : {}),
    usage: toTokenlensUsage(usage),
  });
};

/**
 * Middleware to add token costs to the usage.
 * @param tokenlens - The tokenlens instance to use.
 * @returns The middleware.
 */
export const tokenlensMiddleware = (
  tokenlens: TokenlensClient,
  options: TokenlensMiddlewareOptions = {},
): TokenlensMiddleware => ({
  middlewareVersion: "v2",
  specificationVersion: "v3",
  wrapGenerate: async ({ doGenerate, model }) => {
    const result = await doGenerate();
    if (!result.usage) return result;

    try {
      const costs = await computeCosts({
        tokenlens,
        model,
        usage: result.usage,
      });

      return {
        costs,
        ...withTokenlensMetadata(result, { costs: toJSONValue(costs) }),
      };
    } catch (error) {
      if (options.strict) throw error;
      return withTokenlensMetadata(result, tokenlensErrorMetadata(error));
    }
  },
  wrapStream: async ({ doStream, model }) => {
    const result = await doStream();

    return {
      ...result,
      stream: result.stream.pipeThrough(
        new TransformStream<StreamPart, StreamPart>({
          transform: async (part, controller) => {
            if (part.type !== "finish") {
              controller.enqueue(part);
              return;
            }

            try {
              const costs = await computeCosts({
                tokenlens,
                model,
                usage: part.usage,
              });

              controller.enqueue(
                withTokenlensMetadata(part, { costs: toJSONValue(costs) }),
              );
            } catch (error) {
              if (options.strict) throw error;
              controller.enqueue(
                withTokenlensMetadata(part, tokenlensErrorMetadata(error)),
              );
            }
          },
        }),
      ),
    };
  },
});

/**
 * Wraps a Vercel language model with a tokenlens middleware to add token costs to the usage.
 * @param model - The Vercel language model to wrap, if you are using the Vercel AI Gateway please use @ai-sdk/gateway instead of a string.
 * @param tokenlens - The tokenlens instance to use.
 * @returns The wrapped Vercel language model.
 */
export const wrapVercelLanguageModel = (
  model: WrapLanguageModelOptions["model"],
  tokenlens: TokenlensClient,
  options?: TokenlensMiddlewareOptions,
): WrappedLanguageModel =>
  wrapLanguageModel({
    model,
    middleware: tokenlensMiddleware(tokenlens, options),
  });

/**
 * AI SDK v5 middleware helper.
 *
 * Runtime-compatible with `LanguageModelV2Middleware`; exported separately so
 * v5 users can choose an explicit major-version helper.
 */
export const tokenlensMiddlewareV5 = tokenlensMiddleware;

export const withTokenlensV5 = (
  model: WrapLanguageModelOptions["model"],
  tokenlens: TokenlensClient,
  options?: TokenlensMiddlewareOptions,
): WrappedLanguageModel =>
  wrapLanguageModel({
    model,
    middleware: tokenlensMiddlewareV5(tokenlens, options),
  });
