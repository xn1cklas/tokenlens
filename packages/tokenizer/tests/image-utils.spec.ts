import { describe, it, expect } from "vitest";
import { getImageDimensions } from "../src/utils/image.js";

describe("Image Dimension Extraction", () => {
  describe("PNG images", () => {
    it("should extract dimensions from PNG header", () => {
      // Create minimal PNG header for 1920×1080 image
      const pngHeader = new Uint8Array([
        0x89,
        0x50,
        0x4e,
        0x47, // PNG signature
        0x0d,
        0x0a,
        0x1a,
        0x0a, // PNG signature cont.
        0x00,
        0x00,
        0x00,
        0x0d, // IHDR chunk length
        0x49,
        0x48,
        0x44,
        0x52, // IHDR chunk type
        0x00,
        0x00,
        0x07,
        0x80, // Width: 1920 (big-endian)
        0x00,
        0x00,
        0x04,
        0x38, // Height: 1080 (big-endian)
      ]);

      const dimensions = getImageDimensions(pngHeader);
      expect(dimensions).toEqual({
        width: 1920,
        height: 1080,
        format: "png",
      });
    });
  });

  describe("GIF images", () => {
    it("should extract dimensions from GIF header", () => {
      // Create minimal GIF header for 800×600 image
      // Need at least 24 bytes for getImageDimensions to work
      const gifHeader = new Uint8Array(24);
      gifHeader[0] = 0x47; // 'G'
      gifHeader[1] = 0x49; // 'I'
      gifHeader[2] = 0x46; // 'F'
      gifHeader[3] = 0x38; // '8'
      gifHeader[4] = 0x39; // '9'
      gifHeader[5] = 0x61; // 'a'
      gifHeader[6] = 0x20; // Width: 800 low byte (little-endian)
      gifHeader[7] = 0x03; // Width: 800 high byte
      gifHeader[8] = 0x58; // Height: 600 low byte (little-endian)
      gifHeader[9] = 0x02; // Height: 600 high byte

      const dimensions = getImageDimensions(gifHeader);
      expect(dimensions).toEqual({
        width: 800,
        height: 600,
        format: "gif",
      });
    });
  });

  describe("Invalid images", () => {
    it("should return undefined for too small buffer", () => {
      const tooSmall = new Uint8Array([0x89, 0x50]);
      expect(getImageDimensions(tooSmall)).toBeUndefined();
    });

    it("should return undefined for invalid magic bytes", () => {
      const invalid = new Uint8Array(24).fill(0);
      expect(getImageDimensions(invalid)).toBeUndefined();
    });

    it("should return undefined for empty buffer", () => {
      const empty = new Uint8Array(0);
      expect(getImageDimensions(empty)).toBeUndefined();
    });
  });

  describe("ArrayBuffer input", () => {
    it("should handle ArrayBuffer input", () => {
      const pngHeader = new ArrayBuffer(24);
      const view = new Uint8Array(pngHeader);
      view.set([
        0x89,
        0x50,
        0x4e,
        0x47, // PNG signature
        0x0d,
        0x0a,
        0x1a,
        0x0a, // PNG signature cont.
        0x00,
        0x00,
        0x00,
        0x0d, // IHDR chunk length
        0x49,
        0x48,
        0x44,
        0x52, // IHDR chunk type
        0x00,
        0x00,
        0x04,
        0x00, // Width: 1024
        0x00,
        0x00,
        0x04,
        0x00, // Height: 1024
      ]);

      const dimensions = getImageDimensions(pngHeader);
      expect(dimensions).toEqual({
        width: 1024,
        height: 1024,
        format: "png",
      });
    });
  });
});
