import { GoogleGenAI } from "@google/genai";

const GOOGLE_MODELS = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
] as const;

export type GoogleModelName = (typeof GOOGLE_MODELS)[number];
export type GoogleModelId = GoogleModelName | `google/${GoogleModelName}`;

export async function google(modelId: GoogleModelName, data: string) {
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
