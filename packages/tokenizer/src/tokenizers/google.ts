import { GoogleGenAI } from "@google/genai";
import { detectImageMimeType } from "../utils/mime.js";

const GOOGLE_MODELS = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
] as const;

export type GoogleModelName = (typeof GOOGLE_MODELS)[number];
export type GoogleModelId = GoogleModelName | `google/${GoogleModelName}`;

export async function google(
  modelId: GoogleModelName,
  data: string | ArrayBuffer | Uint8Array,
) {
  if (!process.env["GOOGLE_API_KEY"]) {
    throw new Error("GOOGLE_API_KEY is not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env["GOOGLE_API_KEY"] });

  // Handle text inputs first (most common case)
  if (typeof data === "string") {
    const countTokensResponse = await ai.models.countTokens({
      model: modelId,
      contents: data,
    });
    return countTokensResponse.totalTokens;
  }

  // Handle image inputs using Google's API
  const mimeType = detectImageMimeType(data);
  if (!mimeType) {
    throw new Error(
      "Failed to process ArrayBuffer/Uint8Array: not a recognized image format (PNG, JPEG, GIF, or WebP)",
    );
  }

  // Convert to base64
  const base64Data =
    data instanceof ArrayBuffer
      ? Buffer.from(data).toString("base64")
      : Buffer.from(data).toString("base64");

  // Use Google's countTokens API with inline image data
  const countTokensResponse = await ai.models.countTokens({
    model: modelId,
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
  });

  return countTokensResponse.totalTokens;
}
