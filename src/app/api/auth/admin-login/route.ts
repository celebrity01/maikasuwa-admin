import { NextRequest, NextResponse } from "next/server";
import { createServerClient, isAdminEmail } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check if this email is in the admin list BEFORE authenticating
    if (!isAdminEmail(email)) {
      return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Double-check: verify the authenticated user's email is still admin
    const authedEmail = data.user?.email || "";
    if (!isAdminEmail(authedEmail)) {
      return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
    }

    // If the user doesn't have role: "admin" in metadata yet, update it
    const role = data.user?.user_metadata?.role;
    if (role !== "admin") {
      try {
        await supabase.auth.updateUser({
          data: { role: "admin" },
        });
      } catch {
        // Non-critical: metadata update failed, login still succeeds
        console.warn("Could not update admin user_metadata");
      }
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
      role: "admin",
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
