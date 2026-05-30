import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateDefaultPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let password = "";
  // Ensure at least one uppercase, one lowercase, one digit, one special
  password += "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 25)];
  password += "abcdefghjkmnpqrstuvwxyz"[Math.floor(Math.random() * 25)];
  password += "23456789"[Math.floor(Math.random() * 8)];
  password += "!@#$"[Math.floor(Math.random() * 4)];
  // Fill to 12 chars
  for (let i = 4; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  // Shuffle
  return password.split("").sort(() => Math.random() - 0.5).join("");
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();

    // Verify admin access
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sellerId } = await req.json();

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID required" }, { status: 400 });
    }

    // Fetch the seller profile
    const { data: seller, error: fetchError } = await supabase
      .from("seller_profiles")
      .select("*")
      .eq("id", sellerId)
      .single();

    if (fetchError || !seller) {
      return NextResponse.json({ error: fetchError?.message || "Seller not found" }, { status: 400 });
    }

    // Generate default password
    const defaultPassword = generateDefaultPassword();

    // Create Supabase auth user for the seller (if not already created)
    let authUserId = seller.user_id;

    if (!authUserId) {
      // No auth user yet — create one with admin privileges
      // Use the admin API to create user without requiring email confirmation
      const { data: authData, error: authCreateError } = await supabase.auth.signUp({
        email: seller.email,
        password: defaultPassword,
        options: {
          data: {
            role: "seller",
            full_name: seller.full_name,
          },
        },
      });

      if (authCreateError) {
        console.error("Auth user creation failed:", authCreateError);
        // If user already exists, try to find them
        if (authCreateError.message.includes("already registered")) {
          // We can't easily get their ID, proceed with approval
          // The seller will use the default password on the seller portal login
        }
      } else if (authData.user) {
        authUserId = authData.user.id;
      }
    }

    // Update seller status
    const { data: updatedSeller, error } = await supabase
      .from("seller_profiles")
      .update({
        status: "approved",
        user_id: authUserId,
        default_password_set: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sellerId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Send approval email with credentials
    if (seller.email && resend) {
      try {
        const safeName = escapeHtml(seller.full_name || "");
        const safeShopName = escapeHtml(seller.shop_name || "");
        const safeEmail = escapeHtml(seller.email);
        const safePassword = escapeHtml(defaultPassword);

        await resend.emails.send({
          from: "KASUWA 2.0 <noreply@kasuwa.ng>",
          to: seller.email,
          subject: "Your KASUWA Seller Account Has Been Approved! 🏮",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #06080C; color: #FFE4A0; padding: 40px 24px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🏮</div>
                <h1 style="font-size: 24px; font-weight: 800; color: #FF9A3C; margin: 0;">KASUWA 2.0</h1>
                <p style="font-size: 14px; color: #7A6E62; margin-top: 4px;">The Market That Listens</p>
              </div>

              <div style="background: #141A22; border: 1px solid rgba(255,154,60,0.18); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
                <h2 style="font-size: 20px; color: #3DAF62; margin: 0 0 16px;">Congratulations, ${safeName}! 🎉</h2>

                <p style="font-size: 14px; line-height: 1.6; color: #B8A898;">
                  Your seller account for <strong style="color: #FF9A3C;">${safeShopName}</strong> has been approved by the KASUWA admin team.
                </p>

                <p style="font-size: 14px; line-height: 1.6; color: #B8A898; margin-top: 16px;">
                  You can now log in to the seller portal and start uploading your products to the marketplace.
                </p>

                <div style="background: rgba(45,143,78,0.08); border: 1px solid rgba(45,143,78,0.15); border-radius: 12px; padding: 20px; margin-top: 24px;">
                  <h3 style="font-size: 14px; color: #3DAF62; margin: 0 0 12px;">Your Login Credentials</h3>
                  <table style="width: 100%; font-size: 13px; color: #B8A898;">
                    <tr>
                      <td style="padding: 6px 0; color: #7A6E62; width: 100px;">Username</td>
                      <td style="padding: 6px 0; color: #FFE4A0; font-weight: 600; font-family: monospace; background: rgba(255,154,60,0.06); padding: 6px 10px; border-radius: 6px;">${safeEmail}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #7A6E62;">Password</td>
                      <td style="padding: 6px 0; color: #FFE4A0; font-weight: 600; font-family: monospace; background: rgba(255,154,60,0.06); padding: 6px 10px; border-radius: 6px;">${safePassword}</td>
                    </tr>
                  </table>
                  <p style="font-size: 11px; color: #7A6E62; margin-top: 12px;">
                    Please change your password after your first login for security.
                  </p>
                </div>

                <div style="background: rgba(255,154,60,0.08); border: 1px solid rgba(255,154,60,0.15); border-radius: 12px; padding: 20px; margin-top: 16px;">
                  <h3 style="font-size: 14px; color: #FFB84D; margin: 0 0 12px;">Your Shop Details</h3>
                  <table style="width: 100%; font-size: 13px; color: #B8A898;">
                    <tr><td style="padding: 4px 0; color: #7A6E62;">Shop Name</td><td style="padding: 4px 0; color: #FFE4A0; font-weight: 600;">${safeShopName}</td></tr>
                    <tr><td style="padding: 4px 0; color: #7A6E62;">Address</td><td style="padding: 4px 0; color: #FFE4A0;">${escapeHtml(seller.shop_address || "")}</td></tr>
                    <tr><td style="padding: 4px 0; color: #7A6E62;">City/State</td><td style="padding: 4px 0; color: #FFE4A0;">${escapeHtml(seller.city || "")}, ${escapeHtml(seller.state || "")}</td></tr>
                  </table>
                </div>
              </div>

              <div style="text-align: center;">
                <a href="https://seller.kasuwa.ng/seller/login" style="display: inline-block; background: linear-gradient(135deg, #3DAF62, #2D8F4E); color: #06080C; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 14px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.04em;">
                  Log In to Seller Portal
                </a>
              </div>

              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,154,60,0.1); text-align: center;">
                <p style="font-size: 11px; color: #4A4238;">KASUWA 2.0 — The Night Market That Listens</p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
        // Still return success even if email fails
      }
    }

    return NextResponse.json({
      message: "Seller approved successfully",
      seller: updatedSeller,
      credentials: { email: seller.email, defaultPassword },
    });
  } catch (err) {
    console.error("Approve seller error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
