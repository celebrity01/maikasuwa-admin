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

    const { sellerId, disable, reason } = await req.json();

    if (!sellerId || typeof disable !== "boolean") {
      return NextResponse.json({ error: "Seller ID and disable flag required" }, { status: 400 });
    }

    // Fetch current seller
    const { data: seller, error: fetchError } = await supabase
      .from("seller_profiles")
      .select("*")
      .eq("id", sellerId)
      .single();

    if (fetchError || !seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 400 });
    }

    // Only approved sellers can be disabled/enabled
    if (seller.status !== "approved") {
      return NextResponse.json({ error: "Only approved sellers can be disabled or enabled" }, { status: 400 });
    }

    // Update seller is_disabled flag
    const { data: updatedSeller, error } = await supabase
      .from("seller_profiles")
      .update({
        is_disabled: disable,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sellerId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Also pause all active products if disabling
    if (disable) {
      const { error: productsError } = await supabase
        .from("products")
        .update({ status: "paused", updated_at: new Date().toISOString() })
        .eq("seller_id", sellerId)
        .eq("status", "active");

      if (productsError) {
        console.error("Failed to pause products:", productsError);
      }
    }

    // Send email notification
    if (seller.email && resend) {
      try {
        const safeName = escapeHtml(seller.full_name || "");
        const safeShopName = escapeHtml(seller.shop_name || "");
        const safeReason = reason ? escapeHtml(reason) : "";

        if (disable) {
          await resend.emails.send({
            from: "KASUWA 2.0 <noreply@kasuwa.ng>",
            to: seller.email,
            subject: "Your KASUWA Seller Account Has Been Suspended",
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #06080C; color: #FFE4A0; padding: 40px 24px;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <div style="font-size: 48px; margin-bottom: 16px;">🏮</div>
                  <h1 style="font-size: 24px; font-weight: 800; color: #FF9A3C; margin: 0;">KASUWA 2.0</h1>
                  <p style="font-size: 14px; color: #7A6E62; margin-top: 4px;">The Market That Listens</p>
                </div>

                <div style="background: #141A22; border: 1px solid rgba(255,154,60,0.18); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
                  <h2 style="font-size: 18px; color: #E04040; margin: 0 0 16px;">Account Suspended</h2>
                  <p style="font-size: 14px; line-height: 1.6; color: #B8A898;">
                    Dear ${safeName}, your seller account for <strong style="color: #FF9A3C;">${safeShopName}</strong> has been temporarily suspended by the KASUWA admin team.
                  </p>
                  ${safeReason ? `<p style="font-size: 14px; line-height: 1.6; color: #B8A898; margin-top: 16px;"><strong>Reason:</strong> ${safeReason}</p>` : ""}
                  <p style="font-size: 14px; line-height: 1.6; color: #B8A898; margin-top: 16px;">
                    Your products have been paused and your account is currently inaccessible. If you believe this was done in error, please contact our support team.
                  </p>
                </div>

                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,154,60,0.1); text-align: center;">
                  <p style="font-size: 11px; color: #4A4238;">KASUWA 2.0 — The Night Market That Listens</p>
                </div>
              </div>
            `,
          });
        } else {
          // Re-enabled
          await resend.emails.send({
            from: "KASUWA 2.0 <noreply@kasuwa.ng>",
            to: seller.email,
            subject: "Your KASUWA Seller Account Has Been Reactivated! 🏮",
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #06080C; color: #FFE4A0; padding: 40px 24px;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <div style="font-size: 48px; margin-bottom: 16px;">🏮</div>
                  <h1 style="font-size: 24px; font-weight: 800; color: #FF9A3C; margin: 0;">KASUWA 2.0</h1>
                  <p style="font-size: 14px; color: #7A6E62; margin-top: 4px;">The Market That Listens</p>
                </div>

                <div style="background: #141A22; border: 1px solid rgba(255,154,60,0.18); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
                  <h2 style="font-size: 18px; color: #3DAF62; margin: 0 0 16px;">Account Reactivated! 🎉</h2>
                  <p style="font-size: 14px; line-height: 1.6; color: #B8A898;">
                    Dear ${safeName}, your seller account for <strong style="color: #FF9A3C;">${safeShopName}</strong> has been reactivated by the KASUWA admin team.
                  </p>
                  <p style="font-size: 14px; line-height: 1.6; color: #B8A898; margin-top: 16px;">
                    You can now log in to the seller portal and manage your products. Note that your previously paused products will need to be manually reactivated.
                  </p>
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
        }
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
      }
    }

    return NextResponse.json({
      message: disable ? "Seller disabled successfully" : "Seller enabled successfully",
      seller: updatedSeller,
    });
  } catch (err) {
    console.error("Toggle seller error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
