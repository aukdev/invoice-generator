// TypeScript types for the Invoice Generator app

export interface CompanySettings {
  id?: string;
  company_name: string;
  company_address: string;
  phone_number: string;
  logo_url?: string;
  email?: string;
  website?: string;
  tax_id?: string;
  footer_note: string;
  currency_symbol: string;
  currency_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  unit_price: number;
  description?: string;
  category?: string;
  sku?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id?: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  is_favorite?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  id: string;
  product_id?: string;
  item_name: string;
  item_description?: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  sort_order?: number;
}

export interface Invoice {
  id?: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  order_number?: string;
  // Customer info
  customer_id?: string;
  customer_name: string;
  customer_address?: string;
  customer_phone?: string;
  // Company snapshot
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_logo_url?: string;
  // Items
  items: InvoiceItem[];
  // Financials
  subtotal: number;
  delivery_fee: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  // Meta
  currency_symbol: string;
  status?: "draft" | "sent" | "paid" | "cancelled";
  notes?: string;
  footer_note?: string;
  created_at?: string;
  updated_at?: string;
}

// Form state for invoice creation
export interface InvoiceFormState {
  customer: Customer;
  items: InvoiceItem[];
  deliveryFee: number;
}

// For the product picker
export interface SelectedProduct extends Product {
  quantity: number;
  line_total: number;
}

// Settings tabs
export type SettingsTab = "company" | "products";

// Toast notification types
export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
