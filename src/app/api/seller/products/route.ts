import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId");

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ products: data || [] });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { productId } = await req.json();

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Product deleted" });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
