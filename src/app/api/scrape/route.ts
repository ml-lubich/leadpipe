import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DigitalGaps } from "@/types";

interface ScrapeRequest {
  trade: string;
  city: string;
  radius?: number;
}

function generateMockBusinesses(trade: string, city: string, count: number) {
  const businessPrefixes = [
    "Elite",
    "Pro",
    "Premier",
    "Quality",
    "Reliable",
    "Ace",
    "First Choice",
    "All-Star",
    "Superior",
    "Precision",
    "Golden State",
    "Trusted",
    "Expert",
    "Royal",
    "Diamond",
  ];

  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Garcia",
    "Martinez",
    "Davis",
    "Lopez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
  ];

  const tradeSuffixes: Record<string, string[]> = {
    HVAC: ["Heating & Cooling", "HVAC Services", "Air Conditioning", "Climate Control"],
    Plumbing: ["Plumbing", "Plumbing Solutions", "Pipe & Drain", "Plumbing Co."],
    Electrical: ["Electric", "Electrical Services", "Power Solutions", "Electrical Co."],
    Roofing: ["Roofing", "Roof & Gutter", "Roofing Solutions", "Roofing Co."],
    Landscaping: ["Landscaping", "Lawn & Garden", "Landscape Design", "Green Spaces"],
    Painting: ["Painting", "Paint Pros", "Color Solutions", "Painting Co."],
  };

  const suffixes = tradeSuffixes[trade] || [`${trade} Services`];

  return Array.from({ length: count }, (_, i) => {
    const prefix = businessPrefixes[i % businessPrefixes.length];
    const suffix = suffixes[i % suffixes.length];
    const lastName = lastNames[i % lastNames.length];
    const hasWebsite = Math.random() > 0.3;
    const websiteScore = hasWebsite ? Math.floor(Math.random() * 8) + 1 : 0;
    const googleRating = Math.round((2.5 + Math.random() * 2.5) * 10) / 10;
    const reviewCount = Math.floor(Math.random() * 200);

    const gaps: DigitalGaps = {
      no_website: !hasWebsite,
      no_online_booking: Math.random() > 0.2,
      no_reviews_page: Math.random() > 0.4,
      poor_mobile: hasWebsite && Math.random() > 0.5,
      no_seo: hasWebsite ? Math.random() > 0.3 : true,
      no_social_media: Math.random() > 0.4,
      no_ssl: hasWebsite && Math.random() > 0.6,
      outdated_design: hasWebsite && Math.random() > 0.5,
    };

    const areaCode = ["213", "310", "323", "818", "626", "562"][
      Math.floor(Math.random() * 6)
    ];

    return {
      business_name: `${prefix} ${suffix}`,
      owner_name: `${lastName}`,
      trade,
      city,
      phone: `(${areaCode}) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      email: `info@${prefix.toLowerCase().replace(/\s+/g, "")}${suffix.toLowerCase().replace(/[^a-z]/g, "")}.com`,
      website: hasWebsite
        ? `${prefix.toLowerCase().replace(/\s+/g, "")}${suffix.toLowerCase().replace(/[^a-z]/g, "")}.com`
        : "",
      address: `${Math.floor(Math.random() * 9000 + 1000)} ${["Main", "Oak", "Pine", "Elm", "Broadway", "Sunset"][Math.floor(Math.random() * 6)]} St, ${city}`,
      google_rating: googleRating,
      review_count: reviewCount,
      website_score: websiteScore,
      digital_gaps: gaps,
      status: "new",
      notes: "",
    };
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: ScrapeRequest = await request.json();
  const { trade, city } = body;

  if (!trade || !city) {
    return NextResponse.json(
      { error: "Trade and city are required" },
      { status: 400 }
    );
  }

  const count = Math.floor(Math.random() * 6) + 8;
  const businesses = generateMockBusinesses(trade, city, count);

  const leadsToInsert = businesses.map((b) => ({
    ...b,
    user_id: user.id,
    campaign_id: null,
  }));

  const { data: inserted, error } = await supabase
    .from("leads")
    .insert(leadsToInsert)
    .select();

  if (error) {
    return NextResponse.json(
      { error: "Failed to save leads: " + error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: `Found ${inserted?.length ?? 0} businesses`,
    count: inserted?.length ?? 0,
  });
}
