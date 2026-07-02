import { describe, expect, it } from "vitest";

describe("source subpath exports", () => {
  it("exposes core, fetch, helpers, and tokenizer entry points", async () => {
    const [core, fetch, helpers, tokenizer] = await Promise.all([
      import("../src/exports/core.js"),
      import("../src/exports/fetch.js"),
      import("../src/exports/helpers.js"),
      import("../src/exports/tokenizer.js"),
    ]);

    expect(core.TokenlensError).toBeDefined();
    expect(fetch.fetchCatalogSource).toBeDefined();
    expect(helpers.computeTokenCostsForModel).toBeDefined();
    expect(tokenizer.countTokens).toBeDefined();
  });
});
