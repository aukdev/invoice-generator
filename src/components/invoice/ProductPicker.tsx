"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Check, X } from "lucide-react";
import type { Product, InvoiceItem } from "@/types";
import { getProducts } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { generateUUID } from "@/lib/uuid";
import BottomSheet from "@/components/ui/BottomSheet";
import QuantityStepper from "@/components/ui/QuantityStepper";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ProductPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: InvoiceItem) => void;
  currencySymbol: string;
}

export default function ProductPicker({
  isOpen,
  onClose,
  onSelect,
  currencySymbol,
}: ProductPickerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closing
      setSearch("");
      setSelectedProduct(null);
      setQuantity(1);
    }
  }, [isOpen]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const searchLower = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(searchLower));
  }, [products, search]);

  const handleConfirm = () => {
    if (!selectedProduct) return;

    const item: InvoiceItem = {
      id: generateUUID(),
      product_id: selectedProduct.id,
      item_name: selectedProduct.name,
      unit_price: selectedProduct.unit_price,
      quantity,
      line_total: selectedProduct.unit_price * quantity,
    };

    onSelect(item);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Add Item"
      height="full"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : selectedProduct ? (
        // Quantity selection view
        <div className="space-y-6">
          {/* Selected Product Info */}
          <div className="card-dark text-center">
            <h3 className="text-lg font-semibold text-white">
              {selectedProduct.name}
            </h3>
            <p className="text-white/60 mt-1 tabular-nums">
              {formatCurrency(selectedProduct.unit_price, currencySymbol)} each
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-3">
            <label className="label text-center block">Quantity</label>
            <div className="flex justify-center">
              <QuantityStepper value={quantity} onChange={setQuantity} />
            </div>
          </div>

          {/* Line Total Preview */}
          <div className="bg-primary-900 rounded-2xl p-6 text-center">
            <p className="text-sm text-white/60 font-medium uppercase tracking-wide">
              Line Total
            </p>
            <p className="text-4xl font-bold text-gradient-gold mt-2 tabular-nums">
              {formatCurrency(
                selectedProduct.unit_price * quantity,
                currencySymbol,
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3 pb-4">
            <button onClick={handleConfirm} className="btn-primary">
              <Check className="w-5 h-5 inline mr-2" />
              Add to Invoice
            </button>
            <button
              onClick={() => {
                setSelectedProduct(null);
                setQuantity(1);
              }}
              className="btn-secondary"
            >
              Choose Different Item
            </button>
          </div>
        </div>
      ) : (
        // Product selection view
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input-premium pl-12"
              autoFocus
            />
          </div>

          {/* Products List */}
          <div className="space-y-2 pb-4">
            {filteredProducts.length === 0 ? (
              <div className="empty-state py-8">
                <p className="empty-state-title">No products found</p>
                <p className="empty-state-text">
                  {products.length === 0
                    ? "Add products in Settings first"
                    : "Try a different search term"}
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="w-full card-elevated flex items-center justify-between active:scale-[0.98] transition-transform"
                >
                  <div className="text-left">
                    <h4 className="font-semibold text-primary-900">
                      {product.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-primary-800 tabular-nums text-lg">
                      {formatCurrency(product.unit_price, currencySymbol)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
