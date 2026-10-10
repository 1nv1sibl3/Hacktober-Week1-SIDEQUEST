import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Compass, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SIDEQUEST Uncaught UI Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#1C2621] p-6 flex items-center justify-center">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#E7E0D5] shadow-lg text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-[#C87D32] rounded-full mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="font-editorial text-2xl font-bold text-[#163324]">
              Field Guide Interrupted
            </h1>
            <p className="text-xs text-[#57635C] leading-relaxed">
              An unexpected display error occurred while rendering the expedition interface.
            </p>
            {this.state.error && (
              <pre className="text-[11px] p-3 rounded bg-red-50 text-red-800 text-left overflow-x-auto font-mono">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-[#163324] text-white text-xs font-mono font-medium hover:bg-[#2E5339] transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload SIDEQUEST
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
