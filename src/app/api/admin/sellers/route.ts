import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, createAdminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    // Verify admin access (checks token + admin role)
    const adminResult = await verifyAdmin(req);
    if (!adminResult) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    // Use service_role client to bypass RLS for admin queries
    const supabase = createAdminClient();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = supabase
      .from("seller_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,shop_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ sellers: data || [] });
  } catch (err: any) {
    // If service_role key is missing, give a clear error
    if (err?.message?.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return NextResponse.json({ error: "Server configuration error: SUPABASE_SERVICE_ROLE_KEY not set" }, { status: 500 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
