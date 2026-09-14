export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly success: false;
  public readonly data: null;
  public readonly errors: unknown;

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: unknown = [],
    stack?: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.data = null;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
