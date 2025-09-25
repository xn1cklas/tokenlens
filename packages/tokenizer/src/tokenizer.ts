import type {
  CountTokensContent,
  CountTokensOptions,
  CountTokensParams,
  EstimateTokensParams,
  TokenizerDispatch,
  TokenizerResolvedInput,
  TokenizerResult,
  TokenizerInput,
  TokenizerProvider,
  TokenizerId,
} from "./types.js";
import { coerceContent } from "./utils.js";

type TokenizerRegistry = {
  resolve(input: TokenizerResolvedInput): TokenizerDispatch | undefined;
  fallback: TokenizerDispatch;
};

let cachedRegistry: TokenizerRegistry | undefined;

export async function estimateTokens(
  providerId: string,
  modelId: string,
  content?: CountTokensContent,
  options?: CountTokensOptions,
): Promise<TokenizerResult>;
export async function estimateTokens(
  input: EstimateTokensParams,
): Promise<TokenizerResult>;
export async function estimateTokens(
  input: CountTokensParams,
): Promise<TokenizerResult>;
export async function estimateTokens(
  arg1: string | CountTokensParams,
  arg2?: string,
  arg3?: CountTokensContent,
  arg4?: CountTokensOptions,
): Promise<TokenizerResult> {
  const params =
    typeof arg1 === "string"
      ? normalizeArguments(arg1, arg2 as string, arg3, arg4)
      : isLegacyParams(arg1)
        ? normalizeArguments(
            arg1.providerId,
            arg1.modelId,
            arg1.content,
            arg1.options,
          )
        : arg1;

  const normalized = normalizeTokenizerInput(params);
  const coerced = coerceContent(normalized);

  const { messages: _rawMessages, ...rest } = normalized;
  const base = rest as Omit<TokenizerInput, "messages">;
  const resolved: TokenizerResolvedInput = {
    ...base,
    text: coerced.text,
    ...(coerced.messages ? { messages: coerced.messages } : {}),
  } as TokenizerResolvedInput;

  const registry = await loadRegistry();
  const dispatch = registry.resolve(resolved);
  if (!dispatch) {
    warnUnknown(resolved);
    return finalizeResult(await registry.fallback.estimate(resolved));
  }

  return finalizeResult(await dispatch.estimate(resolved));
}

export const countTokens = estimateTokens;

async function loadRegistry(): Promise<TokenizerRegistry> {
  if (!cachedRegistry) {
    cachedRegistry = await createTokenizerRegistry();
  }
  return cachedRegistry;
}

async function createTokenizerRegistry(): Promise<TokenizerRegistry> {
  const [fallback, providers] = await Promise.all([
    import("./tokenizers/fallback.js").then((m) => m.fallbackTokenizer),
    loadTokenizerProviders(),
  ]);

  return {
    resolve(input) {
      for (const provider of providers) {
        const match = provider.match(input);
        if (match) return match;
      }
      return undefined;
    },
    fallback,
  } satisfies TokenizerRegistry;
}

async function loadTokenizerProviders(): Promise<TokenizerProvider[]> {
  const providers = await Promise.all([
    import("./tokenizers/openai.js").then((m) => m.openaiTokenizerProvider),
    import("./tokenizers/anthropic.js").then(
      (m) => m.anthropicTokenizerProvider,
    ),
  ]);
  return providers.filter(Boolean);
}

function normalizeTokenizerInput(
  input: EstimateTokensParams,
): EstimateTokensParams {
  const tokenizerId = resolveTokenizerId(input);
  if (tokenizerId && tokenizerId !== input.tokenizerId) {
    return { ...input, tokenizerId };
  }
  return input;
}

function resolveTokenizerId(
  input: EstimateTokensParams,
): TokenizerId | undefined {
  if (input.tokenizerId) return input.tokenizerId;
  if (input.encodingOverride) return input.encodingOverride;
  if (input.model?.extras && typeof input.model.extras === "object") {
    return inferTokenizerFromModel(input.model.extras);
  }
  return undefined;
}

function inferTokenizerFromModel(
  extras: Record<string, unknown>,
): TokenizerId | undefined {
  const tokenizer = (extras as { architecture?: { tokenizer?: string } })
    .architecture?.tokenizer;
  if (typeof tokenizer === "string" && tokenizer.length > 0) {
    return tokenizer as TokenizerId;
  }
  return undefined;
}

function normalizeArguments(
  providerId: string,
  modelId: string,
  content: CountTokensContent | undefined,
  options: CountTokensOptions = {},
): EstimateTokensParams {
  if (Array.isArray(content)) {
    return {
      providerId,
      modelId,
      messages: content,
      ...options,
    } satisfies TokenizerInput;
  }

  return {
    providerId,
    modelId,
    text: typeof content === "string" ? content : "",
    ...options,
  } satisfies TokenizerInput;
}

function isLegacyParams(
  value: CountTokensParams,
): value is Extract<CountTokensParams, { options?: unknown }> {
  return (
    typeof value === "object" &&
    value !== null &&
    "providerId" in value &&
    "modelId" in value &&
    "options" in value
  );
}

function warnUnknown(input: TokenizerResolvedInput) {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production")
    return;
  const tokenizerFromModel =
    input.model?.extras && typeof input.model.extras === "object"
      ? (input.model.extras as { architecture?: { tokenizer?: string } })
          .architecture?.tokenizer
      : undefined;
  console.warn(
    [
      "Tokenlens tokenizer: missing tokenizer mapping",
      `provider=${input.providerId}`,
      `model=${input.modelId}`,
      input.tokenizerId ? `tokenizer=${input.tokenizerId}` : undefined,
      tokenizerFromModel ? `model-tokenizer=${tokenizerFromModel}` : undefined,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function finalizeResult(result: TokenizerResult): TokenizerResult {
  if (result.count === undefined) {
    return { ...result, count: result.total };
  }
  if (result.count !== result.total) {
    return { ...result, total: result.count };
  }
  return result;
}
