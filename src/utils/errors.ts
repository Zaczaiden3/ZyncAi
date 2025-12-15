export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  CRITICAL = 'CRITICAL',
  WARNING = 'WARNING',
  INFO = 'INFO'
}

export class AppError extends Error {
  public type: ErrorType;
  public severity: ErrorSeverity;
  public retryable: boolean;
  public originalError?: any;
  public isUserVisible: boolean;

  constructor(
    message: string, 
    type: ErrorType = ErrorType.UNKNOWN, 
    severity: ErrorSeverity = ErrorSeverity.WARNING,
    retryable: boolean = false,
    originalError?: any, 
    isUserVisible: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.retryable = retryable;
    this.originalError = originalError;
    this.isUserVisible = isUserVisible;
  }

  static fromError(error: any): AppError {
    if (error instanceof AppError) {
      return error;
    }

    let message = error.message || 'An unexpected error occurred.';
    let type = ErrorType.UNKNOWN;
    let severity = ErrorSeverity.WARNING;
    let retryable = false;

    if (message.includes('Network Error') || message.includes('fetch failed')) {
      type = ErrorType.NETWORK;
      message = 'Network connection failed. Please check your internet connection.';
      retryable = true;
    } else if (message.includes('401') || message.includes('403')) {
      type = ErrorType.AUTH;
      message = 'Authentication failed. Please check your API keys.';
      severity = ErrorSeverity.CRITICAL;
    } else if (message.includes('429')) {
      type = ErrorType.API;
      message = 'Rate limit exceeded. Please try again later.';
      retryable = true;
    } else if (message.includes('500')) {
      type = ErrorType.API;
      message = 'Server error. Please try again later.';
      retryable = true;
    }

    return new AppError(message, type, severity, retryable, error);
  }
}
