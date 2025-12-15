export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  UNKNOWN = 'UNKNOWN'
}

export class AppError extends Error {
  public type: ErrorType;
  public originalError?: any;
  public isUserVisible: boolean;

  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN, originalError?: any, isUserVisible: boolean = true) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
    this.isUserVisible = isUserVisible;
  }

  static fromError(error: any): AppError {
    if (error instanceof AppError) {
      return error;
    }

    let message = error.message || 'An unexpected error occurred.';
    let type = ErrorType.UNKNOWN;

    if (message.includes('Network Error') || message.includes('fetch failed')) {
      type = ErrorType.NETWORK;
      message = 'Network connection failed. Please check your internet connection.';
    } else if (message.includes('401') || message.includes('403')) {
      type = ErrorType.AUTH;
      message = 'Authentication failed. Please check your API keys.';
    } else if (message.includes('429')) {
      type = ErrorType.API;
      message = 'Rate limit exceeded. Please try again later.';
    } else if (message.includes('500')) {
      type = ErrorType.API;
      message = 'Server error. Please try again later.';
    }

    return new AppError(message, type, error);
  }
}
