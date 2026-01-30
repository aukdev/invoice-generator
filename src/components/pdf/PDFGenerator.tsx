"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { FileDown, Share2 } from "lucide-react";
import type { Invoice, CompanySettings } from "@/types";
import InvoicePDF from "./InvoicePDF";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface PDFGeneratorProps {
  invoice: Invoice;
  company: CompanySettings;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function PDFGenerator({
  invoice,
  company,
  onSuccess,
  onError,
}: PDFGeneratorProps) {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async (): Promise<Blob> => {
    const doc = <InvoicePDF invoice={invoice} company={company} />;
    const blob = await pdf(doc).toBlob();
    return blob;
  };

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const blob = await generatePDF();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onSuccess("Invoice downloaded");
    } catch (err) {
      console.error("PDF generation error:", err);
      onError("Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    setGenerating(true);
    try {
      const blob = await generatePDF();
      const file = new File([blob], `${invoice.invoice_number}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Invoice ${invoice.invoice_number}`,
          text: `Invoice from ${company.company_name}`,
        });
        onSuccess("Invoice shared");
      } else {
        // Fallback to download
        handleDownload();
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Share error:", err);
        onError("Failed to share");
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={generating}
        className="btn-primary flex items-center justify-center gap-3"
      >
        {generating ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            <FileDown className="w-5 h-5" />
            Download Invoice PDF
          </>
        )}
      </button>

      {/* Share Button (mobile-friendly) */}
      <button
        onClick={handleShare}
        disabled={generating}
        className="btn-secondary flex items-center justify-center gap-3"
      >
        <Share2 className="w-5 h-5" />
        Share via WhatsApp
      </button>
    </div>
  );
}
