// =============================================
// API CLIENT - All data operations via Backend API
// =============================================
// No direct Supabase calls from client
// No localStorage - database only
// =============================================

import type { CompanySettings, Product, Invoice, Customer } from "@/types";

// =============================================
// COMPANY SETTINGS
// =============================================
const DEFAULT_COMPANY: CompanySettings = {
  company_name: "",
  company_address: "",
  phone_number: "",
  logo_url: "",
  footer_note: "Thank you for your business!",
  currency_symbol: "$",
};

export const getCompanySettings = async (): Promise<CompanySettings> => {
  try {
    const response = await fetch("/api/company");
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Get company settings error:", error);
    return DEFAULT_COMPANY;
  }
};

export const saveCompanySettings = async (
  settings: CompanySettings,
): Promise<CompanySettings> => {
  const response = await fetch("/api/company", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to save");
  }

  return response.json();
};

// =============================================
// PRODUCTS
// =============================================
export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch("/api/products");
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Get products error:", error);
    return [];
  }
};

export const saveProduct = async (
  product: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<Product> => {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to save");
  }

  return response.json();
};

export const updateProduct = async (
  id: string,
  product: Partial<Product>,
): Promise<Product> => {
  const response = await fetch("/api/products", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...product }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update");
  }

  return response.json();
};

export const deleteProduct = async (id: string): Promise<void> => {
  const response = await fetch(`/api/products?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete");
  }
};

// =============================================
// CUSTOMERS
// =============================================
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await fetch("/api/customers");
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Get customers error:", error);
    return [];
  }
};

export const saveCustomer = async (customer: Customer): Promise<Customer> => {
  const response = await fetch("/api/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to save");
  }

  return response.json();
};

// =============================================
// INVOICES
// =============================================
export const generateInvoiceNumber = async (): Promise<string> => {
  try {
    const response = await fetch("/api/invoices?action=generate-number");
    if (!response.ok) throw new Error("Failed to generate");
    const data = await response.json();
    return data.invoice_number;
  } catch (error) {
    console.error("Generate invoice number error:", error);
    // Fallback
    return `INV-${Date.now()}`;
  }
};

export const saveInvoice = async (invoice: Invoice): Promise<Invoice> => {
  const response = await fetch("/api/invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invoice),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to save invoice");
  }

  return response.json();
};

export const getInvoices = async (): Promise<Invoice[]> => {
  try {
    const response = await fetch("/api/invoices");
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Get invoices error:", error);
    return [];
  }
};

// =============================================
// LOGO UPLOAD
// =============================================
export const uploadLogo = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }

  const data = await response.json();
  return data.url;
};
