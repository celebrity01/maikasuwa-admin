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

    const { sellerId, reason } = await req.json();

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID required" }, { status: 400 });
    }

    const { data: seller, error } = await supabase
      .from("seller_profiles")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", sellerId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Send rejection email
    if (seller?.email && resend) {
      try {
        const safeName = escapeHtml(seller.full_name || "");
        const safeShopName = escapeHtml(seller.shop_name || "");
        const safeReason = reason ? escapeHtml(reason) : "";

        await resend.emails.send({
          from: "KASUWA 2.0 <noreply@kasuwa.ng>",
          to: seller.email,
          subject: "Update on Your KASUWA Seller Application",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #06080C; color: #FFE4A0; padding: 40px 24px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🏮</div>
                <h1 style="font-size: 24px; font-weight: 800; color: #FF9A3C; margin: 0;">KASUWA 2.0</h1>
              </div>
              <div style="background: #141A22; border: 1px solid rgba(255,154,60,0.18); border-radius: 16px; padding: 32px;">
                <h2 style="font-size: 18px; color: #E04040; margin: 0 0 16px;">Seller Application Update</h2>
                <p style="font-size: 14px; line-height: 1.6; color: #B8A898;">
                  Dear ${safeName}, we regret to inform you that your seller application for <strong style="color: #FF9A3C;">${safeShopName}</strong> was not approved at this time.
                </p>
                ${safeReason ? `<p style="font-size: 14px; line-height: 1.6; color: #B8A898; margin-top: 16px;"><strong>Reason:</strong> ${safeReason}</p>` : ""}
                <p style="font-size: 14px; line-height: 1.6; color: #B8A898; margin-top: 16px;">
                  You may reapply after addressing the issues mentioned above. If you believe this was an error, please contact our support team.
                </p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
      }
    }

    return NextResponse.json({ message: "Seller rejected", seller });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
