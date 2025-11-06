/**
 * Anthropic (Claude) image token calculation
 * Based on: https://docs.claude.com/en/docs/build-with-claude/vision#image-costs
 *
 * Formula: tokens = (width × height) / 750
 * Images over 1,568 pixels on the long edge will be scaled down proportionally.
 */

/**
 * Calculate Anthropic image tokens
 *
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @returns Token count for the image
 *
 * @example
 * ```ts
 * calculateAnthropicImageTokens(200, 200);   // ~54 tokens
 * calculateAnthropicImageTokens(1000, 1000); // ~1,334 tokens
 * calculateAnthropicImageTokens(1092, 1092); // ~1,590 tokens
 * ```
 */
export function calculateAnthropicImageTokens(
  width: number,
  height: number,
): number {
  const MAX_LONG_EDGE = 1568;

  // Scale down if the long edge exceeds the maximum
  const longEdge = Math.max(width, height);
  if (longEdge > MAX_LONG_EDGE) {
    const scale = MAX_LONG_EDGE / longEdge;
    width = Math.floor(width * scale);
    height = Math.floor(height * scale);
  }

  // Apply formula: tokens = (width × height) / 750
  // Round up to nearest integer
  return Math.ceil((width * height) / 750);
}
