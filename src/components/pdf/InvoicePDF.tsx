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
    paddingTop: 50,
    paddingBottom: 80,
    paddingHorizontal: 50,
    backgroundColor: colors.white,
    color: colors.text,
    position: "relative",
  },
  // Decorative corner elements - Outer Layer
  cornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 90,
    height: 90,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.accent,
    borderBottomRightRadius: 45,
  },
  cornerTopLeftInner: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 50,
    height: 50,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.accent,
    borderBottomRightRadius: 25,
  },
  cornerTopLeftDot: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 6,
    height: 6,
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  cornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 90,
    height: 90,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.accent,
    borderBottomLeftRadius: 45,
  },
  cornerTopRightInner: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 50,
    height: 50,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.accent,
    borderBottomLeftRadius: 25,
  },
  cornerTopRightDot: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 6,
    height: 6,
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 90,
    height: 90,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: colors.accent,
    borderTopRightRadius: 45,
  },
  cornerBottomLeftInner: {
    position: "absolute",
    bottom: 8,
    left: 8,
    width: 50,
    height: 50,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: colors.accent,
    borderTopRightRadius: 25,
  },
  cornerBottomLeftDot: {
    position: "absolute",
    bottom: 20,
    left: 20,
    width: 6,
    height: 6,
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 90,
    height: 90,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderColor: colors.accent,
    borderTopLeftRadius: 45,
  },
  cornerBottomRightInner: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 50,
    height: 50,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: colors.accent,
    borderTopLeftRadius: 25,
  },
  cornerBottomRightDot: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 6,
    height: 6,
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  // Side line decorations for each corner
  cornerTopLeftLineH: {
    position: "absolute",
    top: 35,
    left: 0,
    width: 25,
    height: 1,
    backgroundColor: colors.accent,
  },
  cornerTopLeftLineV: {
    position: "absolute",
    top: 0,
    left: 35,
    width: 1,
    height: 25,
    backgroundColor: colors.accent,
  },
  cornerTopRightLineH: {
    position: "absolute",
    top: 35,
    right: 0,
    width: 25,
    height: 1,
    backgroundColor: colors.accent,
  },
  cornerTopRightLineV: {
    position: "absolute",
    top: 0,
    right: 35,
    width: 1,
    height: 25,
    backgroundColor: colors.accent,
  },
  cornerBottomLeftLineH: {
    position: "absolute",
    bottom: 35,
    left: 0,
    width: 25,
    height: 1,
    backgroundColor: colors.accent,
  },
  cornerBottomLeftLineV: {
    position: "absolute",
    bottom: 0,
    left: 35,
    width: 1,
    height: 25,
    backgroundColor: colors.accent,
  },
  cornerBottomRightLineH: {
    position: "absolute",
    bottom: 35,
    right: 0,
    width: 25,
    height: 1,
    backgroundColor: colors.accent,
  },
  cornerBottomRightLineV: {
    position: "absolute",
    bottom: 0,
    right: 35,
    width: 1,
    height: 25,
    backgroundColor: colors.accent,
  },
  // Small diamond accent for corners
  cornerDiamond: {
    width: 8,
    height: 8,
    backgroundColor: colors.accent,
    transform: "rotate(45deg)",
  },
  cornerTopLeftDiamond: {
    position: "absolute",
    top: 55,
    left: 55,
    width: 8,
    height: 8,
    backgroundColor: colors.accent,
    transform: "rotate(45deg)",
  },
  cornerTopRightDiamond: {
    position: "absolute",
    top: 55,
    right: 55,
    width: 8,
    height: 8,
    backgroundColor: colors.accent,
    transform: "rotate(45deg)",
  },
  cornerBottomLeftDiamond: {
    position: "absolute",
    bottom: 55,
    left: 55,
    width: 8,
    height: 8,
    backgroundColor: colors.accent,
    transform: "rotate(45deg)",
  },
  cornerBottomRightDiamond: {
    position: "absolute",
    bottom: 55,
    right: 55,
    width: 8,
    height: 8,
    backgroundColor: colors.accent,
    transform: "rotate(45deg)",
  },
  // Accent line at top
  accentBar: {
    position: "absolute",
    top: 0,
    left: 80,
    right: 80,
    height: 4,
    backgroundColor: colors.primary,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 35,
    paddingBottom: 20,
    marginTop: 10,
  },
  // Circular Logo Container
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.background,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: "cover",
    borderRadius: 30,
  },
  logoPlaceholder: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },
  companyInfo: {
    textAlign: "right",
    maxWidth: 220,
  },
  companyName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
    marginBottom: 6,
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
    alignItems: "flex-start",
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  invoiceTitleContainer: {
    flexDirection: "column",
  },
  invoiceTitle: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    letterSpacing: -1,
  },
  invoiceSubtitle: {
    fontSize: 9,
    color: colors.accent,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 3,
    marginTop: 4,
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
  // Prevent row from breaking across pages
  tableRowWrapper: {
    break: false,
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
  // minPresenceAhead ensures totals stay with at least some content
  totalsContainer: {
    marginBottom: 40,
    break: false,
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
  // Footer - Premium styled
  footer: {
    position: "absolute",
    bottom: 50,
    left: 50,
    right: 50,
    textAlign: "center",
  },
  footerDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 15,
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 10,
    color: colors.accent,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    flex: 1,
  },
  footerMeta: {
    fontSize: 8,
    color: colors.textLight,
    marginTop: 10,
  },
  // Decorative diamond shape for footer
  footerDiamond: {
    width: 8,
    height: 8,
    backgroundColor: colors.accent,
    transform: "rotate(45deg)",
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

  // Get company initials for logo placeholder
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Decorative Corner Elements - Multi-layer Design */}
        {/* Top Left Corner */}
        <View style={styles.cornerTopLeft} fixed />
        <View style={styles.cornerTopLeftInner} fixed />
        <View style={styles.cornerTopLeftDot} fixed />
        <View style={styles.cornerTopLeftLineH} fixed />
        <View style={styles.cornerTopLeftLineV} fixed />
        <View style={styles.cornerTopLeftDiamond} fixed />

        {/* Bottom Left Corner */}
        <View style={styles.cornerBottomLeft} fixed />
        <View style={styles.cornerBottomLeftInner} fixed />
        <View style={styles.cornerBottomLeftDot} fixed />
        <View style={styles.cornerBottomLeftLineH} fixed />
        <View style={styles.cornerBottomLeftLineV} fixed />
        <View style={styles.cornerBottomLeftDiamond} fixed />

        {/* Bottom Right Corner */}
        <View style={styles.cornerBottomRight} fixed />
        <View style={styles.cornerBottomRightInner} fixed />
        <View style={styles.cornerBottomRightDot} fixed />
        <View style={styles.cornerBottomRightLineH} fixed />
        <View style={styles.cornerBottomRightLineV} fixed />
        <View style={styles.cornerBottomRightDiamond} fixed />

        {/* Accent Bar at top */}
        <View style={styles.accentBar} fixed />

        {/* Header with Circular Logo and Company Info */}
        <View style={styles.header}>
          {/* Circular Logo */}
          <View style={styles.logoContainer}>
            {company.logo_url ? (
              <Image src={company.logo_url} style={styles.logo} />
            ) : (
              <Text style={styles.logoPlaceholder}>
                {getInitials(company.company_name || "CO")}
              </Text>
            )}
          </View>

          {/* Company Information */}
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{company.company_name}</Text>
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
          <View style={styles.invoiceTitleContainer}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceSubtitle}>Tax Invoice / Receipt</Text>
          </View>
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
          {/* Table Header - Fixed to appear on every page */}
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.tableHeaderText, styles.colItem]}>Item</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Price</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
          </View>

          {/* Table Rows - Each row wrapped to prevent breaking mid-row */}
          {invoice.items.map((item, index) => (
            <View key={item.id} style={styles.tableRowWrapper} wrap={false}>
              <View
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
            </View>
          ))}
        </View>

        {/* Totals - Full width matching table structure */}
        {/* wrap=false ensures all totals stay together on the same page */}
        <View style={styles.totalsContainer} wrap={false}>
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

        {/* Premium Footer */}
        <View style={styles.footer} fixed>
          <View style={styles.footerDivider} />
          <View style={styles.footerContent}>
            <View style={styles.footerDiamond} />
            <Text style={styles.footerText}>
              {company.footer_note || "Thank you for your business!"}
            </Text>
            <View style={styles.footerDiamond} />
          </View>
          <Text style={styles.footerMeta}>
            Invoice {invoice.invoice_number} • Generated on{" "}
            {formatDate(new Date().toISOString())}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
