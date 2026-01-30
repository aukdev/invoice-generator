"use client";

import { formatCurrency } from "@/lib/format";

interface InvoiceTotalsProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
  currencySymbol: string;
  onDeliveryFeeChange: (fee: number) => void;
}

export default function InvoiceTotals({
  subtotal,
  deliveryFee,
  total,
  currencySymbol,
  onDeliveryFeeChange,
}: InvoiceTotalsProps) {
  return (
    <div className="card-elevated space-y-4">
      {/* Delivery Fee Input */}
      <div className="flex items-center justify-between">
        <span className="text-surface-600 font-medium">Delivery Fee</span>
        <div className="relative w-32">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
            {currencySymbol}
          </span>
          <input
            type="number"
            inputMode="decimal"
            value={deliveryFee || ""}
            onChange={(e) =>
              onDeliveryFeeChange(parseFloat(e.target.value) || 0)
            }
            placeholder="0.00"
            className="w-full px-3 py-2.5 pl-7 text-right bg-surface-100 rounded-xl border-0 focus:ring-2 focus:ring-primary-900/10 tabular-nums font-medium"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <div className="divider" />

      {/* Subtotal */}
      <div className="flex items-center justify-between text-surface-600">
        <span>Subtotal</span>
        <span className="font-semibold tabular-nums text-primary-800">
          {formatCurrency(subtotal, currencySymbol)}
        </span>
      </div>

      {/* Delivery */}
      {deliveryFee > 0 && (
        <div className="flex items-center justify-between text-surface-600">
          <span>Delivery</span>
          <span className="font-semibold tabular-nums text-primary-800">
            {formatCurrency(deliveryFee, currencySymbol)}
          </span>
        </div>
      )}

      <div className="divider" />

      {/* Grand Total - Dark Premium Style */}
      <div className="bg-primary-900 rounded-2xl p-4 flex items-center justify-between">
        <span className="text-lg font-semibold text-white">Total</span>
        <span className="text-2xl font-bold text-gradient-gold tabular-nums">
          {formatCurrency(total, currencySymbol)}
        </span>
      </div>
    </div>
  );
}
