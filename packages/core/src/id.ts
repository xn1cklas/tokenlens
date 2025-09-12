/**
 * Convert gateway-style ids (e.g. "provider/model") into canonical
 * TokenLens ids ("provider:model"). If already canonical, returns input.
 */
export function toModelId(gatewayId?: string): string | undefined {
  if (!gatewayId) return undefined;
  const id = gatewayId.trim();
  if (!id) return undefined;

  const i = id.indexOf("/");
  if (i <= 0) return id; // no provider separator or leading '/'

  const provider = id.slice(0, i);
  let model = id.slice(i + 1);

  // Provider-specific normalization
  if (provider.toLowerCase() === "anthropic") {
    // Vercel AI Gateway uses dots in Anthropic version segment (e.g., 3.5)
    // TokenLens canonical uses hyphenated versions (e.g., 3-5)
    model = model.replace(/(\d+)\.(\d+)/g, "$1-$2");
  }

  return `${provider}:${model}`;
}
