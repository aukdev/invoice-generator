"use client";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Invoice, CompanySettings } from "@/types";

// Use built-in Helvetica font (always available, no network required)
// Helvetica is a clean, professional sans-serif font perfect for invoices

// Hyphenation callback to prevent word breaks
Font.registerHyphenationCallback((word) => [word]);

// Format number with thousand separators (e.g., 1,450.00)
const formatCurrency = (amount: number, symbol: string): string => {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol} ${formatted}`;
};

// Premium DARK color palette - Sophisticated charcoal theme
const colors = {
  primary: "#171717", // Near black
  primaryLight: "#F5F5F5", // Light gray for highlights
  accent: "#D4AF37", // Gold accent
  dark: "#0A0A0A", // Deep black
  text: "#404040", // Dark gray text
  textLight: "#737373", // Muted gray
  border: "#E5E5E5", // Light border
  background: "#FAFAFA", // Off-white background
  white: "#FFFFFF", // Pure white
};

// Premium stylesheet
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    backgroundColor: colors.white,
    color: colors.text,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoContainer: {
    width: 100,
    height: 60,
  },
  logo: {
    maxWidth: 100,
    maxHeight: 60,
    objectFit: "contain",
  },
  companyInfo: {
    textAlign: "right",
    maxWidth: 200,
  },
  companyName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
    marginBottom: 4,
  },
  companyDetail: {
    fontSize: 9,
    color: colors.textLight,
    marginBottom: 2,
    lineHeight: 1.4,
  },
  // Invoice Title & Meta
  invoiceMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  invoiceTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    letterSpacing: -0.5,
  },
  invoiceDetails: {
    textAlign: "right",
  },
  invoiceLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  invoiceValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
    marginBottom: 8,
  },
  // Customer Section
  customerSection: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  customerName: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
    marginBottom: 4,
  },
  customerDetail: {
    fontSize: 10,
    color: colors.text,
    marginBottom: 2,
    lineHeight: 1.4,
  },
  // Items Table
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  tableRowAlt: {
    backgroundColor: colors.background,
  },
  colItem: {
    flex: 2.5,
  },
  colPrice: {
    flex: 1.2,
    textAlign: "right",
  },
  colQty: {
    flex: 0.5,
    textAlign: "center",
  },
  colTotal: {
    flex: 1.3,
    textAlign: "right",
  },
  itemName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
  },
  itemDetail: {
    fontSize: 9,
    color: colors.textLight,
    marginTop: 2,
  },
  cellText: {
    fontSize: 10,
    color: colors.text,
  },
  cellTextBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
  },
  // Totals Section - Full width matching table
  totalsContainer: {
    marginBottom: 40,
  },
  totalRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  totalRowFinal: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.primaryLight,
    borderRadius: 6,
    marginTop: 4,
  },
  // Empty space to align with item column
  totalSpacer: {
    flex: 2.5,
  },
  totalLabel: {
    flex: 1.7,
    fontSize: 10,
    color: colors.text,
    textAlign: "right",
    paddingRight: 10,
  },
  totalValue: {
    flex: 1.3,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
    textAlign: "right",
  },
  grandTotalLabel: {
    flex: 1.7,
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    textAlign: "right",
    paddingRight: 10,
  },
  grandTotalValue: {
    flex: 1.3,
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    textAlign: "right",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 10,
    color: colors.textLight,
    fontStyle: "italic",
  },
  footerMeta: {
    fontSize: 8,
    color: colors.textLight,
    marginTop: 8,
  },
  // Decorative accent bar
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.primary,
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
  company: CompanySettings;
}

export default function InvoicePDF({ invoice, company }: InvoicePDFProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Decorative accent bar at top */}
        <View style={styles.accentBar} fixed />

        {/* Header with Logo and Company Info */}
        <View style={styles.header}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            {company.logo_url ? (
              <Image src={company.logo_url} style={styles.logo} />
            ) : (
              <Text style={styles.companyName}>{company.company_name}</Text>
            )}
          </View>

          {/* Company Information */}
          <View style={styles.companyInfo}>
            {company.logo_url && (
              <Text style={styles.companyName}>{company.company_name}</Text>
            )}
            {company.company_address && (
              <Text style={styles.companyDetail}>
                {company.company_address}
              </Text>
            )}
            {company.phone_number && (
              <Text style={styles.companyDetail}>{company.phone_number}</Text>
            )}
          </View>
        </View>

        {/* Invoice Title and Meta */}
        <View style={styles.invoiceMeta}>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <View style={styles.invoiceDetails}>
            <Text style={styles.invoiceLabel}>Invoice Number</Text>
            <Text style={styles.invoiceValue}>{invoice.invoice_number}</Text>
            <Text style={styles.invoiceLabel}>Date</Text>
            <Text style={styles.invoiceValue}>
              {formatDate(invoice.invoice_date)}
            </Text>
            {invoice.order_number && (
              <>
                <Text style={styles.invoiceLabel}>Order Number</Text>
                <Text style={styles.invoiceValue}>{invoice.order_number}</Text>
              </>
            )}
          </View>
        </View>

        {/* Customer Section */}
        <View style={styles.customerSection}>
          <Text style={styles.sectionLabel}>Bill To</Text>
          <Text style={styles.customerName}>{invoice.customer_name}</Text>
          {invoice.customer_address && (
            <Text style={styles.customerDetail}>
              {invoice.customer_address}
            </Text>
          )}
          {invoice.customer_phone && (
            <Text style={styles.customerDetail}>{invoice.customer_phone}</Text>
          )}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colItem]}>Item</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Price</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
          </View>

          {/* Table Rows */}
          {invoice.items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.tableRow,
                ...(index % 2 === 1 ? [styles.tableRowAlt] : []),
              ]}
            >
              <View style={styles.colItem}>
                <Text style={styles.itemName}>{item.item_name}</Text>
              </View>
              <Text style={[styles.cellText, styles.colPrice]}>
                {formatCurrency(item.unit_price, invoice.currency_symbol)}
              </Text>
              <Text style={[styles.cellText, styles.colQty]}>
                {item.quantity}
              </Text>
              <Text style={[styles.cellTextBold, styles.colTotal]}>
                {formatCurrency(item.line_total, invoice.currency_symbol)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals - Full width matching table structure */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <View style={styles.totalSpacer} />
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.subtotal, invoice.currency_symbol)}
            </Text>
          </View>
          {invoice.delivery_fee > 0 && (
            <View style={styles.totalRow}>
              <View style={styles.totalSpacer} />
              <Text style={styles.totalLabel}>Delivery Fee</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(invoice.delivery_fee, invoice.currency_symbol)}
              </Text>
            </View>
          )}
          <View style={styles.totalRowFinal}>
            <View style={styles.totalSpacer} />
            <Text style={styles.grandTotalLabel}>Total Due</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(invoice.total_amount, invoice.currency_symbol)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {company.footer_note || "Thank you for your business!"}
          </Text>
          <Text style={styles.footerMeta}>
            Invoice {invoice.invoice_number} • Generated on{" "}
            {formatDate(new Date().toISOString())}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
