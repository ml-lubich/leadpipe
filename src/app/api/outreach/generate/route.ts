import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { campaign_id?: string; template_id?: string; lead_ids?: string[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { campaign_id, template_id, lead_ids } = body;
  if (!campaign_id || !template_id || !Array.isArray(lead_ids) || lead_ids.length === 0) {
    return Response.json(
      { error: "campaign_id, template_id, and lead_ids[] are required" },
      { status: 400 }
    );
  }

  if (lead_ids.length > 50) {
    return Response.json(
      { error: "Maximum 50 leads per batch" },
      { status: 400 }
    );
  }

  // Verify campaign ownership
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", campaign_id)
    .eq("user_id", user.id)
    .single();

  if (!campaign) {
    return Response.json({ error: "Campaign not found" }, { status: 404 });
  }

  // Get template
  const { data: template } = await supabase
    .from("templates")
    .select("*")
    .eq("id", template_id)
    .eq("user_id", user.id)
    .single();

  if (!template) {
    return Response.json({ error: "Template not found" }, { status: 404 });
  }

  // Get leads
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .in("id", lead_ids)
    .eq("campaign_id", campaign_id);

  if (!leads || leads.length === 0) {
    return Response.json({ error: "No leads found" }, { status: 404 });
  }

  // Generate personalized emails
  const outreachItems = leads.map((lead) => {
    const subject = personalizeTemplate(
      template.subject_template,
      lead,
      campaign.trade_type
    );
    const body = personalizeTemplate(
      template.body_template,
      lead,
      campaign.trade_type
    );
    return {
      lead_id: lead.id,
      campaign_id,
      template_id,
      subject,
      body,
      status: "draft" as const,
    };
  });

  // If OpenAI is configured, enhance the emails with AI
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      for (const item of outreachItems.slice(0, 10)) {
        const lead = leads.find((l) => l.id === item.lead_id);
        if (!lead) continue;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an expert cold email writer for local service businesses. Write concise, personalized emails that feel genuine. Keep the same general structure as the template but make it more natural and specific.",
            },
            {
              role: "user",
              content: `Improve this cold email for ${lead.business_name} (${campaign.trade_type} in ${campaign.location}). Owner: ${lead.owner_name}. Google rating: ${lead.google_rating}, Reviews: ${lead.review_count}, Has website: ${lead.has_website}.

Subject: ${item.subject}

Body:
${item.body}

Return JSON with "subject" and "body" keys only.`,
            },
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          try {
            const enhanced = JSON.parse(content);
            if (enhanced.subject) item.subject = enhanced.subject;
            if (enhanced.body) item.body = enhanced.body;
          } catch {
            // Keep template version if parsing fails
          }
        }
      }
    } catch {
      // Fall through to template-based version
    }
  }

  // Save to database
  const { data: inserted, error } = await supabase
    .from("outreach")
    .insert(outreachItems)
    .select();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ outreach: inserted }, { status: 201 });
}

function personalizeTemplate(
  template: string,
  lead: Record<string, unknown>,
  tradeType: string
): string {
  return template
    .replace(/\{\{business_name\}\}/g, String(lead.business_name))
    .replace(/\{\{owner_name\}\}/g, String(lead.owner_name))
    .replace(/\{\{trade_type\}\}/g, tradeType.toLowerCase())
    .replace(/\{\{review_count\}\}/g, String(lead.review_count))
    .replace(/\{\{google_rating\}\}/g, String(lead.google_rating));
}
