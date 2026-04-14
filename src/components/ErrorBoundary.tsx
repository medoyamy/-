import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { safeStringify } from '../lib/mapUtils';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', safeStringify(error), safeStringify(errorInfo));
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || '';
      const isFirestoreError = errorMessage.startsWith('{') && errorMessage.includes('operationType');
      let errorDetails = null;
      
      if (isFirestoreError) {
        try {
          errorDetails = JSON.parse(this.state.error!.message);
        } catch (e) {
          // Fallback if parsing fails
        }
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">عذراً، حدث خطأ غير متوقع</h2>
              <p className="text-sm font-bold text-gray-500 leading-relaxed mb-6">
                {isFirestoreError 
                  ? 'حدث خطأ في الاتصال بقاعدة البيانات. قد يكون ذلك بسبب نقص في الصلاحيات أو مشكلة في الإعدادات.'
                  : 'واجه التطبيق مشكلة تقنية تمنعه من العمل بشكل صحيح.'}
              </p>
              
              {errorDetails && (
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-right dir-rtl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2">تفاصيل الخطأ:</p>
                  <p className="text-xs font-bold text-red-600 break-all">
                    {errorDetails.operationType} on {errorDetails.path}: {errorDetails.error}
                  </p>
                </div>
              )}

              {!errorDetails && this.state.error && (
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-right dir-rtl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2">الرسالة:</p>
                  <p className="text-xs font-bold text-red-600 break-all">{this.state.error.message}</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  <span>إعادة تحميل التطبيق</span>
                </button>
                <button 
                  onClick={this.handleReset}
                  className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl text-sm font-black active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Home size={18} />
                  <span>العودة للرئيسية</span>
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
