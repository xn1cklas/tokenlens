import { describe, it, expect } from "vitest";
import { calculateAnthropicImageTokens } from "../src/tokenizers/anthropic-image.js";

describe("Anthropic Image Token Calculation", () => {
  describe("Documentation examples", () => {
    it("should calculate tokens for 200×200 px image (~54 tokens)", () => {
      // 200 × 200 = 40,000 pixels
      // 40,000 / 750 = 53.33... → ceil = 54
      const tokens = calculateAnthropicImageTokens(200, 200);
      expect(tokens).toBe(54);
    });

    it("should calculate tokens for 1000×1000 px image (~1,334 tokens)", () => {
      // 1000 × 1000 = 1,000,000 pixels
      // 1,000,000 / 750 = 1333.33... → ceil = 1334
      const tokens = calculateAnthropicImageTokens(1000, 1000);
      expect(tokens).toBe(1334);
    });

    it("should calculate tokens for 1092×1092 px image (~1,590 tokens)", () => {
      // 1092 × 1092 = 1,192,464 pixels
      // 1,192,464 / 750 = 1589.95... → ceil = 1590
      const tokens = calculateAnthropicImageTokens(1092, 1092);
      expect(tokens).toBe(1590);
    });
  });

  describe("Scaling for oversized images", () => {
    it("should scale down images with long edge > 1568 pixels", () => {
      // 2000×1000 → long edge is 2000 (> 1568)
      // Scale: 1568 / 2000 = 0.784
      // New dimensions: 1568×784
      // Tokens: (1568 × 784) / 750 = 1,639.25... → ceil = 1640
      const tokens = calculateAnthropicImageTokens(2000, 1000);
      expect(tokens).toBe(1640);
    });

    it("should scale down square images with edge > 1568 pixels", () => {
      // 2000×2000 → long edge is 2000 (> 1568)
      // Scale: 1568 / 2000 = 0.784
      // New dimensions: 1568×1568
      // Tokens: (1568 × 1568) / 750 = 3,278.63... → ceil = 3279
      const tokens = calculateAnthropicImageTokens(2000, 2000);
      expect(tokens).toBe(3279);
    });

    it("should scale down portrait images with height > 1568 pixels", () => {
      // 1000×2000 → long edge is 2000 (> 1568)
      // Scale: 1568 / 2000 = 0.784
      // New dimensions: 784×1568
      // Tokens: (784 × 1568) / 750 = 1,639.25... → ceil = 1640
      const tokens = calculateAnthropicImageTokens(1000, 2000);
      expect(tokens).toBe(1640);
    });

    it("should not scale images at exactly 1568 pixels", () => {
      // 1568×1000 → long edge is exactly 1568 (not > 1568)
      // No scaling needed
      // Tokens: (1568 × 1000) / 750 = 2,090.67... → ceil = 2091
      const tokens = calculateAnthropicImageTokens(1568, 1000);
      expect(tokens).toBe(2091);
    });

    it("should handle very large images", () => {
      // 4000×3000 → long edge is 4000 (> 1568)
      // Scale: 1568 / 4000 = 0.392
      // New dimensions: floor(1568) × floor(1176) = 1568×1176
      // Tokens: (1568 × 1176) / 750 = 2,458.624 → ceil = 2459
      const tokens = calculateAnthropicImageTokens(4000, 3000);
      expect(tokens).toBe(2459);
    });
  });

  describe("Edge cases", () => {
    it("should handle very small images", () => {
      // 10×10 = 100 pixels
      // 100 / 750 = 0.133... → ceil = 1
      const tokens = calculateAnthropicImageTokens(10, 10);
      expect(tokens).toBe(1);
    });

    it("should handle minimum viable image (1×1)", () => {
      // 1×1 = 1 pixel
      // 1 / 750 = 0.00133... → ceil = 1
      const tokens = calculateAnthropicImageTokens(1, 1);
      expect(tokens).toBe(1);
    });

    it("should handle non-square aspect ratios", () => {
      // 1920×1080 (16:9 aspect ratio, long edge > 1568)
      // Scale: 1568 / 1920 = 0.8167
      // New dimensions: 1568×882
      // Tokens: (1568 × 882) / 750 = 1,843.97 → ceil = 1844
      const tokens = calculateAnthropicImageTokens(1920, 1080);
      expect(tokens).toBe(1844);
    });

    it("should handle ultra-wide images", () => {
      // 2560×1080 (21:9 aspect ratio, long edge > 1568)
      // Scale: 1568 / 2560 = 0.6125
      // New dimensions: floor(1568) × floor(661.5) = 1568×661
      // Tokens: (1568 × 661) / 750 = 1,381.93 → ceil = 1382
      const tokens = calculateAnthropicImageTokens(2560, 1080);
      expect(tokens).toBe(1382);
    });

    it("should handle portrait orientation", () => {
      // 1080×1920 (9:16 aspect ratio, long edge > 1568)
      // Scale: 1568 / 1920 = 0.8167
      // New dimensions: 882×1568
      // Tokens: (882 × 1568) / 750 = 1,843.97 → ceil = 1844
      const tokens = calculateAnthropicImageTokens(1080, 1920);
      expect(tokens).toBe(1844);
    });
  });

  describe("Formula accuracy", () => {
    it("should use exact formula: (width × height) / 750", () => {
      const width = 500;
      const height = 600;
      const expectedTokens = Math.ceil((width * height) / 750);

      const tokens = calculateAnthropicImageTokens(width, height);
      expect(tokens).toBe(expectedTokens);
    });

    it("should always round up (ceiling)", () => {
      // 100×100 = 10,000 pixels
      // 10,000 / 750 = 13.333... → should round up to 14
      const tokens = calculateAnthropicImageTokens(100, 100);
      expect(tokens).toBe(14);
      expect(tokens).not.toBe(13);
    });
  });

  describe("Optimal performance recommendations", () => {
    it("should handle recommended max size (1.15 megapixels)", () => {
      // ~1072×1072 ≈ 1.15 megapixels
      // 1072 × 1072 = 1,149,184 pixels
      // 1,149,184 / 750 = 1,532.25... → ceil = 1533
      const tokens = calculateAnthropicImageTokens(1072, 1072);
      expect(tokens).toBe(1533);
    });

    it("should verify token count increases with image size", () => {
      const tokens200 = calculateAnthropicImageTokens(200, 200);
      const tokens500 = calculateAnthropicImageTokens(500, 500);
      const tokens1000 = calculateAnthropicImageTokens(1000, 1000);

      expect(tokens500).toBeGreaterThan(tokens200);
      expect(tokens1000).toBeGreaterThan(tokens500);
    });
  });
});
