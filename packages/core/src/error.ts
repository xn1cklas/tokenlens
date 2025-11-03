export type TokenlensErrorCode =
  | "INVALID_CATALOG"
  | "CATALOG_NOT_FOUND"
  | "MODEL_NOT_FOUND"
  | "UNKNOWN_MODEL_ID"
  | "MISSING_DEPENDENCY"
  | "INVALID_JSON"
  | "FETCH_FAILED"
  | "MISSING_ENVIRONMENT_VARIABLE"
  | "UNSUPPORTED_TOKENIZER_MODEL"
  | "TOKENIZER_ENCODING_FAILED";

export type TokenlensErrorOptions = {
  cause?: unknown;
  meta?: Record<string, unknown>;
};

type ErrorStatic<P extends unknown[]> = {
  readonly code: TokenlensErrorCode;
  new (...args: P): TokenlensError;
};

type ModelNotFoundOptions = TokenlensErrorOptions & {
  providerId?: string;
  catalogId?: string;
};

type UnsupportedTokenizerModelOptions = TokenlensErrorOptions & {
  supportedModels?: readonly string[];
};

type FetchFailedArgs = {
  target: string;
  status?: number;
  statusText?: string;
  cause?: unknown;
  meta?: Record<string, unknown>;
};

const mergeOptions = (
  extraMeta: Record<string, unknown> | undefined,
  options?: TokenlensErrorOptions,
): TokenlensErrorOptions | undefined => {
  const cause = options?.cause;
  const existingMeta = options?.meta;
  const mergedMeta =
    existingMeta || extraMeta
      ? { ...(existingMeta ?? {}), ...(extraMeta ?? {}) }
      : undefined;

  if (cause === undefined && mergedMeta === undefined) return undefined;

  const normalized: TokenlensErrorOptions = {};
  if (cause !== undefined) normalized.cause = cause;
  if (mergedMeta !== undefined) normalized.meta = mergedMeta;
  return normalized;
};

export class TokenlensError extends Error {
  declare readonly cause?: unknown;
  readonly code: TokenlensErrorCode;
  readonly meta?: Readonly<Record<string, unknown>>;

  protected constructor(
    code: TokenlensErrorCode,
    message: string,
    options?: TokenlensErrorOptions,
  ) {
    super(message);
    const className = new.target?.name ?? "TokenlensError";
    this.name = className;
    this.code = code;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }

    if (options?.meta) {
      this.meta = Object.freeze({ ...options.meta });
    }

    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }

  static InvalidCatalog: ErrorStatic<[string, TokenlensErrorOptions?]> =
    class InvalidCatalogError extends TokenlensError {
      static readonly code: TokenlensErrorCode = "INVALID_CATALOG";

      constructor(catalogId: string, options?: TokenlensErrorOptions) {
        super(
          InvalidCatalogError.code,
          `Unknown catalog ID: ${catalogId}`,
          mergeOptions({ catalogId }, options),
        );
      }
    };

  static CatalogNotFound: ErrorStatic<[string, TokenlensErrorOptions?]> =
    class CatalogNotFoundError extends TokenlensError {
      static readonly code: TokenlensErrorCode = "CATALOG_NOT_FOUND";

      constructor(catalogId: string, options?: TokenlensErrorOptions) {
        super(
          CatalogNotFoundError.code,
          `Catalog "${catalogId}" could not be found`,
          mergeOptions({ catalogId }, options),
        );
      }
    };

  static ModelNotFound: ErrorStatic<[string, ModelNotFoundOptions?]> =
    class ModelNotFoundError extends TokenlensError {
      static readonly code: TokenlensErrorCode = "MODEL_NOT_FOUND";

      constructor(modelId: string, options?: ModelNotFoundOptions) {
        const providerId = options?.providerId;
        const catalogId = options?.catalogId;
        const providerText = providerId ? ` for provider "${providerId}"` : "";
        const catalogText = catalogId ? ` in catalog "${catalogId}"` : "";
        super(
          ModelNotFoundError.code,
          `Model "${modelId}" not found${providerText}${catalogText}`,
          mergeOptions(
            {
              modelId,
              ...(providerId ? { providerId } : {}),
              ...(catalogId ? { catalogId } : {}),
            },
            options,
          ),
        );
      }
    };

  static UnknownModelId: ErrorStatic<[string, TokenlensErrorOptions?]> =
    class UnknownModelIdError extends TokenlensError {
      static readonly code: TokenlensErrorCode = "UNKNOWN_MODEL_ID";

      constructor(modelId: string, options?: TokenlensErrorOptions) {
        super(
          UnknownModelIdError.code,
          `Unknown model id: ${modelId}`,
          mergeOptions({ modelId }, options),
        );
      }
    };

  static MissingDependency: ErrorStatic<[string, TokenlensErrorOptions?]> =
    class MissingDependencyError extends TokenlensError {
      static readonly code: TokenlensErrorCode = "MISSING_DEPENDENCY";

      constructor(packageName: string, options?: TokenlensErrorOptions) {
        super(
          MissingDependencyError.code,
          `The package "${packageName}" is required. Make sure it is installed.`,
          mergeOptions({ packageName }, options),
        );
      }
    };

  static InvalidJson: ErrorStatic<[string, TokenlensErrorOptions?]> =
    class InvalidJsonError extends TokenlensError {
      static readonly code: TokenlensErrorCode = "INVALID_JSON";

      constructor(message: string, options?: TokenlensErrorOptions) {
        super(InvalidJsonError.code, message, mergeOptions(undefined, options));
      }
    };

  static FetchFailed: ErrorStatic<[FetchFailedArgs]> =
    class FetchFailedError extends TokenlensError {
      static readonly code: TokenlensErrorCode = "FETCH_FAILED";

      constructor(args: FetchFailedArgs) {
        const { target, status, statusText, cause, meta } = args;
        const statusInfo =
          status !== undefined || statusText
            ? `: ${[status, statusText].filter(Boolean).join(" ")}`
            : "";
        const baseOptions =
          cause !== undefined || meta !== undefined
            ? {
                ...(cause !== undefined ? { cause } : {}),
                ...(meta !== undefined ? { meta } : {}),
              }
            : undefined;
        super(
          FetchFailedError.code,
          `Failed to fetch ${target}${statusInfo}`,
          mergeOptions(
            {
              target,
              ...(status !== undefined ? { status } : {}),
              ...(statusText ? { statusText } : {}),
            },
            baseOptions,
          ),
        );
      }
    };

  static MissingEnvironmentVariable: ErrorStatic<
    [string, TokenlensErrorOptions?]
  > = class MissingEnvironmentVariableError extends TokenlensError {
    static readonly code: TokenlensErrorCode = "MISSING_ENVIRONMENT_VARIABLE";

    constructor(envVar: string, options?: TokenlensErrorOptions) {
      super(
        MissingEnvironmentVariableError.code,
        `${envVar} is not set`,
        mergeOptions({ envVar }, options),
      );
    }
  };

  static UnsupportedTokenizerModel: ErrorStatic<
    [string, UnsupportedTokenizerModelOptions?]
  > = class UnsupportedTokenizerModelError extends TokenlensError {
    static readonly code: TokenlensErrorCode = "UNSUPPORTED_TOKENIZER_MODEL";

    constructor(modelId: string, options?: UnsupportedTokenizerModelOptions) {
      const supportedModels = options?.supportedModels;
      const suffix = supportedModels
        ? `. Supported models: ${supportedModels.join(", ")}`
        : "";
      super(
        UnsupportedTokenizerModelError.code,
        `Unknown tokenizer model: ${modelId}${suffix}`,
        mergeOptions(
          {
            modelId,
            ...(supportedModels ? { supportedModels } : {}),
          },
          options,
        ),
      );
    }
  };

  static TokenizerEncodingFailed: ErrorStatic<
    [string, string, TokenlensErrorOptions?]
  > = class TokenizerEncodingFailedError extends TokenlensError {
    static readonly code: TokenlensErrorCode = "TOKENIZER_ENCODING_FAILED";

    constructor(
      modelId: string,
      encodingType: string,
      options?: TokenlensErrorOptions,
    ) {
      super(
        TokenizerEncodingFailedError.code,
        `Failed to encode text with ${encodingType}`,
        mergeOptions(
          {
            modelId,
            encodingType,
          },
          options,
        ),
      );
    }
  };
}
