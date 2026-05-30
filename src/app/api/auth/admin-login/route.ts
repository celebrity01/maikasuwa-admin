import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { email, password } = await req.json();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@kasuwa.ng";
    const adminPassword = process.env.ADMIN_PASSWORD || "KasuwaAdmin2024!";

    if (email === adminEmail && password === adminPassword) {
      // Try to sign in with Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If admin user doesn't exist in Supabase, create it
        if (error.message.includes("Invalid login credentials")) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { role: "admin" },
            },
          });

          if (signUpError) {
            return NextResponse.json({ error: signUpError.message }, { status: 400 });
          }

          return NextResponse.json({
            user: signUpData.user,
            session: signUpData.session,
            role: "admin",
          });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        user: data.user,
        session: data.session,
        role: "admin",
      });
    }

    return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
