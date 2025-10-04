export class TokenLensError extends Error {
  constructor(message: string, cause?: string) {
    super(message);
    this.name = "TokenLensError";
    this.message = message;
    this.cause = cause;
    this.stack = "";
  }
}
export class MissingDependencyError extends TokenLensError {
  constructor(pkgName: string) {
    super(
      `The package "${pkgName}" is required. Make sure it is installed.`,
      pkgName,
    );
  }
}
