"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import type { Toast as ToastType } from "@/types";
import { generateUUID } from "@/lib/uuid";

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-primary-500" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-primary-50 border-primary-200",
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-soft animate-slide-up ${bgColors[toast.type]}`}
      role="alert"
    >
      {icons[toast.type]}
      <span className="flex-1 text-sm font-medium text-neutral-700">
        {toast.message}
      </span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-full hover:bg-black/5"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-neutral-400" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({
  toasts,
  onDismiss,
}: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] space-y-2 pt-safe pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = (message: string, type: ToastType["type"] = "info") => {
    const id = generateUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    toasts,
    addToast,
    dismissToast,
    success: (message: string) => addToast(message, "success"),
    error: (message: string) => addToast(message, "error"),
    info: (message: string) => addToast(message, "info"),
  };
}
