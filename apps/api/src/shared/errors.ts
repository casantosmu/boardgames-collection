interface AppErrorOptions {
  cause?: unknown;
  statusCode: number;
}

class AppError extends Error {
  readonly statusCode: number;

  constructor(message: string, options: AppErrorOptions) {
    super(message, options);
    this.statusCode = options.statusCode;
  }
}

export const isAppError = (error: unknown): error is AppError =>
  error instanceof AppError;
