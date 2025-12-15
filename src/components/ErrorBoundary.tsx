import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { AppError, ErrorSeverity } from '../utils/errors';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isAppError = this.state.error instanceof AppError;
      const severity = isAppError ? (this.state.error as AppError).severity : ErrorSeverity.CRITICAL;
      const isRetryable = isAppError ? (this.state.error as AppError).retryable : true;

      const borderColor = severity === ErrorSeverity.WARNING ? 'border-yellow-500/20' : 'border-red-500/20';
      const iconColor = severity === ErrorSeverity.WARNING ? 'text-yellow-400' : 'text-red-400';
      const iconBg = severity === ErrorSeverity.WARNING ? 'bg-yellow-500/10' : 'bg-red-500/10';
      const titleGradient = severity === ErrorSeverity.WARNING 
        ? 'from-yellow-400 to-orange-400' 
        : 'from-red-400 to-orange-400';

      return (
        <div className="min-h-screen w-full bg-[#0a0a0a] text-white flex items-center justify-center p-4 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full animate-pulse animate-delay-2s" />
          </div>

          <div className={`relative z-10 max-w-2xl w-full bg-white/5 backdrop-blur-xl border ${borderColor} rounded-2xl p-8 shadow-2xl`}>
            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 ${iconBg} rounded-full flex items-center justify-center mb-6 border ${borderColor}`}>
                <AlertTriangle className={`w-10 h-10 ${iconColor}`} />
              </div>

              <h1 className={`text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r ${titleGradient}`}>
                {severity === ErrorSeverity.WARNING ? 'System Warning' : 'System Critical Error'}
              </h1>
              
              <p className="text-gray-400 mb-8 max-w-md">
                {this.state.error?.message || 'An unexpected error has occurred in the neural lattice.'}
              </p>

              {this.state.error && (
                <div className="w-full bg-black/30 rounded-lg p-4 mb-8 text-left border border-white/5 overflow-auto max-h-64">
                  <p className="text-red-300 font-mono text-sm mb-2">{this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <pre className="text-gray-500 font-mono text-xs whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                {isRetryable && (
                  <button
                    onClick={this.handleReload}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-all duration-200 font-medium group"
                  >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    Reinitialize System
                  </button>
                )}
                
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 rounded-lg transition-all duration-200 font-medium"
                >
                  <Home className="w-4 h-4" />
                  Return to Safety
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
