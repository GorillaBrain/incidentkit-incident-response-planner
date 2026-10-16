import React from 'react'
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'

export interface ToastProps {
  toasts: {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }[];
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 p-3.5 rounded-lg border shadow-xl text-sm animate-in slide-in-from-bottom-3 duration-200 ${
              isSuccess
                ? 'bg-slate-900 border-emerald-500/40 text-emerald-200'
                : isError
                ? 'bg-slate-900 border-rose-500/40 text-rose-200'
                : 'bg-slate-900 border-cyan-500/40 text-cyan-200'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {isError && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            {!isSuccess && !isError && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
            <span className="leading-snug">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
