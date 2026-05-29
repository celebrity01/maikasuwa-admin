import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
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
    if (seller?.email) {
      try {
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
                  Dear ${seller.full_name}, we regret to inform you that your seller application for <strong style="color: #FF9A3C;">${seller.shop_name}</strong> was not approved at this time.
                </p>
                ${reason ? `<p style="font-size: 14px; line-height: 1.6; color: #B8A898; margin-top: 16px;"><strong>Reason:</strong> ${reason}</p>` : ""}
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
