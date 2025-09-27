import type { SourceModel, Usage } from "@tokenlens/core";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { MessageParam as AnthropicMessageParam } from "@anthropic-ai/sdk/resources/messages/messages";
import type { ModelMessage as AiSdkModelMessage } from "ai";

export type TokenizerMessage = {
  role?: string;
  content: string;
};

export type TokenizerMessageInput =
  | TokenizerMessage
  | ChatCompletionMessageParam
  | AnthropicMessageParam
  | AiSdkModelMessage;

export type TokenizerContent =
  | string
  | readonly TokenizerMessage[]
  | readonly TokenizerMessageInput[];

export type TokenizerPayload =
  | { text: string; messages?: never; content?: never; input?: never }
  | {
      messages: readonly TokenizerMessageInput[];
      text?: never;
      content?: never;
      input?: never;
    }
  | { content: TokenizerContent; text?: never; messages?: never; input?: never }
  | {
      input: TokenizerContent | readonly TokenizerMessageInput[] | unknown;
      text?: never;
      messages?: never;
      content?: never;
    };

export type KnownTokenizerId = "o200k_base" | "cl100k_base" | "claude-v1";

export type TokenizerId = KnownTokenizerId | (string & {});

export type TokenizerOptions = {
  model?: SourceModel;
  usage?: Usage;
  tokenizerId?: TokenizerId;
  /** @deprecated use tokenizerId */
  encodingOverride?: TokenizerId;
};

export type EstimateTokensOptions = TokenizerOptions;

export type TokenizerInput = TokenizerPayload &
  TokenizerOptions & {
    providerId: string;
    modelId: string;
  };

export type EstimateTokensParams = TokenizerInput;

export type TokenizerResolvedInput = TokenizerInput & {
  text: string;
  messages?: readonly TokenizerMessage[];
};

export type TokenizerResult = {
  total: number;
  estimated: boolean;
  tokenizerId?: TokenizerId;
  details?: Record<string, unknown>;
  breakdown?: Record<string, unknown>;
  /** @deprecated use total */
  count?: number;
};

export type TokenizerDispatch = {
  estimate: (
    input: TokenizerResolvedInput,
  ) => Promise<TokenizerResult> | TokenizerResult;
};

export type TokenizerProvider = {
  match(input: TokenizerResolvedInput): TokenizerDispatch | undefined;
};

export type CountTokensContent = TokenizerContent;
export type CountTokensOptions = EstimateTokensOptions;
export type CountTokensParams =
  | EstimateTokensParams
  | {
      providerId: string;
      modelId: string;
      content?: TokenizerContent;
      options?: EstimateTokensOptions;
    };
