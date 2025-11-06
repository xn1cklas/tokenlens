import { describe, it, expect } from "vitest";
import { calculateImageTokens } from "../src/tokenizers/openai-image.js";

describe("OpenAI Image Token Calculation", () => {
  describe("Patch-based models", () => {
    it("should calculate tokens for gpt-5-mini with 1024×1024 image", () => {
      // 1024×1024 → 32×32 patches = 1024 patches
      // 1024 × 1.62 = 1658.88 → ceil = 1659
      const tokens = calculateImageTokens("gpt-5-mini", 1024, 1024);
      expect(tokens).toBe(1659);
    });

    it("should calculate tokens for gpt-5-mini with 1800×2400 image", () => {
      // 1800×2400 → raw patches = 4275 (>1536)
      // Scaling: r = √(32² × 1536 / (1800 × 2400)) ≈ 0.606
      // After rescaling: ~1610 patches (with rounding)
      // 1610 × 1.62 ≈ 2608 tokens
      const tokens = calculateImageTokens("gpt-5-mini", 1800, 2400);
      expect(tokens).toBeGreaterThanOrEqual(2500);
      expect(tokens).toBeLessThanOrEqual(2700);
    });

    it("should calculate tokens for gpt-5-nano with multiplier 2.46", () => {
      // 1024×1024 → 1024 patches
      // 1024 × 2.46 = 2519.04 → ceil = 2520
      const tokens = calculateImageTokens("gpt-5-nano", 1024, 1024);
      expect(tokens).toBe(2520);
    });

    it("should calculate tokens for o4-mini with multiplier 1.72", () => {
      // 1024×1024 → 1024 patches
      // 1024 × 1.72 = 1761.28 → ceil = 1762
      const tokens = calculateImageTokens("o4-mini", 1024, 1024);
      expect(tokens).toBe(1762);
    });

    it("should handle large images that need rescaling", () => {
      // 4096×4096 → raw patches = 16384 (>>1536)
      // Should rescale significantly
      const tokens = calculateImageTokens("gpt-5-mini", 4096, 4096);
      // After rescaling, expect around 1600 patches × 1.62 ≈ 2592
      expect(tokens).toBeGreaterThanOrEqual(2500);
      expect(tokens).toBeLessThanOrEqual(2700);
    });
  });

  describe("Tile-based models - high detail", () => {
    it("should calculate tokens for gpt-4o with 1024×1024 image", () => {
      // Resize to 768×768 → 2×2 tiles = 4 tiles
      // 85 + 4×170 = 765
      const tokens = calculateImageTokens("gpt-4o", 1024, 1024, "high");
      expect(tokens).toBe(765);
    });

    it("should calculate tokens for gpt-4o with 2048×4096 image", () => {
      // Resize to 768×1536 → 2×3 tiles = 6 tiles
      // 85 + 6×170 = 1105
      const tokens = calculateImageTokens("gpt-4o", 2048, 4096, "high");
      expect(tokens).toBe(1105);
    });

    it("should calculate tokens for gpt-5 (chat) with 1024×1024 image", () => {
      // Resize to 768×768 → 2×2 tiles = 4 tiles
      // 70 + 4×140 = 630
      const tokens = calculateImageTokens("gpt-5", 1024, 1024, "high");
      expect(tokens).toBe(630);
    });

    it("should calculate tokens for o1 with 1024×1024 image", () => {
      // Resize to 768×768 → 2×2 tiles = 4 tiles
      // 75 + 4×150 = 675
      const tokens = calculateImageTokens("o1", 1024, 1024, "high");
      expect(tokens).toBe(675);
    });

    it("should calculate tokens for 4o-mini with 1024×1024 image", () => {
      // Resize to 768×768 → 2×2 tiles = 4 tiles
      // 2833 + 4×5667 = 25501
      const tokens = calculateImageTokens("gpt-4o-mini", 1024, 1024, "high");
      expect(tokens).toBe(25501);
    });
  });

  describe("Tile-based models - low detail", () => {
    it("should return base tokens for gpt-4o low detail", () => {
      // Low detail = fixed base tokens
      const tokens = calculateImageTokens("gpt-4o", 4096, 8192, "low");
      expect(tokens).toBe(85);
    });

    it("should return base tokens for gpt-5 low detail", () => {
      const tokens = calculateImageTokens("gpt-5", 4096, 8192, "low");
      expect(tokens).toBe(70);
    });

    it("should return base tokens for o1 low detail", () => {
      const tokens = calculateImageTokens("o1", 4096, 8192, "low");
      expect(tokens).toBe(75);
    });
  });

  describe("GPT Image 1 models", () => {
    it("should calculate tokens for square image with high fidelity", () => {
      // 1024×1024 square → resize to 512×512 → 1×1 tile
      // 65 + 129 + 4160 (square overhead) = 4354
      const tokens = calculateImageTokens("gpt-image-1", 1024, 1024, "high");
      expect(tokens).toBe(4354);
    });

    it("should calculate tokens for portrait image with high fidelity", () => {
      // Non-square → extra overhead = 6240
      // Resize to 512×1024 → 1×2 tiles
      // 65 + 2×129 + 6240 = 6563
      const tokens = calculateImageTokens("gpt-image-1", 512, 1024, "high");
      expect(tokens).toBe(6563);
    });

    it("should calculate tokens for landscape image with high fidelity", () => {
      // Non-square → extra overhead = 6240
      // Resize to 1024×512 → 2×1 tiles
      // 65 + 2×129 + 6240 = 6563
      const tokens = calculateImageTokens("gpt-image-1", 1024, 512, "high");
      expect(tokens).toBe(6563);
    });

    it("should return low fidelity tokens", () => {
      // Low fidelity = base + tile tokens
      const tokens = calculateImageTokens("gpt-image-1", 1024, 1024, "low");
      expect(tokens).toBe(194); // 65 + 129
    });
  });

  describe("Edge cases", () => {
    it("should handle small images", () => {
      const tokens = calculateImageTokens("gpt-4o", 100, 100, "high");
      expect(tokens).toBeGreaterThan(0);
    });

    it("should handle very large images", () => {
      const tokens = calculateImageTokens("gpt-4o", 8192, 8192, "high");
      expect(tokens).toBeGreaterThan(0);
    });

    it("should handle non-square aspect ratios", () => {
      const tokens = calculateImageTokens("gpt-4o", 1920, 1080, "high");
      expect(tokens).toBeGreaterThan(0);
    });

    it("should default to high detail when detail not specified", () => {
      const tokensExplicit = calculateImageTokens("gpt-4o", 1024, 1024, "high");
      const tokensDefault = calculateImageTokens("gpt-4o", 1024, 1024);
      expect(tokensDefault).toBe(tokensExplicit);
    });
  });

  describe("Model prefix matching", () => {
    it("should match models with version suffixes", () => {
      const tokens = calculateImageTokens("gpt-4o-2024-08-06", 1024, 1024);
      expect(tokens).toBe(765); // Same as gpt-4o
    });

    it("should match o1 variants", () => {
      const tokensO1 = calculateImageTokens("o1", 1024, 1024);
      const tokensO1Pro = calculateImageTokens("o1-pro", 1024, 1024);
      expect(tokensO1).toBe(tokensO1Pro);
    });
  });
});
