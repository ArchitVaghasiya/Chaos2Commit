'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X 
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toast: (item: Omit<ToastItem, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type, title, message, duration = 4000, action }: Omit<ToastItem, 'id'>) => {
      setToasts((prev) => {
        // Prevent duplicate toasts if identical title & message are already visible
        const isDuplicate = prev.some((t) => t.title === title && t.message === message);
        if (isDuplicate) return prev;

        const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newToast: ToastItem = { id, type, title, message, duration, action };

        if (duration > 0) {
          setTimeout(() => {
            removeToast(id);
          }, duration);
        }

        // Keep at most 3 active toasts at a time
        const next = [...prev, newToast];
        return next.slice(-3);
      });
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => toast({ type: 'success', title, message }),
    [toast]
  );
  const error = useCallback(
    (title: string, message?: string) => toast({ type: 'error', title, message }),
    [toast]
  );
  const info = useCallback(
    (title: string, message?: string) => toast({ type: 'info', title, message }),
    [toast]
  );
  const warning = useCallback(
    (title: string, message?: string) => toast({ type: 'warning', title, message }),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning, removeToast }}>
      {children}

      {/* Floating Toast Notification Stack (Fixed in bottom-right) */}
      <div 
        aria-live="polite" 
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
      >
        {toasts.map((t) => {
          const typeStyles = {
            success: {
              border: 'border-emerald-500/30 dark:border-emerald-500/40',
              bg: 'bg-emerald-50/95 dark:bg-[#071912]/95',
              icon: CheckCircle2,
              iconColor: 'text-emerald-600 dark:text-emerald-400',
              glow: 'shadow-emerald-500/10'
            },
            error: {
              border: 'border-rose-500/30 dark:border-rose-500/40',
              bg: 'bg-rose-50/95 dark:bg-[#1a0a10]/95',
              icon: AlertCircle,
              iconColor: 'text-rose-600 dark:text-rose-400',
              glow: 'shadow-rose-500/10'
            },
            warning: {
              border: 'border-amber-500/30 dark:border-amber-500/40',
              bg: 'bg-amber-50/95 dark:bg-[#191307]/95',
              icon: AlertTriangle,
              iconColor: 'text-amber-600 dark:text-amber-400',
              glow: 'shadow-amber-500/10'
            },
            info: {
              border: 'border-indigo-500/30 dark:border-indigo-500/40',
              bg: 'bg-indigo-50/95 dark:bg-[#0b112c]/95',
              icon: Info,
              iconColor: 'text-indigo-600 dark:text-indigo-400',
              glow: 'shadow-indigo-500/10'
            },
          }[t.type];

          const IconComponent = typeStyles.icon;

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-3.5 rounded-2xl border ${typeStyles.border} ${typeStyles.bg} backdrop-blur-xl shadow-xl ${typeStyles.glow} flex items-start gap-3 transition-all animate-in fade-in slide-in-from-bottom-3 duration-250`}
            >
              <div className={`p-1 rounded-lg shrink-0 mt-0.5 ${typeStyles.iconColor}`}>
                <IconComponent className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {t.title}
                </div>
                {t.message && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                    {t.message}
                  </p>
                )}
                {t.action && (
                  <button
                    onClick={() => {
                      t.action?.onClick();
                      removeToast(t.id);
                    }}
                    className="mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer rounded-lg"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
      warning: () => {},
      removeToast: () => {},
    };
  }
  return context;
}
