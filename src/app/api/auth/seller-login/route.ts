import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { email, password } = await req.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Check if seller is approved
    const { data: profile } = await supabase
      .from("seller_profiles")
      .select("id, status, shop_name")
      .eq("user_id", data.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "No seller profile found. Please register first." }, { status: 403 });
    }

    if (profile.status !== "approved") {
      return NextResponse.json({
        error: `Your account is ${profile.status}. Please wait for admin approval.`,
        status: profile.status,
      }, { status: 403 });
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
      role: "seller",
      shopName: profile.shop_name,
      sellerProfileId: profile.id,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
