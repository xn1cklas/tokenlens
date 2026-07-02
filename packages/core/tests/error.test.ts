import { describe, expect, it } from "vitest";

import { TokenlensError } from "../src/error.js";

describe("TokenlensError", () => {
  it("sets stable codes, names, messages, metadata, and causes", () => {
    const cause = new Error("root cause");
    const error = new TokenlensError.InvalidCatalog("custom", {
      cause,
      meta: { source: "test" },
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(TokenlensError.InvalidCatalog);
    expect(error.name).toBe("InvalidCatalogError");
    expect(error.code).toBe(TokenlensError.InvalidCatalog.code);
    expect(error.message).toBe("Unknown catalog ID: custom");
    expect(error.cause).toBe(cause);
    expect(error.meta).toEqual({ source: "test", catalogId: "custom" });
    expect(() => {
      (error.meta as Record<string, unknown>).catalogId = "other";
    }).toThrow(TypeError);
  });

  it("formats catalog, model, dependency, JSON, and environment errors", () => {
    expect(new TokenlensError.CatalogNotFound("package")).toMatchObject({
      code: "CATALOG_NOT_FOUND",
      message: 'Catalog "package" could not be found',
      meta: { catalogId: "package" },
    });
    expect(
      new TokenlensError.ModelNotFound("gpt-5", {
        providerId: "openai",
        catalogId: "openrouter",
      }),
    ).toMatchObject({
      code: "MODEL_NOT_FOUND",
      message:
        'Model "gpt-5" not found for provider "openai" in catalog "openrouter"',
      meta: {
        modelId: "gpt-5",
        providerId: "openai",
        catalogId: "openrouter",
      },
    });
    expect(new TokenlensError.UnknownModelId("future-model")).toMatchObject({
      code: "UNKNOWN_MODEL_ID",
      message: "Unknown model id: future-model",
      meta: { modelId: "future-model" },
    });
    expect(
      new TokenlensError.MissingDependency("@tokenlens/tokenizer"),
    ).toMatchObject({
      code: "MISSING_DEPENDENCY",
      message:
        'The package "@tokenlens/tokenizer" is required. Make sure it is installed.',
      meta: { packageName: "@tokenlens/tokenizer" },
    });
    expect(new TokenlensError.InvalidJson("Invalid payload")).toMatchObject({
      code: "INVALID_JSON",
      message: "Invalid payload",
    });
    expect(
      new TokenlensError.MissingEnvironmentVariable("OPENAI_API_KEY"),
    ).toMatchObject({
      code: "MISSING_ENVIRONMENT_VARIABLE",
      message: "OPENAI_API_KEY is not set",
      meta: { envVar: "OPENAI_API_KEY" },
    });
  });

  it("formats fetch errors with optional status and cause data", () => {
    const cause = new Error("network");
    const full = new TokenlensError.FetchFailed({
      target: "OpenRouter",
      status: 503,
      statusText: "Unavailable",
      cause,
      meta: { retryable: true },
    });
    const statusOnly = new TokenlensError.FetchFailed({
      target: "models.dev",
      status: 500,
    });
    const statusTextOnly = new TokenlensError.FetchFailed({
      target: "Vercel",
      statusText: "Gateway Timeout",
    });
    const bare = new TokenlensError.FetchFailed({ target: "package catalog" });

    expect(full).toMatchObject({
      code: "FETCH_FAILED",
      message: "Failed to fetch OpenRouter: 503 Unavailable",
      cause,
      meta: {
        target: "OpenRouter",
        status: 503,
        statusText: "Unavailable",
        retryable: true,
      },
    });
    expect(statusOnly.message).toBe("Failed to fetch models.dev: 500");
    expect(statusOnly.meta).toEqual({ target: "models.dev", status: 500 });
    expect(statusTextOnly.message).toBe(
      "Failed to fetch Vercel: Gateway Timeout",
    );
    expect(statusTextOnly.meta).toEqual({
      target: "Vercel",
      statusText: "Gateway Timeout",
    });
    expect(bare.message).toBe("Failed to fetch package catalog");
    expect(bare.meta).toEqual({ target: "package catalog" });
  });

  it("formats tokenizer-specific errors", () => {
    expect(
      new TokenlensError.UnsupportedTokenizerModel("o3", {
        supportedModels: ["gpt-4o", "gpt-5"],
      }),
    ).toMatchObject({
      code: "UNSUPPORTED_TOKENIZER_MODEL",
      message: "Unknown tokenizer model: o3. Supported models: gpt-4o, gpt-5",
      meta: {
        modelId: "o3",
        supportedModels: ["gpt-4o", "gpt-5"],
      },
    });
    expect(new TokenlensError.UnsupportedTokenizerModel("o3")).toMatchObject({
      code: "UNSUPPORTED_TOKENIZER_MODEL",
      message: "Unknown tokenizer model: o3",
      meta: { modelId: "o3" },
    });
    expect(
      new TokenlensError.TokenizerEncodingFailed("gpt-4o", "o200k_base", {
        cause: "boom",
      }),
    ).toMatchObject({
      code: "TOKENIZER_ENCODING_FAILED",
      message: "Failed to encode text with o200k_base",
      cause: "boom",
      meta: {
        modelId: "gpt-4o",
        encodingType: "o200k_base",
      },
    });
  });
});
