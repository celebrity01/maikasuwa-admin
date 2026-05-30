import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { z } from "zod";

const sellerSignupSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  shopName: z.string().min(1, "Shop name is required"),
  shopAddress: z.string().min(1, "Shop address is required"),
  homeAsBusiness: z.boolean().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  lga: z.string().optional(),
  landmark: z.string().optional(),
  shopType: z.string().optional(),
  photoUrl: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await req.json();
    const validated = sellerSignupSchema.parse(body);
    const { fullName, email, phone, password, shopName, shopAddress, homeAsBusiness, city, state, lga, landmark, shopType, photoUrl } = validated;

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
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
