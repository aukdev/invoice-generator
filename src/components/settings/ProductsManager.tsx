"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Package,
  DollarSign,
  X,
  Check,
} from "lucide-react";
import type { Product } from "@/types";
import {
  getProducts,
  saveProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api";
import { formatNumber } from "@/lib/format";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ProductsManagerProps {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export default function ProductsManager({
  onError,
  onSuccess,
}: ProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ name: "", unit_price: "" });
  const [editProduct, setEditProduct] = useState({ name: "", unit_price: "" });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      onError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) {
      onError("Product name is required");
      return;
    }

    const price = parseFloat(newProduct.unit_price) || 0;

    try {
      const saved = await saveProduct({
        name: newProduct.name.trim(),
        unit_price: price,
        is_active: true,
      });
      setProducts((prev) => [...prev, saved]);
      setNewProduct({ name: "", unit_price: "" });
      setShowAddForm(false);
      onSuccess("Product added");
    } catch (err) {
      onError("Failed to add product");
    }
  };

  const handleUpdateProduct = async (id: string) => {
    if (!editProduct.name.trim()) {
      onError("Product name is required");
      return;
    }

    const price = parseFloat(editProduct.unit_price) || 0;

    try {
      const updated = await updateProduct(id, {
        name: editProduct.name.trim(),
        unit_price: price,
      });
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setEditingId(null);
      onSuccess("Product updated");
    } catch (err) {
      onError("Failed to update product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      onSuccess("Product deleted");
    } catch (err) {
      onError("Failed to delete product");
    }
  };

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditProduct({
      name: product.name,
      unit_price: product.unit_price.toString(),
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditProduct({ name: "", unit_price: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Add Product Button / Form */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-4 border-2 border-dashed border-primary-300 rounded-2xl text-primary-600 font-medium flex items-center justify-center gap-2 active:bg-primary-50"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </button>
      ) : (
        <div className="card-premium space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-neutral-800">New Product</h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewProduct({ name: "", unit_price: "" });
              }}
              className="icon-btn -mr-2"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Product Name"
                className="input-premium pl-12"
                autoFocus
              />
            </div>

            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="number"
                inputMode="decimal"
                value={newProduct.unit_price}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    unit_price: e.target.value,
                  }))
                }
                placeholder="0.00"
                className="input-premium pl-12"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <button onClick={handleAddProduct} className="btn-primary">
            <Check className="w-5 h-5 inline mr-2" />
            Add Product
          </button>
        </div>
      )}

      {/* Products List */}
      <div className="mt-6 space-y-3">
        {products.length === 0 ? (
          <div className="empty-state">
            <Package className="empty-state-icon" />
            <p className="empty-state-title">No products yet</p>
            <p className="empty-state-text">
              Add products to quickly create invoices
            </p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="card-premium">
              {editingId === product.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editProduct.name}
                    onChange={(e) =>
                      setEditProduct((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="input-premium"
                    autoFocus
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    value={editProduct.unit_price}
                    onChange={(e) =>
                      setEditProduct((prev) => ({
                        ...prev,
                        unit_price: e.target.value,
                      }))
                    }
                    className="input-premium"
                    step="0.01"
                    min="0"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUpdateProduct(product.id)}
                      className="flex-1 btn-primary py-3"
                    >
                      <Check className="w-5 h-5 inline mr-1" />
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex-1 btn-secondary py-3"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-neutral-800 truncate">
                      {product.name}
                    </h4>
                    <p className="text-sm text-neutral-500 tabular-nums">
                      $ {formatNumber(product.unit_price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditing(product)}
                      className="icon-btn"
                      aria-label="Edit product"
                    >
                      <Edit3 className="w-5 h-5 text-neutral-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="icon-btn"
                      aria-label="Delete product"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
