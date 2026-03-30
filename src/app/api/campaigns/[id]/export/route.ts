import { createClient } from "@/lib/supabase/server";
import { Lead } from "@/types";

const CSV_HEADERS = [
  "Business Name",
  "Owner",
  "Phone",
  "Email",
  "Website",
  "Address",
  "Google Rating",
  "Reviews",
  "Score",
  "Status",
] as const;

function escapeCSVField(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCSVRow(lead: Lead): string {
  return [
    lead.business_name,
    lead.owner_name,
    lead.phone,
    lead.email,
    lead.website,
    lead.address,
    lead.google_rating,
    lead.review_count,
    lead.lead_score,
    lead.status,
  ]
    .map(escapeCSVField)
    .join(",");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (campaignError || !campaign) {
    return Response.json({ error: "Campaign not found" }, { status: 404 });
  }

  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("*")
    .eq("campaign_id", id)
    .order("lead_score", { ascending: false });

  if (leadsError) {
    return Response.json({ error: "Failed to fetch leads" }, { status: 500 });
  }

  const rows = [CSV_HEADERS.join(","), ...(leads ?? []).map(buildCSVRow)];
  const csv = rows.join("\n");
  const filename = `${campaign.name.replace(/[^a-zA-Z0-9-_ ]/g, "")}-leads.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
