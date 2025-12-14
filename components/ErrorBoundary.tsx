'use client';

import { Component, ErrorInfo, ReactNode, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error or send it to an error reporting service
    console.error('[ERROR] ErrorBoundary caught an error:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack
    });
    console.error('[ERROR] Full error object:', error);
    console.error('[ERROR] Error info:', errorInfo);
    
    // Call the onError handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      // Render fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <div className="p-4 mb-4 rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Something went wrong
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
            <Button onClick={this.handleReset}>Try Again</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// A simple hook to use the error boundary with a try/catch pattern
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  const handleError = (error: Error | unknown) => {
    console.error('[ERROR] Error caught by useErrorHandler:', {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      raw: error
    });
    setError(error instanceof Error ? error : new Error(String(error)));
  };

  const resetError = () => setError(null);

  return { error, handleError, resetError };
}
