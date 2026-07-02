import { describe, expect, it } from "vitest";

import { assertSourceProviders } from "../src/dto.js";
import { TokenlensError } from "../src/error.js";

describe("assertSourceProviders", () => {
  it("accepts well-formed catalogs", () => {
    expect(() =>
      assertSourceProviders({
        openai: {
          id: "openai",
          aliases: ["openai.responses"],
          name: "OpenAI",
          api: "https://api.openai.com/v1",
          doc: "https://platform.openai.com/docs",
          npm: "@ai-sdk/openai",
          env: ["OPENAI_API_KEY"],
          source: "package",
          schemaVersion: 1,
          extras: { owner: "openai" },
          models: {
            "openai/gpt-4o": {
              id: "openai/gpt-4o",
              canonical_id: "openai/gpt-4o",
              name: "GPT-4o",
              created: 1_714_435_200,
              release_date: "2024-05-13",
              last_updated: "2024-05-13",
              cost: { input: 1, output: 2 },
              limit: { context: 128_000 },
              extras: { family: "gpt-4o" },
            },
          },
        },
      }),
    ).not.toThrow();
  });

  it.each([
    [
      "provider aliases",
      { openai: { id: "openai", aliases: [42], models: {} } },
      { field: "aliases[0]", providerId: "openai" },
    ],
    [
      "provider env",
      { openai: { id: "openai", env: "OPENAI_API_KEY", models: {} } },
      { field: "env", providerId: "openai" },
    ],
    [
      "provider source",
      { openai: { id: "openai", source: "unknown", models: {} } },
      { field: "source", providerId: "openai" },
    ],
    [
      "provider schema version",
      { openai: { id: "openai", schemaVersion: 0, models: {} } },
      { field: "schemaVersion", providerId: "openai" },
    ],
    [
      "model created",
      {
        openai: {
          id: "openai",
          models: {
            "openai/gpt-4o": {
              id: "openai/gpt-4o",
              canonical_id: "openai/gpt-4o",
              name: "GPT-4o",
              created: "2024-05-13",
            },
          },
        },
      },
      {
        field: "created",
        providerId: "openai",
        modelId: "openai/gpt-4o",
      },
    ],
    [
      "model extras",
      {
        openai: {
          id: "openai",
          models: {
            "openai/gpt-4o": {
              id: "openai/gpt-4o",
              canonical_id: "openai/gpt-4o",
              name: "GPT-4o",
              extras: [],
            },
          },
        },
      },
      {
        field: "extras",
        providerId: "openai",
        modelId: "openai/gpt-4o",
      },
    ],
  ])("rejects malformed optional %s fields", (_name, catalog, meta) => {
    expect(() => assertSourceProviders(catalog, "private-registry")).toThrow(
      TokenlensError.InvalidCatalog,
    );

    try {
      assertSourceProviders(catalog, "private-registry");
    } catch (error) {
      expect(error).toMatchObject({
        code: TokenlensError.InvalidCatalog.code,
        meta: {
          catalogId: "private-registry",
          reason: "INVALID_FIELD",
          ...meta,
        },
      });
    }
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
