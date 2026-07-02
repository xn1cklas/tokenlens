/**
 * Convert provider-scoped ids into canonical Tokenlens v2 ids ("provider/model").
 * Legacy v1 ids ("provider:model") are accepted and normalized to slash form.
 */
export function toModelId(gatewayId?: string): string | undefined {
  if (!gatewayId) return undefined;
  const id = gatewayId.trim();
  if (!id) return undefined;

  const slashIndex = id.indexOf("/");
  const colonIndex = id.indexOf(":");
  const separatorIndex =
    slashIndex > 0 ? slashIndex : colonIndex > 0 ? colonIndex : -1;
  if (separatorIndex <= 0) return id; // no provider separator or leading separator

  const provider = id.slice(0, separatorIndex);
  let model = id.slice(separatorIndex + 1);

  // Provider-specific normalization
  if (provider.toLowerCase() === "anthropic") {
    // Vercel AI Gateway uses dots in Anthropic version segment (e.g., 3.5)
    // TokenLens canonical uses hyphenated versions (e.g., 3-5)
    model = model.replace(/(\d+)\.(\d+)/g, "$1-$2");
  }

  return `${provider}/${model}`;
}
