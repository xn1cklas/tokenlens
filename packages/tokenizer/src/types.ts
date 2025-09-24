import type { Model } from "@tokenlens/core/dto";
import type { Usage } from "@tokenlens/core/types";

export type TokenizerMessage = {
  role?: string;
  content: string;
};

export type TextSource =
  | { text: string; messages?: never }
  | { text?: never; messages: readonly TokenizerMessage[] };

export type TokenizerInput = TextSource & {
  providerId: string;
  modelId: string;
  model?: Model;
  usage?: Usage;
  encodingOverride?: string;
};

export type TokenizerResolvedInput = TokenizerInput & { text: string };

export type TokenizerResult = {
  count: number;
  estimated: boolean;
  tokenizerId?: string;
  details?: Record<string, unknown>;
};

export type TokenizerDispatch = {
  estimate: (
    input: TokenizerResolvedInput,
  ) => Promise<TokenizerResult> | TokenizerResult;
};

export type TokenizerProvider = {
  match(input: TokenizerResolvedInput): TokenizerDispatch | undefined;
};
