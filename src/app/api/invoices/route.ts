import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Get all invoices or generate invoice number
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // Generate new invoice number
    if (action === "generate-number") {
      const { data, error } = await supabase.rpc("generate_invoice_number");

      if (error) {
        // Fallback to timestamp-based number
        const timestamp = Date.now();
        return NextResponse.json({ invoice_number: `INV-${timestamp}` });
      }

      return NextResponse.json({ invoice_number: data });
    }

    // Get all invoices
    const { data, error } = await supabase
      .from("invoices")
      .select(
        `
        *,
        invoice_items (*)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    const invoices =
      data?.map((inv) => ({
        ...inv,
        items: inv.invoice_items || [],
      })) || [];

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Get invoices error:", error);
    return NextResponse.json(
      { error: "Failed to get invoices" },
      { status: 500 },
    );
  }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const invoice = await request.json();
    const { items, ...invoiceData } = invoice;

    // Save invoice header
    const { data: savedInvoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert(invoiceData)
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Save invoice items if any
    if (items && items.length > 0) {
      const itemsWithInvoiceId = items.map((item: any, index: number) => ({
        invoice_id: savedInvoice.id,
        product_id: item.product_id || null,
        item_name: item.item_name,
        item_description: item.item_description || null,
        unit_price: item.unit_price,
        quantity: item.quantity,
        line_total: item.line_total,
        sort_order: index,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsWithInvoiceId);

      if (itemsError) throw itemsError;
    }

    return NextResponse.json({ ...savedInvoice, items });
  } catch (error) {
    console.error("Save invoice error:", error);
    return NextResponse.json(
      { error: "Failed to save invoice" },
      { status: 500 },
    );
  }
}

// PUT - Update invoice status
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("invoices")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Update invoice error:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 },
    );
  }
}

// DELETE - Delete invoice
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID required" },
        { status: 400 },
      );
    }

    // Items will be deleted automatically due to ON DELETE CASCADE
    const { error } = await supabase.from("invoices").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete invoice error:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 },
    );
  }
}
