import { createClient } from "@/lib/supabase/server";
import { TIER_LIMITS } from "@/types";
import OpenAI from "openai";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { campaign_id?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { campaign_id } = body;
  if (!campaign_id || typeof campaign_id !== "string") {
    return Response.json(
      { error: "campaign_id is required" },
      { status: 400 }
    );
  }

  // Check subscription tier limits
  const { data: profile } = await supabase
    .from("users")
    .select("subscription_tier, leads_used_this_month")
    .eq("id", user.id)
    .single();

  if (profile) {
    const tier = (profile.subscription_tier || "free") as keyof typeof TIER_LIMITS;
    const limits = TIER_LIMITS[tier];
    if (limits.leads_per_month > 0 && profile.leads_used_this_month >= limits.leads_per_month) {
      return Response.json(
        { error: `Lead limit reached (${limits.leads_per_month}/month). Upgrade your plan for more leads.` },
        { status: 403 }
      );
    }
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

  // Check if OpenAI is configured
  if (!process.env.OPENAI_API_KEY) {
    // Generate mock leads without AI
    const leads = generateMockLeads(campaign.trade_type, campaign.location, 10);

    const { data: inserted, error } = await supabase
      .from("leads")
      .insert(
        leads.map((l) => ({
          ...l,
          campaign_id,
        }))
      )
      .select();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Update campaign lead count and user usage
    const insertedCount = inserted?.length || 0;
    await supabase
      .from("campaigns")
      .update({ leads_found: (campaign.leads_found || 0) + insertedCount })
      .eq("id", campaign_id);
    await supabase.rpc("increment_leads_used", { user_id_param: user.id, amount: insertedCount }).maybeSingle();

    return Response.json({ leads: inserted, source: "mock" }, { status: 201 });
  }

  // Use OpenAI to generate realistic lead data
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a lead generation assistant. Generate realistic but fictional business leads for local trade businesses. Return JSON array of lead objects.`,
        },
        {
          role: "user",
          content: `Generate 10 fictional ${campaign.trade_type} business leads in ${campaign.location}. Each lead should have:
- business_name: realistic local business name
- owner_name: realistic full name
- phone: realistic phone number with area code
- email: realistic business email
- website: URL or empty string (40% should have no website)
- address: realistic street address in ${campaign.location}
- google_rating: number between 2.5 and 5.0
- review_count: number between 0 and 100
- has_website: boolean
- lead_score: number 20-95 (higher means they need more help: no website +25, few reviews +20, low rating +15)

Return ONLY a JSON array, no other text.`,
        },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return Response.json({ error: "AI returned empty response" }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    const leads = Array.isArray(parsed) ? parsed : parsed.leads || [];

    const { data: inserted, error } = await supabase
      .from("leads")
      .insert(
        leads.map((l: Record<string, unknown>) => ({
          campaign_id,
          business_name: String(l.business_name || "Unknown Business"),
          owner_name: String(l.owner_name || "Unknown"),
          phone: String(l.phone || ""),
          email: String(l.email || ""),
          website: String(l.website || ""),
          address: String(l.address || ""),
          google_rating: Number(l.google_rating) || 0,
          review_count: Number(l.review_count) || 0,
          has_website: Boolean(l.has_website),
          lead_score: Math.min(100, Math.max(0, Number(l.lead_score) || 50)),
          status: "new",
        }))
      )
      .select();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Update campaign lead count and user usage
    const aiInsertedCount = inserted?.length || 0;
    await supabase
      .from("campaigns")
      .update({ leads_found: (campaign.leads_found || 0) + aiInsertedCount })
      .eq("id", campaign_id);
    await supabase.rpc("increment_leads_used", { user_id_param: user.id, amount: aiInsertedCount }).maybeSingle();

    return Response.json({ leads: inserted, source: "ai" }, { status: 201 });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "AI generation failed" },
      { status: 500 }
    );
  }
}

function generateMockLeads(tradeType: string, location: string, count: number) {
  const prefixes = [
    "Pro", "Elite", "Premier", "Quality", "Reliable", "Express",
    "A1", "Superior", "Top Notch", "All Star",
  ];
  const suffixes: Record<string, string[]> = {
    Plumbers: ["Plumbing", "Pipes & Drains", "Plumbing Solutions"],
    HVAC: ["Heating & Cooling", "Climate Control", "Air Systems"],
    Electricians: ["Electric", "Electrical Services", "Wiring Co"],
    Roofers: ["Roofing", "Roof Systems", "Rooftop Solutions"],
    Landscapers: ["Landscaping", "Lawn Care", "Garden Services"],
    Painters: ["Painting", "Paint Pros", "Color Works"],
    Cleaners: ["Cleaning", "Clean Team", "Spotless Services"],
    "Pest Control": ["Pest Control", "Bug Busters", "Pest Solutions"],
  };
  const tradeList = suffixes[tradeType] || ["Services"];
  const owners = [
    "Mike Johnson", "Sarah Williams", "Carlos Rodriguez", "Jennifer Chen",
    "David Kim", "Maria Garcia", "Robert Brown", "Lisa Anderson",
    "James Wilson", "Patricia Martinez",
  ];

  return Array.from({ length: count }, (_, i) => {
    const hasWebsite = Math.random() > 0.4;
    const reviewCount = Math.floor(Math.random() * 80);
    const rating = +(Math.random() * 2 + 3).toFixed(1);
    let score = 20;
    if (!hasWebsite) score += 25;
    if (reviewCount < 10) score += 20;
    if (rating < 4.0) score += 15;
    score += Math.floor(Math.random() * 10);

    const bizName = `${prefixes[i % prefixes.length]} ${tradeList[i % tradeList.length]}`;

    return {
      business_name: bizName,
      owner_name: owners[i % owners.length],
      phone: `(555) ${String(100 + i).padStart(3, "0")}-${String(1000 + i * 7).slice(-4)}`,
      email: `contact@${bizName.toLowerCase().replace(/\s+/g, "").slice(0, 12)}.com`,
      website: hasWebsite ? `https://${bizName.toLowerCase().replace(/\s+/g, "")}.com` : "",
      address: `${100 + i * 12} Main St, ${location}`,
      google_rating: rating,
      review_count: reviewCount,
      has_website: hasWebsite,
      lead_score: Math.min(95, score),
      status: "new" as const,
    };
  });
}
