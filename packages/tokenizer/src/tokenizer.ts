import type {
  TokenizerDispatch,
  TokenizerInput,
  TokenizerResolvedInput,
  TokenizerResult,
} from "./types.js";
import { resolveText } from "./utils.js";

type TokenizerRegistry = {
  resolve(input: TokenizerResolvedInput): TokenizerDispatch | undefined;
  fallback: TokenizerDispatch;
};

let cachedRegistry: TokenizerRegistry | undefined;

export async function countTokens(
  input: TokenizerInput,
): Promise<TokenizerResult> {
  const text = resolveText(input);
  if (!text) {
    return { count: 0, estimated: true };
  }

  const resolved: TokenizerResolvedInput = {
    providerId: input.providerId,
    modelId: input.modelId,
    model: input.model,
    usage: input.usage,
    encodingOverride: input.encodingOverride,
    text,
  };
  const registry = await loadRegistry();
  const tokenizer = registry.resolve(resolved);
  if (!tokenizer) {
    warnUnknown(resolved);
    return registry.fallback.estimate(resolved);
  }

  return tokenizer.estimate(resolved);
}

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

type TokenizerProvider = {
  match(input: TokenizerResolvedInput): TokenizerDispatch | undefined;
};

async function loadTokenizerProviders(): Promise<TokenizerProvider[]> {
  const providers = await Promise.all([
    import("./tokenizers/openai.js").then((m) => m.openaiTokenizerProvider),
    import("./tokenizers/anthropic.js").then(
      (m) => m.anthropicTokenizerProvider,
    ),
  ]);
  return providers.filter(Boolean);
}

function warnUnknown(input: TokenizerResolvedInput) {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production")
    return;
  console.warn(
    [
      "Tokenlens experimental tokenizer: missing tokenizer mapping",
      `provider=${input.providerId}`,
      `model=${input.modelId}`,
      input.encodingOverride ? `encoding=${input.encodingOverride}` : undefined,
      input.model?.extras &&
      typeof input.model.extras === "object" &&
      (input.model.extras as { architecture?: { tokenizer?: string } })
        .architecture?.tokenizer
        ? `tokenizer=${(input.model?.extras as { architecture?: { tokenizer?: string } }).architecture?.tokenizer}`
        : undefined,
    ]
      .filter(Boolean)
      .join(" "),
  );
}
