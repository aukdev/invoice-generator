"use client";

import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 999,
}: QuantityStepperProps) {
  const decrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const increase = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="qty-stepper">
      <button
        type="button"
        onClick={decrease}
        disabled={value <= min}
        className="qty-btn disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        <Minus className="w-5 h-5" />
      </button>

      <span className="qty-value tabular-nums" aria-live="polite">
        {value}
      </span>

      <button
        type="button"
        onClick={increase}
        disabled={value >= max}
        className="qty-btn disabled:opacity-40"
        aria-label="Increase quantity"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}
