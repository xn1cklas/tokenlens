import { describe, expect, expectTypeOf, it } from "vitest";
import type {
  ModelsDevApi,
  ModelsDevModel,
  ModelsDevProvider,
} from "../src/index.ts";
import { fetchModels } from "../src/index.ts";

describe("fetchModels integration (live models.dev)", () => {
  it("fetches catalog and preserves types", async () => {
    const catalog = (await fetchModels()) as ModelsDevApi;
    expectTypeOf(catalog).toMatchTypeOf<ModelsDevApi>();
    expect(typeof catalog).toBe("object");
    expect(catalog).not.toBeNull();

    const providerKeys = Object.keys(catalog);
    expect(providerKeys.length).toBeGreaterThan(0);

    const providerKey = providerKeys[0] as string;
    const providerObj = catalog[providerKey] as ModelsDevProvider;
    expectTypeOf(providerObj).toMatchTypeOf<ModelsDevProvider>();
    expect(providerObj.id).toBeTypeOf("string");
    expect(typeof providerObj.models).toBe("object");

    const modelKeys = Object.keys(providerObj.models ?? {});
    // A provider should typically have at least one model
    expect(modelKeys.length).toBeGreaterThan(0);

    const modelKey = modelKeys[0] as string;
    const modelObj = providerObj.models[modelKey] as ModelsDevModel;
    expectTypeOf(modelObj).toMatchTypeOf<ModelsDevModel>();
    expect(modelObj.id).toBeTypeOf("string");

    // Verify provider filter
    const fetchedProvider = await fetchModels({ provider: providerKey });
    expectTypeOf(fetchedProvider).toMatchTypeOf<
      ModelsDevProvider | undefined
    >();
    expect(fetchedProvider?.id).toBeTypeOf("string");

    // Verify provider+model filter
    const fetchedModel = await fetchModels({
      provider: providerKey,
      model: modelKey,
    });
    expectTypeOf(fetchedModel).toMatchTypeOf<ModelsDevModel | undefined>();
    expect(fetchedModel?.id).toBe(modelKey);

    // Verify model-only search returns an array of matches
    const matches = await fetchModels({ model: modelKey });
    expect(Array.isArray(matches)).toBe(true);
    expect(matches.length).toBeGreaterThan(0);
    expect(
      (matches as Array<{ model: ModelsDevModel }>)[0]?.model.id,
    ).toBeTypeOf("string");
  });
});
