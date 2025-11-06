/**
 * Image utilities for extracting dimensions and metadata from image buffers
 */

export type ImageDimensions = {
  width: number;
  height: number;
  format: "png" | "jpeg" | "gif" | "webp" | "unknown";
};

/**
 * Extract image dimensions from an ArrayBuffer or Uint8Array
 * Supports PNG, JPEG, GIF, and WebP formats
 */
export function getImageDimensions(
  data: ArrayBuffer | Uint8Array,
): ImageDimensions | undefined {
  const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;

  if (bytes.length < 24) {
    return undefined;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return {
      width: readUInt32BE(bytes, 16),
      height: readUInt32BE(bytes, 20),
      format: "png",
    };
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return parseJPEG(bytes);
  }

  // GIF: 47 49 46 38 (GIF8)
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return {
      width: readUInt16LE(bytes, 6),
      height: readUInt16LE(bytes, 8),
      format: "gif",
    };
  }

  // WebP: 52 49 46 46 ... 57 45 42 50 (RIFF...WEBP)
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return parseWebP(bytes);
  }

  return undefined;
}

/**
 * Parse JPEG dimensions by scanning for SOF (Start of Frame) markers
 */
function parseJPEG(bytes: Uint8Array): ImageDimensions | undefined {
  let offset = 2; // Skip initial FF D8

  while (offset < bytes.length - 9) {
    // Check for marker (FF XX)
    if (bytes[offset] !== 0xff) {
      return undefined;
    }

    const marker = bytes[offset + 1];
    if (marker === undefined) {
      return undefined;
    }

    // Skip padding bytes
    if (marker === 0xff) {
      offset++;
      continue;
    }

    // SOF markers (Start of Frame): C0-CF except C4, C8, CC
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    ) {
      return {
        width: readUInt16BE(bytes, offset + 7),
        height: readUInt16BE(bytes, offset + 5),
        format: "jpeg",
      };
    }

    // Read segment length and skip to next marker
    const segmentLength = readUInt16BE(bytes, offset + 2);
    offset += 2 + segmentLength;
  }

  return undefined;
}

/**
 * Parse WebP dimensions
 */
function parseWebP(bytes: Uint8Array): ImageDimensions | undefined {
  if (bytes.length < 16) {
    return undefined;
  }

  const b12 = bytes[12];
  const b13 = bytes[13];
  const b14 = bytes[14];
  const b15 = bytes[15];

  if (
    b12 === undefined ||
    b13 === undefined ||
    b14 === undefined ||
    b15 === undefined
  ) {
    return undefined;
  }

  const chunkType = String.fromCharCode(b12, b13, b14, b15);

  if (chunkType === "VP8 " && bytes.length >= 30) {
    // Lossy WebP
    return {
      width: readUInt16LE(bytes, 26) & 0x3fff,
      height: readUInt16LE(bytes, 28) & 0x3fff,
      format: "webp",
    };
  }

  if (chunkType === "VP8L" && bytes.length >= 25) {
    // Lossless WebP
    const bits = readUInt32LE(bytes, 21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
      format: "webp",
    };
  }

  if (chunkType === "VP8X" && bytes.length >= 30) {
    // Extended WebP
    return {
      width: readUInt24LE(bytes, 24) + 1,
      height: readUInt24LE(bytes, 27) + 1,
      format: "webp",
    };
  }

  return undefined;
}

/**
 * Read a 32-bit unsigned integer in big-endian format
 */
function readUInt32BE(bytes: Uint8Array, offset: number): number {
  const b0 = bytes[offset] ?? 0;
  const b1 = bytes[offset + 1] ?? 0;
  const b2 = bytes[offset + 2] ?? 0;
  const b3 = bytes[offset + 3] ?? 0;
  return (b0 << 24) | (b1 << 16) | (b2 << 8) | b3;
}

/**
 * Read a 32-bit unsigned integer in little-endian format
 */
function readUInt32LE(bytes: Uint8Array, offset: number): number {
  const b0 = bytes[offset] ?? 0;
  const b1 = bytes[offset + 1] ?? 0;
  const b2 = bytes[offset + 2] ?? 0;
  const b3 = bytes[offset + 3] ?? 0;
  return b0 | (b1 << 8) | (b2 << 16) | (b3 << 24);
}

/**
 * Read a 16-bit unsigned integer in big-endian format
 */
function readUInt16BE(bytes: Uint8Array, offset: number): number {
  const b0 = bytes[offset] ?? 0;
  const b1 = bytes[offset + 1] ?? 0;
  return (b0 << 8) | b1;
}

/**
 * Read a 16-bit unsigned integer in little-endian format
 */
function readUInt16LE(bytes: Uint8Array, offset: number): number {
  const b0 = bytes[offset] ?? 0;
  const b1 = bytes[offset + 1] ?? 0;
  return b0 | (b1 << 8);
}

/**
 * Read a 24-bit unsigned integer in little-endian format
 */
function readUInt24LE(bytes: Uint8Array, offset: number): number {
  const b0 = bytes[offset] ?? 0;
  const b1 = bytes[offset + 1] ?? 0;
  const b2 = bytes[offset + 2] ?? 0;
  return b0 | (b1 << 8) | (b2 << 16);
}
