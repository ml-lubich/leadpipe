import { Campaign, Lead, Template } from "@/types";

export const mockCampaigns: Campaign[] = [
  {
    id: "1",
    user_id: "user-1",
    name: "Plumbers in Austin TX",
    trade_type: "Plumbers",
    location: "Austin, TX",
    status: "active",
    leads_found: 47,
    emails_sent: 32,
    replies_received: 8,
    created_at: "2026-03-15T10:00:00Z",
  },
  {
    id: "2",
    user_id: "user-1",
    name: "HVAC in Denver CO",
    trade_type: "HVAC",
    location: "Denver, CO",
    status: "active",
    leads_found: 31,
    emails_sent: 18,
    replies_received: 4,
    created_at: "2026-03-20T14:30:00Z",
  },
  {
    id: "3",
    user_id: "user-1",
    name: "Electricians in Phoenix AZ",
    trade_type: "Electricians",
    location: "Phoenix, AZ",
    status: "paused",
    leads_found: 22,
    emails_sent: 10,
    replies_received: 2,
    created_at: "2026-03-22T09:15:00Z",
  },
];

const businessNames: Record<string, string[]> = {
  Plumbers: [
    "Austin Pro Plumbing", "Lone Star Pipes", "Capital City Plumbing",
    "Hill Country Drains", "Texas Flush Masters", "A1 Plumbing Solutions",
    "Reliable Pipe Works", "South Austin Plumbing", "Downtown Drain Co",
    "QuickFix Plumbing", "Cedar Park Plumbers", "Round Rock Pipes",
  ],
  HVAC: [
    "Mile High HVAC", "Rocky Mountain Air", "Denver Comfort Systems",
    "Front Range Heating", "Alpine Air Solutions", "Peak Performance HVAC",
    "Colorado Climate Co", "Summit Heating & Cooling", "Fresh Air Denver",
  ],
  Electricians: [
    "Valley Electric Pro", "Phoenix Wiring Co", "Desert Power Solutions",
    "Sunbelt Electric", "AZ Spark Masters", "Cactus Electric",
    "Mesa Electrical Services", "Scottsdale Wiring", "Tempe Power Co",
  ],
};

const ownerNames = [
  "Mike Johnson", "Sarah Williams", "Carlos Rodriguez", "Jennifer Chen",
  "David Kim", "Maria Garcia", "Robert Brown", "Lisa Anderson",
  "James Wilson", "Patricia Martinez", "Thomas Lee", "Nancy Taylor",
];

export function generateLeads(campaign: Campaign): Lead[] {
  const names = businessNames[campaign.trade_type] || businessNames["Plumbers"];
  return names.map((name, i) => {
    const score = Math.floor(Math.random() * 60) + 20;
    const reviewCount = Math.floor(Math.random() * 80);
    const hasWebsite = Math.random() > 0.4;
    const rating = +(Math.random() * 2 + 3).toFixed(1);
    const statuses: Lead["status"][] = ["new", "contacted", "replied", "converted"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      id: `${campaign.id}-lead-${i}`,
      campaign_id: campaign.id,
      business_name: name,
      owner_name: ownerNames[i % ownerNames.length],
      phone: `(555) ${String(100 + i).padStart(3, "0")}-${String(1000 + i * 7).slice(-4)}`,
      email: `${name.toLowerCase().replace(/\s+/g, "").slice(0, 10)}@email.com`,
      website: hasWebsite ? `https://${name.toLowerCase().replace(/\s+/g, "")}.com` : "",
      address: `${100 + i * 12} Main St, ${campaign.location}`,
      google_rating: rating,
      review_count: reviewCount,
      has_website: hasWebsite,
      lead_score: score,
      status,
      created_at: campaign.created_at,
    };
  });
}

export const mockTemplates: Template[] = [
  {
    id: "t1",
    user_id: "user-1",
    name: "No Website Outreach",
    trade_type: "General",
    subject_template: "Quick question about {{business_name}}'s online presence",
    body_template: `Hi {{owner_name}},

I came across {{business_name}} and noticed you don't currently have a website. In today's market, over 80% of customers search online before calling a {{trade_type}} — and without a site, you're invisible to them.

I help local {{trade_type}} businesses get found online and generate more calls. Would you be open to a quick 10-minute chat about how I could help {{business_name}} stand out?

Best,
[Your Name]`,
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "t2",
    user_id: "user-1",
    name: "Low Reviews Outreach",
    trade_type: "General",
    subject_template: "{{business_name}} could use more Google reviews",
    body_template: `Hi {{owner_name}},

I noticed {{business_name}} currently has {{review_count}} Google reviews. Businesses with 20+ reviews get 3x more calls from Google Maps — it's one of the easiest wins for local {{trade_type}}.

I help businesses like yours build a steady stream of 5-star reviews on autopilot. Would a quick call this week make sense?

Best,
[Your Name]`,
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "t3",
    user_id: "user-1",
    name: "General Introduction",
    trade_type: "General",
    subject_template: "Helping {{business_name}} get more customers",
    body_template: `Hi {{owner_name}},

I specialize in helping local {{trade_type}} businesses generate more leads and book more jobs. I took a look at {{business_name}}'s online presence and see some quick wins that could bring in more calls.

Would you be open to a brief conversation about how I could help? No pressure — just a friendly chat.

Best,
[Your Name]`,
    created_at: "2026-03-01T00:00:00Z",
  },
];
