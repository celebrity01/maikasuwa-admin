import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, password, shopName, shopAddress, homeAsBusiness, city, state, lga, landmark, shopType, photoUrl } = body;

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "seller", full_name: fullName },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Failed to create account" }, { status: 400 });
    }

    // Create seller profile
    const { error: profileError } = await supabase.from("seller_profiles").insert({
      user_id: userId,
      full_name: fullName,
      email,
      phone,
      shop_name: shopName,
      shop_address: shopAddress,
      home_as_business: homeAsBusiness || false,
      city,
      state,
      lga: lga || "",
      landmark: landmark || "",
      shop_type: shopType || "shop",
      photo_url: photoUrl || null,
      status: "pending",
    });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "Registration successful! Your account is pending admin approval.",
      userId,
      status: "pending",
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
