import { describe, expect, it } from "vitest";

import { assertSourceProviders } from "../src/dto.js";
import { TokenlensError } from "../src/error.js";

describe("assertSourceProviders", () => {
  it("accepts well-formed catalogs", () => {
    expect(() =>
      assertSourceProviders({
        openai: {
          id: "openai",
          models: {
            "openai/gpt-4o": {
              id: "openai/gpt-4o",
              canonical_id: "openai/gpt-4o",
              name: "GPT-4o",
              cost: { input: 1, output: 2 },
              limit: { context: 128_000 },
            },
          },
        },
      }),
    ).not.toThrow();
  });

  it("rejects malformed catalogs with field metadata", () => {
    expect(() =>
      assertSourceProviders(
        {
          openai: {
            id: "openai",
            models: {
              "openai/gpt-4o": {
                id: "openai/gpt-4o",
                canonical_id: "openai/gpt-4o",
                cost: { input: 1 },
              },
            },
          },
        },
        "private-registry",
      ),
    ).toThrow(TokenlensError.InvalidCatalog);

    try {
      assertSourceProviders(
        {
          openai: {
            id: "openai",
            models: {
              "openai/gpt-4o": {
                id: "openai/gpt-4o",
                canonical_id: "openai/gpt-4o",
                cost: { input: 1 },
              },
            },
          },
        },
        "private-registry",
      );
    } catch (error) {
      expect(error).toMatchObject({
        code: TokenlensError.InvalidCatalog.code,
        meta: {
          catalogId: "private-registry",
          reason: "INVALID_FIELD",
          field: "name",
          providerId: "openai",
          modelId: "openai/gpt-4o",
        },
      });
    }
  });
});
