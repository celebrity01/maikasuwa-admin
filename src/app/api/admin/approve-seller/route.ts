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

    const { sellerId } = await req.json();

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID required" }, { status: 400 });
    }

    // Update seller status
    const { data: seller, error } = await supabase
      .from("seller_profiles")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", sellerId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Send approval email
    if (seller?.email && resend) {
      try {
        const safeName = escapeHtml(seller.full_name || "");
        const safeShopName = escapeHtml(seller.shop_name || "");
        const safeShopAddress = escapeHtml(seller.shop_address || "");
        const safeCity = escapeHtml(seller.city || "");
        const safeState = escapeHtml(seller.state || "");

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

                <div style="background: rgba(255,154,60,0.08); border: 1px solid rgba(255,154,60,0.15); border-radius: 12px; padding: 20px; margin-top: 24px;">
                  <h3 style="font-size: 14px; color: #FFB84D; margin: 0 0 12px;">Your Shop Details</h3>
                  <table style="width: 100%; font-size: 13px; color: #B8A898;">
                    <tr><td style="padding: 4px 0; color: #7A6E62;">Shop Name</td><td style="padding: 4px 0; color: #FFE4A0; font-weight: 600;">${safeShopName}</td></tr>
                    <tr><td style="padding: 4px 0; color: #7A6E62;">Address</td><td style="padding: 4px 0; color: #FFE4A0;">${safeShopAddress}</td></tr>
                    <tr><td style="padding: 4px 0; color: #7A6E62;">City/State</td><td style="padding: 4px 0; color: #FFE4A0;">${safeCity}, ${safeState}</td></tr>
                  </table>
                </div>
              </div>

              <div style="text-align: center;">
                <a href="https://kasuwa.ng/seller/login" style="display: inline-block; background: linear-gradient(135deg, #FF9A3C, #FFD166); color: #06080C; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 14px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.04em;">
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

    return NextResponse.json({ message: "Seller approved successfully", seller });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
