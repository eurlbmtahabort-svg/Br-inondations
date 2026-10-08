import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in WebView:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/40">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-display">عذراً، حدث خطأ غير متوقع</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {this.state.error?.message || 'حدث خطأ في تحميل واجهة التطبيق داخل النظام.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold font-mono rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 animate-spin" />
              إعادة تحميل التطبيق (Reload App)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
