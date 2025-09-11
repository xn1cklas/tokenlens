import type { Model, ModelCatalog } from "@tokenlens/core";
import {
  catalogFromModelArrays,
  catalogFromProviders,
} from "@tokenlens/models/api";
import { describe, expect, it } from "vitest";

describe("catalog builders", () => {
  it("catalogFromModelArrays maps Model[] into ModelCatalog", () => {
    const arr: Model[] = [
      {
        id: "provA:model1",
        provider: "provA",
        status: "stable",
        context: { combinedMax: 1000, outputMax: 200 },
        pricing: { inputPerMTokens: 1, outputPerMTokens: 2 },
        modalities: { textIn: true, textOut: true },
        displayName: "Model One",
        source: "test",
      },
    ];
    const catalog: ModelCatalog = catalogFromModelArrays([arr]);
    expect(catalog.provA).toBeTruthy();
    expect(catalog.provA.models["model1"]).toBeTruthy();
    expect(catalog.provA.models["model1"].id).toBe("model1");
    expect(catalog.provA.models["model1"].name).toBe("Model One");
    expect(catalog.provA.models["model1"].limit?.context).toBe(1000);
    expect(catalog.provA.models["model1"].limit?.output).toBe(200);
    expect(catalog.provA.models["model1"].cost?.input).toBe(1);
    expect(catalog.provA.models["model1"].cost?.output).toBe(2);
    expect(
      catalog.provA.models["model1"].modalities?.input?.includes("text"),
    ).toBe(true);
    expect(
      catalog.provA.models["model1"].modalities?.output?.includes("text"),
    ).toBe(true);
  });

  it("catalogFromProviders collates ProviderInfo entries", () => {
    const prov = {
      id: "px",
      models: {
        foo: { id: "foo", name: "Foo" },
      },
    } as const;
    const cat = catalogFromProviders([prov]);
    expect(cat.px).toBeTruthy();
    expect(cat.px.models.foo.name).toBe("Foo");
  });
});
