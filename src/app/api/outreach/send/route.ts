import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@example.com";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit(`outreach-send:${user.id}`, { windowMs: 60_000, maxRequests: 10 });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterMs);

  let body: { outreach_ids?: string[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { outreach_ids } = body;
  if (!Array.isArray(outreach_ids) || outreach_ids.length === 0) {
    return Response.json(
      { error: "outreach_ids[] is required" },
      { status: 400 }
    );
  }

  if (outreach_ids.length > 50) {
    return Response.json(
      { error: "Maximum 50 emails per batch" },
      { status: 400 }
    );
  }

  // Fetch outreach items with their leads and verify ownership via campaign
  const { data: outreachItems, error: fetchError } = await supabase
    .from("outreach")
    .select("*, leads!inner(email, business_name, campaign_id)")
    .in("id", outreach_ids)
    .eq("status", "draft");

  if (fetchError) {
    return Response.json({ error: fetchError.message }, { status: 500 });
  }

  if (!outreachItems || outreachItems.length === 0) {
    return Response.json(
      { error: "No draft outreach items found" },
      { status: 404 }
    );
  }

  // Verify user owns all campaigns these outreach items belong to
  const campaignIds = [
    ...new Set(outreachItems.map((o) => o.campaign_id)),
  ];
  const { data: ownedCampaigns } = await supabase
    .from("campaigns")
    .select("id")
    .in("id", campaignIds)
    .eq("user_id", user.id);

  const ownedCampaignIds = new Set(ownedCampaigns?.map((c) => c.id) || []);
  const unauthorized = outreachItems.some(
    (o) => !ownedCampaignIds.has(o.campaign_id)
  );
  if (unauthorized) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Send emails via Resend if configured, otherwise simulate
  const sentAt = new Date().toISOString();

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    for (const item of outreachItems) {
      const lead = item.leads as unknown as {
        email: string;
        business_name: string;
      };
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: lead.email,
          subject: item.subject,
          text: item.body,
        });
      } catch (err) {
        return Response.json(
          {
            error: `Failed to send email to ${lead.business_name}: ${err instanceof Error ? err.message : "Unknown error"}`,
          },
          { status: 502 }
        );
      }
    }
  }

  // Mark outreach items as sent
  const { data: updated, error: updateError } = await supabase
    .from("outreach")
    .update({ status: "sent", sent_at: sentAt })
    .in("id", outreach_ids)
    .select();

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 });
  }

  // Update lead statuses to "contacted"
  const leadIds = [...new Set(outreachItems.map((o) => o.lead_id))];
  await supabase
    .from("leads")
    .update({ status: "contacted" })
    .in("id", leadIds)
    .eq("status", "new");

  // Increment emails_sent on each campaign
  for (const campaignId of campaignIds) {
    const count = outreachItems.filter(
      (o) => o.campaign_id === campaignId
    ).length;
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("emails_sent")
      .eq("id", campaignId)
      .single();
    if (campaign) {
      await supabase
        .from("campaigns")
        .update({ emails_sent: campaign.emails_sent + count })
        .eq("id", campaignId);
    }
  }

  return Response.json({ outreach: updated });
}
