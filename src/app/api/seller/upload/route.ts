import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await req.json();
    const {
      sellerId,
      name,
      category,
      subcategory,
      price,
      condition,
      state,
      description,
      specs,
      negotiable,
      haggleMin,
      haggleMax,
      imageUrls,
    } = body;

    if (!sellerId || !name || !category || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Resolve sellerId (auth UID) to seller profile ID
    const { data: sellerProfile } = await supabase
      .from("seller_profiles")
      .select("id")
      .eq("user_id", sellerId)
      .single();

    if (!sellerProfile) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 403 });
    }

    const { data, error } = await supabase.from("products").insert({
      seller_id: sellerProfile.id,
      name,
      category,
      subcategory: subcategory || "",
      price: Number(price),
      currency: "NGN",
      condition: condition || "Brand New",
      state: state || "",
      description: description || "",
      specs: specs || {},
      negotiable: negotiable !== false,
      haggle_min: Number(haggleMin || price * 0.85),
      haggle_max: Number(haggleMax || price),
      image_urls: imageUrls || [],
      status: "active",
      views: 0,
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Product uploaded successfully", product: data });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
