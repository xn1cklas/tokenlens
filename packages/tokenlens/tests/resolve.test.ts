import type { SourceProviders } from "@tokenlens/core";
import { describe, expect, it } from "vitest";
import { resolveModel } from "../src/resolve.js";

const catalog: SourceProviders = {
  openai: {
    id: "openai",
    aliases: ["openai.responses"],
    models: {
      "openai/gpt-4o": {
        id: "openai/gpt-4o",
        canonical_id: "openai/gpt-4o",
        name: "GPT-4o",
      },
      "openai/gpt-oss-120b:nitro": {
        id: "openai/gpt-oss-120b:nitro",
        canonical_id: "openai/gpt-oss-120b:nitro",
        name: "GPT OSS 120B Nitro",
      },
    },
  },
  "x-ai": {
    id: "x-ai",
    aliases: ["xai", "xai.chat"],
    models: {
      "x-ai/grok-4": {
        id: "x-ai/grok-4",
        canonical_id: "x-ai/grok-4",
        name: "Grok 4",
      },
    },
  },
  custom: {
    id: "custom",
    models: {
      bare: {
        id: "custom/bare",
        canonical_id: "custom/bare",
        name: "Bare",
      },
    },
  },
  "custom.ns": {
    id: "custom.ns",
    models: {
      "custom.ns/model": {
        id: "custom.ns/model",
        canonical_id: "custom.ns/model",
        name: "Custom Namespaced Model",
      },
    },
  },
  requesty: {
    id: "requesty",
    models: {
      "xai/grok-5": {
        id: "xai/grok-5",
        canonical_id: "xai/grok-5",
        name: "Grok 5 via Requesty",
      },
    },
  },
  "provider-key": {
    id: "provider-id",
    models: {
      "provider-id/model": {
        id: "provider-id/model",
        canonical_id: "provider-id/model",
        name: "Provider ID Model",
      },
    },
  },
  anthropic: {
    id: "anthropic",
    aliases: ["anthropic.messages"],
    models: {
      "anthropic/claude-3-5-sonnet-20241022": {
        id: "anthropic/claude-3-5-sonnet-20241022",
        canonical_id: "anthropic/claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
      },
    },
  },
};

describe("resolveModel", () => {
  it("normalizes provider namespaces embedded in model IDs", () => {
    const resolved = resolveModel({
      catalog,
      modelId: "openai.responses/gpt-4o",
    });

    expect(resolved.providerId).toBe("openai");
    expect(resolved.modelId).toBe("openai/gpt-4o");
    expect(resolved.model?.name).toBe("GPT-4o");
  });

  it("normalizes provider namespaces from the provider argument", () => {
    const resolved = resolveModel({
      catalog,
      providerId: "openai.responses",
      modelId: "gpt-4o",
    });

    expect(resolved.providerId).toBe("openai");
    expect(resolved.modelId).toBe("openai/gpt-4o");
    expect(resolved.model?.name).toBe("GPT-4o");
  });

  it("resolves xai aliases against x-ai provider catalogs", () => {
    const resolved = resolveModel({
      catalog,
      providerId: "xai",
      modelId: "grok-4",
    });

    expect(resolved.providerId).toBe("x-ai");
    expect(resolved.modelId).toBe("x-ai/grok-4");
    expect(resolved.model?.name).toBe("Grok 4");
  });

  it("resolves AI SDK xAI chat provider aliases", () => {
    const resolved = resolveModel({
      catalog,
      providerId: "xai.chat",
      modelId: "grok-4",
    });

    expect(resolved.providerId).toBe("x-ai");
    expect(resolved.modelId).toBe("x-ai/grok-4");
    expect(resolved.model?.name).toBe("Grok 4");
  });

  it("accepts legacy colon-form model IDs", () => {
    const resolved = resolveModel({
      catalog,
      modelId: "openai:gpt-4o",
    });

    expect(resolved.providerId).toBe("openai");
    expect(resolved.modelId).toBe("openai/gpt-4o");
    expect(resolved.model?.name).toBe("GPT-4o");
  });

  it("preserves colon-bearing bare model IDs when provider is explicit", () => {
    const resolved = resolveModel({
      catalog,
      providerId: "openai",
      modelId: "gpt-oss-120b:nitro",
    });

    expect(resolved.providerId).toBe("openai");
    expect(resolved.modelId).toBe("openai/gpt-oss-120b:nitro");
    expect(resolved.model?.name).toBe("GPT OSS 120B Nitro");
  });

  it("normalizes provider-specific model id syntax before lookup", () => {
    const resolved = resolveModel({
      catalog,
      modelId: "anthropic/claude-3.5-sonnet-20241022",
    });

    expect(resolved.providerId).toBe("anthropic");
    expect(resolved.modelId).toBe("anthropic/claude-3-5-sonnet-20241022");
    expect(resolved.model?.name).toBe("Claude 3.5 Sonnet");
  });

  it("normalizes Anthropic model syntax after resolving provider aliases", () => {
    const resolved = resolveModel({
      catalog,
      providerId: "anthropic.messages",
      modelId: "claude-3.5-sonnet-20241022",
    });

    expect(resolved.providerId).toBe("anthropic");
    expect(resolved.modelId).toBe("anthropic/claude-3-5-sonnet-20241022");
    expect(resolved.model?.name).toBe("Claude 3.5 Sonnet");
  });

  it("normalizes Anthropic model syntax for namespaced provider aliases", () => {
    const resolved = resolveModel({
      catalog,
      modelId: "anthropic.messages/claude-3.5-sonnet-20241022",
    });

    expect(resolved.providerId).toBe("anthropic");
    expect(resolved.modelId).toBe("anthropic/claude-3-5-sonnet-20241022");
    expect(resolved.model?.name).toBe("Claude 3.5 Sonnet");
  });

  it("searches aggregator catalogs when a slash-prefixed model id is not a provider key", () => {
    const resolved = resolveModel({
      catalog,
      modelId: "xai/grok-5",
    });

    expect(resolved.providerId).toBe("requesty");
    expect(resolved.modelId).toBe("xai/grok-5");
    expect(resolved.model?.name).toBe("Grok 5 via Requesty");
  });

  it("scopes bare model lookups with provider ids when provider keys differ", () => {
    const resolved = resolveModel({
      catalog,
      providerId: "provider-id",
      modelId: "model",
    });

    expect(resolved.providerId).toBe("provider-key");
    expect(resolved.modelId).toBe("provider-id/model");
    expect(resolved.model?.name).toBe("Provider ID Model");
  });

  it("does not search unrelated providers when an explicit provider is supplied", () => {
    const resolved = resolveModel({
      catalog,
      providerId: "missing-provider",
      modelId: "xai/grok-5",
    });

    expect(resolved.providerId).toBe("missing-provider");
    expect(resolved.model).toBeUndefined();
  });

  it("falls back to bare model keys for custom catalogs", () => {
    const resolved = resolveModel({
      catalog,
      providerId: "custom",
      modelId: "bare",
    });

    expect(resolved.providerId).toBe("custom");
    expect(resolved.modelId).toBe("custom/bare");
    expect(resolved.model?.name).toBe("Bare");
  });

  it("falls back to raw namespaced providers for custom catalogs", () => {
    const resolved = resolveModel({
      catalog,
      modelId: "custom.ns/model",
    });

    expect(resolved.providerId).toBe("custom.ns");
    expect(resolved.modelId).toBe("custom.ns/model");
    expect(resolved.model?.name).toBe("Custom Namespaced Model");
  });

  it("does not split unknown dotted providers into unrelated catalog keys", () => {
    const resolved = resolveModel({
      catalog,
      modelId: "custom.ns.extra/model",
    });

    expect(resolved.providerId).toBe("custom.ns.extra");
    expect(resolved.model).toBeUndefined();
  });
});
