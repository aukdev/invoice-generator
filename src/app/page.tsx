"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Settings,
  Plus,
  ShoppingBag,
  User,
  MapPin,
  Phone,
  FileText,
  RotateCcw,
  Hash,
} from "lucide-react";
import type { CompanySettings, Customer, InvoiceItem, Invoice } from "@/types";
import {
  getCompanySettings,
  generateInvoiceNumber,
  saveInvoice,
} from "@/lib/api";

// Components
import SettingsSheet from "@/components/settings/SettingsSheet";
import ProductPicker from "@/components/invoice/ProductPicker";
import InvoiceItemRow from "@/components/invoice/InvoiceItemRow";
import InvoiceTotals from "@/components/invoice/InvoiceTotals";
import PDFGenerator from "@/components/pdf/PDFGenerator";
import ToastContainer, { useToast } from "@/components/ui/Toast";
import { LoadingScreen, LoadingOverlay } from "@/components/ui/LoadingSpinner";
import BottomSheet from "@/components/ui/BottomSheet";

export default function HomePage() {
  // State
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    address: "",
    phone: "",
  });
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [orderNumber, setOrderNumber] = useState("");

  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(
    null,
  );

  // Toast
  const toast = useToast();

  // Load company settings
  useEffect(() => {
    loadCompanySettings();
  }, []);

  const loadCompanySettings = async () => {
    try {
      const data = await getCompanySettings();
      setCompany(data);
    } catch (err) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.line_total, 0);
  }, [items]);

  const total = useMemo(() => {
    return subtotal + deliveryFee;
  }, [subtotal, deliveryFee]);

  // Item handlers
  const handleAddItem = useCallback(
    (item: InvoiceItem) => {
      setItems((prev) => [...prev, item]);
      toast.success("Item added");
    },
    [toast],
  );

  const handleUpdateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            quantity,
            line_total: item.unit_price * quantity,
          };
        }
        return item;
      }),
    );
  }, []);

  const handleRemoveItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.info("Item removed");
    },
    [toast],
  );

  // Generate Invoice
  const handleGenerateInvoice = async () => {
    // Validation
    if (!customer.name.trim()) {
      toast.error("Customer name is required");
      return;
    }

    if (items.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    setProcessing(true);
    try {
      const invoiceNumber = await generateInvoiceNumber();

      const invoice: Invoice = {
        invoice_number: invoiceNumber,
        invoice_date: new Date().toISOString().split("T")[0],
        order_number: orderNumber || undefined,
        customer_name: customer.name,
        customer_address: customer.address,
        customer_phone: customer.phone,
        company_name: company?.company_name,
        company_address: company?.company_address,
        company_phone: company?.phone_number,
        company_logo_url: company?.logo_url,
        items,
        subtotal,
        delivery_fee: deliveryFee,
        total_amount: total,
        currency_symbol: company?.currency_symbol || "$",
        footer_note: company?.footer_note,
        status: "draft",
      };

      // Save to database
      await saveInvoice(invoice);

      setGeneratedInvoice(invoice);
      setShowPreview(true);
    } catch (err) {
      console.error("Failed to generate invoice:", err);
      toast.error("Failed to generate invoice");
    } finally {
      setProcessing(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setCustomer({ name: "", address: "", phone: "" });
    setItems([]);
    setDeliveryFee(0);
    setOrderNumber("");
    setGeneratedInvoice(null);
    setShowPreview(false);
    toast.success("Form cleared");
  };

  // Handle settings close and refresh
  const handleSettingsClose = () => {
    setShowSettings(false);
    loadCompanySettings();
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-surface-50 pb-safe">
      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />

      {/* Processing Overlay */}
      {processing && <LoadingOverlay />}

      {/* Header - Dark Premium */}
      <header className="header-dark pt-safe">
        <div className="flex items-center justify-between px-5 py-4">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt="Logo"
                className="w-10 h-10 object-contain rounded-xl bg-white/10 p-1"
              />
            ) : (
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h1 className="font-semibold text-white leading-tight">
                {company?.company_name || "Invoice"}
              </h1>
              <p className="text-xs text-white/60">Create Invoice</p>
            </div>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="icon-btn-dark"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 py-6 space-y-6 bg-pattern">
        {/* Customer Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-primary-600" />
            <h2 className="section-title">Customer Details</h2>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={customer.name}
              onChange={(e) =>
                setCustomer((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Customer Name *"
              className="input-premium"
            />

            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-5 h-5 text-neutral-400" />
              <textarea
                value={customer.address || ""}
                onChange={(e) =>
                  setCustomer((prev) => ({ ...prev, address: e.target.value }))
                }
                placeholder="Customer Address (optional)"
                rows={2}
                className="input-premium pl-12 resize-none"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="tel"
                value={customer.phone || ""}
                onChange={(e) =>
                  setCustomer((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="Customer Phone (optional)"
                className="input-premium pl-12"
              />
            </div>

            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Order Number (optional)"
                className="input-premium pl-12"
              />
            </div>
          </div>
        </section>

        {/* Items Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary-600" />
              <h2 className="section-title">Invoice Items</h2>
              {items.length > 0 && (
                <span className="badge badge-dark">{items.length}</span>
              )}
            </div>
          </div>

          {/* Items List */}
          {items.length === 0 ? (
            <div className="card-elevated py-12">
              <div className="empty-state py-0">
                <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-surface-400" />
                </div>
                <p className="empty-state-title">No items added</p>
                <p className="empty-state-text mb-6">
                  Start by adding products to your invoice
                </p>
                <button
                  onClick={() => setShowProductPicker(true)}
                  className="btn-primary max-w-[200px] mx-auto"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Add Item
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <InvoiceItemRow
                  key={item.id}
                  item={item}
                  currencySymbol={company?.currency_symbol || "$"}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}

              {/* Add More Button */}
              <button
                onClick={() => setShowProductPicker(true)}
                className="w-full py-4 border-2 border-dashed border-surface-300 rounded-2xl text-primary-700 font-medium flex items-center justify-center gap-2 active:bg-surface-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Another Item
              </button>
            </div>
          )}
        </section>

        {/* Totals Section */}
        {items.length > 0 && (
          <section>
            <InvoiceTotals
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              total={total}
              currencySymbol={company?.currency_symbol || "$"}
              onDeliveryFeeChange={setDeliveryFee}
            />
          </section>
        )}

        {/* Action Buttons */}
        {items.length > 0 && (
          <section className="space-y-3 pt-4">
            <button
              onClick={handleGenerateInvoice}
              disabled={processing}
              className="btn-primary text-lg py-5"
            >
              <FileText className="w-5 h-5 inline mr-2" />
              Generate Invoice
            </button>

            <button
              onClick={handleReset}
              className="btn-ghost w-full flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear & Start Over
            </button>
          </section>
        )}
      </main>

      {/* Settings Bottom Sheet */}
      <SettingsSheet
        isOpen={showSettings}
        onClose={handleSettingsClose}
        onSuccess={toast.success}
        onError={toast.error}
      />

      {/* Product Picker Bottom Sheet */}
      <ProductPicker
        isOpen={showProductPicker}
        onClose={() => setShowProductPicker(false)}
        onSelect={handleAddItem}
        currencySymbol={company?.currency_symbol || "$"}
      />

      {/* Invoice Preview Bottom Sheet */}
      <BottomSheet
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Invoice Ready"
        height="auto"
      >
        {generatedInvoice && company && (
          <div className="space-y-6 pb-6">
            {/* Success Icon */}
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-900/30">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-primary-900">
                Invoice Created!
              </h3>
              <p className="text-surface-500 mt-1">
                {generatedInvoice.invoice_number}
              </p>
            </div>

            {/* Invoice Summary */}
            <div className="card-dark">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Customer</span>
                  <span className="font-medium text-white">
                    {generatedInvoice.customer_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Items</span>
                  <span className="font-medium text-white">
                    {generatedInvoice.items.length}
                  </span>
                </div>
                <div className="divider-dark opacity-30" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-gradient-gold tabular-nums">
                    {company.currency_symbol}
                    {generatedInvoice.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* PDF Actions */}
            <PDFGenerator
              invoice={generatedInvoice}
              company={company}
              onSuccess={toast.success}
              onError={toast.error}
            />

            {/* Create Another */}
            <button
              onClick={() => {
                setShowPreview(false);
                handleReset();
              }}
              className="btn-ghost w-full"
            >
              Create Another Invoice
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
