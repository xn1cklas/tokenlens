import { GoogleGenAI } from "@google/genai";

const GOOGLE_MODELS = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
] as const;

export type GoogleModelName = (typeof GOOGLE_MODELS)[number];
export type GoogleModelId = GoogleModelName | `google/${GoogleModelName}`;

export async function google(modelId: GoogleModelId, data: string) {
  if (!process.env["GOOGLE_API_KEY"]) {
    throw new Error("GOOGLE_API_KEY is not set");
  }

  // Strip the "google/" prefix if present
  const cleanModelId = modelId.replace(/^google\//, "");

  const ai = new GoogleGenAI({ apiKey: process.env["GOOGLE_API_KEY"] });
  const countTokensResponse = await ai.models.countTokens({
    model: cleanModelId,
    contents: data,
  });
  return countTokensResponse.totalTokens;
}
