import type {
  LanguageModelV2,
  LanguageModelV2Middleware,
} from "@ai-sdk/provider";
import { wrapLanguageModel, type JSONValue } from "ai";
import type { Tokenlens } from "tokenlens";

/**
 * Middleware to add token costs to the usage.
 * @param tokenlens - The tokenlens instance to use.
 * @returns The middleware.
 */
export const tokenlensMiddleware = (
  tokenlens: Pick<Tokenlens, "getTokenCosts">,
): LanguageModelV2Middleware => ({
  wrapGenerate: async ({ doGenerate, model }) => {
    const result = await doGenerate();
    if (!result.usage) return result;

    const costs = await tokenlens.getTokenCosts({
      modelId: model.modelId,
      provider: model.provider,
      usage: result.usage,
    });
    const providerMetadata = result.providerMetadata ?? {};

    const toJSON = (obj: Record<string, unknown>): Record<string, unknown> =>
      Object.fromEntries(
        Object.entries(obj)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) =>
            value && typeof value === "object" && !Array.isArray(value)
              ? [key, toJSON(value as Record<string, unknown>)]
              : [key, value],
          ),
      );

    providerMetadata["tokenlens-vercel"] = toJSON(costs) as Record<
      string,
      JSONValue
    >;
    result.providerMetadata = providerMetadata;

    return {
      costs,
      ...result,
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
  model: LanguageModelV2,
  tokenlens: Tokenlens,
) => {
  return wrapLanguageModel({
    model,
    middleware: tokenlensMiddleware(tokenlens),
  });
};
