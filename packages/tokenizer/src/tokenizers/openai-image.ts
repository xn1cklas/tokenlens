/**
 * OpenAI image token calculation
 * Based on: https://platform.openai.com/docs/guides/vision
 */

export type DetailMode = "low" | "high";

export type ModelFamily =
  | "patch-based" // gpt-4.1-mini/nano, gpt-5-mini/nano, o4-mini
  | "tile-based" // gpt-4o, gpt-4.1, gpt-4.5, o1/o3 series, 4o-mini
  | "gpt-image-1"; // GPT Image 1 models

export type ModelConfig = {
  family: ModelFamily;
  baseTokens?: number;
  tileTokens?: number;
  patchMultiplier?: number;
};

/**
 * Model configurations for token calculation
 */
const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // Patch-based models
  "gpt-5-mini": { family: "patch-based", patchMultiplier: 1.62 },
  "gpt-5-nano": { family: "patch-based", patchMultiplier: 2.46 },
  "gpt-4.1-mini": { family: "patch-based", patchMultiplier: 1.62 },
  "gpt-4.1-nano": { family: "patch-based", patchMultiplier: 2.46 },
  "o4-mini": { family: "patch-based", patchMultiplier: 1.72 },

  // Tile-based models
  "gpt-5": { family: "tile-based", baseTokens: 70, tileTokens: 140 },
  "gpt-4o": { family: "tile-based", baseTokens: 85, tileTokens: 170 },
  "gpt-4o-mini": { family: "tile-based", baseTokens: 2833, tileTokens: 5667 },
  "gpt-4.1": { family: "tile-based", baseTokens: 85, tileTokens: 170 },
  "gpt-4.5": { family: "tile-based", baseTokens: 85, tileTokens: 170 },
  "o1": { family: "tile-based", baseTokens: 75, tileTokens: 150 },
  "o1-pro": { family: "tile-based", baseTokens: 75, tileTokens: 150 },
  "o3": { family: "tile-based", baseTokens: 75, tileTokens: 150 },
  "computer-use-preview": {
    family: "tile-based",
    baseTokens: 65,
    tileTokens: 129,
  },

  // GPT Image 1
  "gpt-image-1": { family: "gpt-image-1", baseTokens: 65, tileTokens: 129 },
};

/**
 * Get model configuration for a given model ID
 */
function getModelConfig(modelId: string): ModelConfig {
  // Try exact match first
  if (MODEL_CONFIGS[modelId]) {
    return MODEL_CONFIGS[modelId];
  }

  // Try prefix matching
  for (const [key, config] of Object.entries(MODEL_CONFIGS)) {
    if (modelId.startsWith(key)) {
      return config;
    }
  }

  // Default to tile-based gpt-4o configuration
  return { family: "tile-based", baseTokens: 85, tileTokens: 170 };
}

/**
 * Calculate tokens for patch-based models
 * Used by: gpt-4.1-mini/nano, gpt-5-mini/nano, o4-mini
 */
function calculatePatchBasedTokens(
  width: number,
  height: number,
  multiplier: number,
): number {
  const PATCH_SIZE = 32;
  const MAX_PATCHES = 1536;

  // Calculate raw patches
  let patchWidth = Math.ceil(width / PATCH_SIZE);
  let patchHeight = Math.ceil(height / PATCH_SIZE);
  let rawPatches = patchWidth * patchHeight;

  // If exceeds max patches, rescale
  if (rawPatches > MAX_PATCHES) {
    const scalingRatio = Math.sqrt(
      (PATCH_SIZE * PATCH_SIZE * MAX_PATCHES) / (width * height),
    );
    const resizedWidth = Math.floor(width * scalingRatio);
    const resizedHeight = Math.floor(height * scalingRatio);

    patchWidth = Math.ceil(resizedWidth / PATCH_SIZE);
    patchHeight = Math.ceil(resizedHeight / PATCH_SIZE);
    rawPatches = patchWidth * patchHeight;
  }

  // Apply model-specific multiplier
  return Math.ceil(rawPatches * multiplier);
}

/**
 * Calculate tokens for tile-based models
 * Used by: gpt-4o, gpt-4.1, gpt-4.5, o1/o3 series, 4o-mini
 */
function calculateTileBasedTokens(
  width: number,
  height: number,
  baseTokens: number,
  tileTokens: number,
  detail: DetailMode,
): number {
  // Low detail mode: fixed cost
  if (detail === "low") {
    return baseTokens;
  }

  // High detail mode
  const MAX_DIMENSION = 2048;
  const TARGET_SHORT_SIDE = 768;
  const TILE_SIZE = 512;

  // Step 1: Fit within 2048x2048 square
  let resizedWidth = width;
  let resizedHeight = height;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    resizedWidth = Math.floor(width * scale);
    resizedHeight = Math.floor(height * scale);
  }

  // Step 2: Scale so shortest side = 768px
  const shortSide = Math.min(resizedWidth, resizedHeight);
  if (shortSide !== TARGET_SHORT_SIDE) {
    const scale = TARGET_SHORT_SIDE / shortSide;
    resizedWidth = Math.floor(resizedWidth * scale);
    resizedHeight = Math.floor(resizedHeight * scale);
  }

  // Step 3: Calculate number of 512x512 tiles
  const tilesWide = Math.ceil(resizedWidth / TILE_SIZE);
  const tilesHigh = Math.ceil(resizedHeight / TILE_SIZE);
  const tileCount = tilesWide * tilesHigh;

  // Step 4: Total tokens
  return baseTokens + tileCount * tileTokens;
}

/**
 * Calculate tokens for GPT Image 1 models
 */
function calculateGPTImage1Tokens(
  width: number,
  height: number,
  baseTokens: number,
  tileTokens: number,
  detail: DetailMode,
): number {
  // Low fidelity: fixed cost
  if (detail === "low") {
    return baseTokens + tileTokens; // 65 + 129 = 194
  }

  // High fidelity
  const MAX_DIMENSION = 2048;
  const TARGET_SHORT_SIDE = 512; // Different from tile-based!
  const TILE_SIZE = 512;

  // Determine aspect ratio type
  const aspectRatio = width / height;
  const isSquare = Math.abs(aspectRatio - 1) < 0.1; // Within 10% of square

  // Step 1: Fit within 2048x2048 square
  let resizedWidth = width;
  let resizedHeight = height;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    resizedWidth = Math.floor(width * scale);
    resizedHeight = Math.floor(height * scale);
  }

  // Step 2: Scale so shortest side = 512px
  const shortSide = Math.min(resizedWidth, resizedHeight);
  if (shortSide !== TARGET_SHORT_SIDE) {
    const scale = TARGET_SHORT_SIDE / shortSide;
    resizedWidth = Math.floor(resizedWidth * scale);
    resizedHeight = Math.floor(resizedHeight * scale);
  }

  // Step 3: Calculate tiles
  const tilesWide = Math.ceil(resizedWidth / TILE_SIZE);
  const tilesHigh = Math.ceil(resizedHeight / TILE_SIZE);
  const tileCount = tilesWide * tilesHigh;

  // Step 4: Add overhead based on aspect ratio
  const extraOverhead = isSquare ? 4160 : 6240;

  return baseTokens + tileCount * tileTokens + extraOverhead;
}

/**
 * Calculate OpenAI image tokens
 *
 * @param modelId - The model ID (e.g., "gpt-4o", "gpt-5-mini")
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @param detail - Detail mode: "low" or "high" (default: "high")
 * @returns Token count for the image
 */
export function calculateImageTokens(
  modelId: string,
  width: number,
  height: number,
  detail: DetailMode = "high",
): number {
  const config = getModelConfig(modelId);

  switch (config.family) {
    case "patch-based":
      if (!config.patchMultiplier) {
        throw new Error(
          `Missing patchMultiplier for patch-based model: ${modelId}`,
        );
      }
      return calculatePatchBasedTokens(width, height, config.patchMultiplier);

    case "tile-based":
      if (config.baseTokens === undefined || config.tileTokens === undefined) {
        throw new Error(
          `Missing baseTokens or tileTokens for tile-based model: ${modelId}`,
        );
      }
      return calculateTileBasedTokens(
        width,
        height,
        config.baseTokens,
        config.tileTokens,
        detail,
      );

    case "gpt-image-1":
      if (config.baseTokens === undefined || config.tileTokens === undefined) {
        throw new Error(
          `Missing baseTokens or tileTokens for gpt-image-1 model: ${modelId}`,
        );
      }
      return calculateGPTImage1Tokens(
        width,
        height,
        config.baseTokens,
        config.tileTokens,
        detail,
      );

    default:
      throw new Error(`Unknown model family: ${config.family}`);
  }
}
