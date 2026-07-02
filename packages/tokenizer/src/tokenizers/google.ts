import { TokenlensError } from "@tokenlens/core";

const GOOGLE_MODELS = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
] as const;

export type GoogleModelName = (typeof GOOGLE_MODELS)[number];
export type GoogleModelId = GoogleModelName | `google/${GoogleModelName}`;

export async function google(modelId: GoogleModelName, data: string) {
  const apiKey = (process.env as { GOOGLE_API_KEY?: string }).GOOGLE_API_KEY;
  if (!apiKey) {
    throw new TokenlensError.MissingEnvironmentVariable("GOOGLE_API_KEY");
  }

  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey });
  const countTokensResponse = await ai.models.countTokens({
    model: modelId,
    contents: data,
  });
  return countTokensResponse.totalTokens;
}
