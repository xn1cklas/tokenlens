import { TokenlensError } from "@tokenlens/core";

export type TokenizerModelId = string;

function isMissingTokenizerDependency(error: unknown): boolean {
  const code =
    error && typeof error === "object"
      ? (error as { code?: unknown }).code
      : undefined;
  const message = error instanceof Error ? error.message : "";

  return (
    (code === "ERR_MODULE_NOT_FOUND" || code === "MODULE_NOT_FOUND") &&
    message.includes("@tokenlens/tokenizer")
  );
}

export async function countTokensWithOptionalTokenizer(
  modelId: TokenizerModelId,
  data: string,
): Promise<number | undefined> {
  try {
    const { countTokens } = await import("@tokenlens/tokenizer");
    return await countTokens(modelId, data);
  } catch (error) {
    if (isMissingTokenizerDependency(error)) {
      throw new TokenlensError.MissingDependency("@tokenlens/tokenizer", {
        cause: error,
      });
    }
    throw error;
  }
}
