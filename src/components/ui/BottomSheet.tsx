"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: "auto" | "full" | "half";
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  height = "auto",
}: BottomSheetProps) {
  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const heightClasses = {
    auto: "max-h-[90vh]",
    full: "h-[95vh]",
    half: "h-[60vh]",
  };

  return (
    <>
      {/* Overlay */}
      <div className="overlay" onClick={onClose} aria-hidden="true" />

      {/* Sheet */}
      <div
        className={`bottom-sheet animate-slide-up ${heightClasses[height]} flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "sheet-title" : undefined}
      >
        {/* Handle */}
        <div className="bottom-sheet-handle" />

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 pb-4">
            <h2
              id="sheet-title"
              className="text-xl font-semibold text-neutral-900"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="icon-btn -mr-2"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-neutral-500" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 hide-scrollbar">
          {children}
        </div>
      </div>
    </>
  );
}
