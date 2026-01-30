"use client";

import { Trash2 } from "lucide-react";
import type { InvoiceItem } from "@/types";
import QuantityStepper from "@/components/ui/QuantityStepper";
import { formatCurrency, formatNumber } from "@/lib/format";

interface InvoiceItemRowProps {
  item: InvoiceItem;
  currencySymbol: string;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function InvoiceItemRow({
  item,
  currencySymbol,
  onUpdateQuantity,
  onRemove,
}: InvoiceItemRowProps) {
  return (
    <div className="card-elevated">
      <div className="flex items-start justify-between gap-3">
        {/* Item Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-primary-900 truncate">
            {item.item_name}
          </h4>
          <p className="text-sm text-surface-500 tabular-nums mt-0.5">
            {currencySymbol} {formatNumber(item.unit_price)} × {item.quantity}
          </p>
        </div>

        {/* Line Total */}
        <div className="text-right">
          <p className="font-bold text-primary-900 tabular-nums text-lg">
            {formatCurrency(item.line_total, currencySymbol)}
          </p>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-100">
        <QuantityStepper
          value={item.quantity}
          onChange={(qty) => onUpdateQuantity(item.id, qty)}
        />

        <button
          onClick={() => onRemove(item.id)}
          className="btn-danger flex items-center gap-2"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
          Remove
        </button>
      </div>
    </div>
  );
}
