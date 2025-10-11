import { GoogleGenAI } from "@google/genai";

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
  // Handle text inputs first (most common case)
  if (typeof data === "string") {
    if (!process.env["GOOGLE_API_KEY"]) {
      throw new Error("GOOGLE_API_KEY is not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env["GOOGLE_API_KEY"] });
    const countTokensResponse = await ai.models.countTokens({
      model: modelId,
      contents: data,
    });
    return countTokensResponse.totalTokens;
  }

  // For now, only support string inputs
  // Image support would require proper content structure
  throw new Error(
    "Image input (ArrayBuffer/Uint8Array) is not yet supported for Google models. Please use the Google GenAI SDK directly for image inputs.",
  );
}
