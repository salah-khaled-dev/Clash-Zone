import React, { useState, useCallback, useMemo } from 'react';
import { FiCheckCircle, FiAlertCircle, FiXCircle } from 'react-icons/fi';
import { ToastContext } from './useToast';
import type { ToastType } from './useToast';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exitingIds, setExitingIds] = useState<Set<string>>(() => new Set());

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Trigger exit animation after 3.2 seconds
    const exitTimer = setTimeout(() => {
      setExitingIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }, 3200);

    // Remove toast after exit animation completes (3.5 seconds total)
    const removeTimer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setExitingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 3500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const icons = {
    success: <FiCheckCircle className="w-5 h-5 text-emerald-500" />,
    warning: <FiAlertCircle className="w-5 h-5 text-amber-500" />,
    error: <FiXCircle className="w-5 h-5 text-rose-500" />,
  };

  const borders = {
    success: 'border-r-4 border-r-emerald-500',
    warning: 'border-r-4 border-r-amber-500',
    error: 'border-r-4 border-r-rose-500',
  };

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast container aligned to Top-Left for RTL layout */}
      <div className="fixed top-6 left-6 z-50 flex flex-col gap-3 pointer-events-none w-full max-w-sm">
        {toasts.map((toast) => {
          const isExiting = exitingIds.has(toast.id);
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto bg-white border border-neutral-100 shadow-xl rounded-xl p-4 flex items-center gap-3 ${borders[toast.type]} ${
                isExiting ? 'animate-toast-exit' : 'animate-toast-enter'
              }`}
            >
              <div className="flex-shrink-0">{icons[toast.type]}</div>
              <p className="text-sm font-semibold text-gray-800 leading-normal">{toast.message}</p>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

