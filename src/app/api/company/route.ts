import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role key
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Get company settings
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("company_settings")
      .select("*")
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return NextResponse.json(
      data || {
        company_name: "",
        company_address: "",
        phone_number: "",
        logo_url: "",
        footer_note: "Thank you for your business!",
        currency_symbol: "$",
      },
    );
  } catch (error) {
    console.error("Get company settings error:", error);
    return NextResponse.json(
      { error: "Failed to get company settings" },
      { status: 500 },
    );
  }
}

// POST/PUT - Save company settings
export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();

    // Check if settings exist
    const { data: existing } = await supabase
      .from("company_settings")
      .select("id")
      .limit(1)
      .single();

    let result;
    if (existing?.id) {
      // Update existing
      const { data, error } = await supabase
        .from("company_settings")
        .update(settings)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from("company_settings")
        .insert(settings)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Save company settings error:", error);
    return NextResponse.json(
      { error: "Failed to save company settings" },
      { status: 500 },
    );
  }
}
