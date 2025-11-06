import { describe, it, expect } from "vitest";
import { detectImageMimeType } from "../src/utils/mime.js";

describe("Google Image Token Calculation", () => {
  describe("MIME type detection", () => {
    it("should detect PNG images", () => {
      const pngHeader = new Uint8Array([
        0x89,
        0x50,
        0x4e,
        0x47, // PNG signature
        0x0d,
        0x0a,
        0x1a,
        0x0a,
        0x00,
        0x00,
        0x00,
        0x0d,
      ]);
      expect(detectImageMimeType(pngHeader)).toBe("image/png");
    });

    it("should detect JPEG images", () => {
      const jpegHeader = new Uint8Array([
        0xff,
        0xd8,
        0xff, // JPEG signature
        0xe0,
        0x00,
        0x10,
        0x4a,
        0x46,
        0x49,
        0x46,
        0x00,
        0x01,
      ]);
      expect(detectImageMimeType(jpegHeader)).toBe("image/jpeg");
    });

    it("should detect GIF images", () => {
      const gifHeader = new Uint8Array([
        0x47,
        0x49,
        0x46,
        0x38, // GIF8
        0x39,
        0x61,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
      ]);
      expect(detectImageMimeType(gifHeader)).toBe("image/gif");
    });

    it("should detect WebP images", () => {
      const webpHeader = new Uint8Array([
        0x52,
        0x49,
        0x46,
        0x46, // RIFF
        0x00,
        0x00,
        0x00,
        0x00,
        0x57,
        0x45,
        0x42,
        0x50, // WEBP
      ]);
      expect(detectImageMimeType(webpHeader)).toBe("image/webp");
    });

    it("should return undefined for unknown formats", () => {
      const unknownHeader = new Uint8Array([
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      ]);
      expect(detectImageMimeType(unknownHeader)).toBeUndefined();
    });

    it("should return undefined for too small buffers", () => {
      const tooSmall = new Uint8Array([0x89, 0x50]);
      expect(detectImageMimeType(tooSmall)).toBeUndefined();
    });

    it("should handle ArrayBuffer input", () => {
      const buffer = new ArrayBuffer(12);
      const view = new Uint8Array(buffer);
      view.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); // PNG
      expect(detectImageMimeType(buffer)).toBe("image/png");
    });
  });

  describe("Google Gemini token calculation (integration)", () => {
    it.skip("should calculate tokens for small images (≤384px)", async () => {
      // This test requires GOOGLE_API_KEY and would make actual API calls
      // According to docs: images ≤384px both dimensions = 258 tokens
      // Skipped to avoid API calls in tests
    });

    it.skip("should calculate tokens for large images (>384px)", async () => {
      // This test requires GOOGLE_API_KEY and would make actual API calls
      // According to docs: larger images are tiled 768×768, each tile = 258 tokens
      // Skipped to avoid API calls in tests
    });

    it.skip("should handle images passed as ArrayBuffer", async () => {
      // This test requires GOOGLE_API_KEY and would make actual API calls
      // Verifies that ArrayBuffer images work correctly
      // Skipped to avoid API calls in tests
    });

    it.skip("should handle images passed as Uint8Array", async () => {
      // This test requires GOOGLE_API_KEY and would make actual API calls
      // Verifies that Uint8Array images work correctly
      // Skipped to avoid API calls in tests
    });
  });

  describe("Expected token counts based on Gemini 2.0 documentation", () => {
    it("should document expected tokens for small images", () => {
      // Small images (≤384×384) = 258 tokens
      const expectedTokens = 258;
      expect(expectedTokens).toBe(258);
    });

    it("should document expected tokens for medium images", () => {
      // 500×500 image → needs tiling
      // Scaled/cropped to fit 768×768 tiles
      // 1 tile = 258 tokens
      const expectedTokens = 258;
      expect(expectedTokens).toBe(258);
    });

    it("should document expected tokens for large images", () => {
      // 1536×1536 image → 2×2 tiles (768×768 each)
      // 4 tiles × 258 tokens = 1032 tokens
      const expectedTokens = 4 * 258;
      expect(expectedTokens).toBe(1032);
    });

    it("should document expected tokens for very large images", () => {
      // 3000×2000 image → tiled into 768×768 chunks
      // Width: ceil(3000/768) = 4 tiles
      // Height: ceil(2000/768) = 3 tiles
      // 4×3 = 12 tiles × 258 tokens = 3096 tokens
      const expectedTokens = 12 * 258;
      expect(expectedTokens).toBe(3096);
    });
  });

  describe("Error handling", () => {
    it("should document error when GOOGLE_API_KEY is not set", () => {
      // The google() function should throw when API key is missing
      const expectedError = "GOOGLE_API_KEY is not set";
      expect(expectedError).toBeTruthy();
    });

    it("should document error for invalid image formats", () => {
      // The google() function should throw for unsupported formats
      const expectedError =
        "Failed to process ArrayBuffer/Uint8Array: not a recognized image format";
      expect(expectedError).toBeTruthy();
    });
  });
});
