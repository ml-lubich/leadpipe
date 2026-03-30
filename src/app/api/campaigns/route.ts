import { createClient } from "@/lib/supabase/server";
import { TIER_LIMITS } from "@/types";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ campaigns: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { trade_type?: string; location?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { trade_type, location } = body;
  if (
    !trade_type ||
    typeof trade_type !== "string" ||
    !location ||
    typeof location !== "string"
  ) {
    return Response.json(
      { error: "trade_type and location are required strings" },
      { status: 400 }
    );
  }

  if (trade_type.length > 50 || location.length > 100) {
    return Response.json(
      { error: "Input too long" },
      { status: 400 }
    );
  }

  // Check subscription tier campaign limits
  const { data: profile } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  const tier = (profile?.subscription_tier || "free") as keyof typeof TIER_LIMITS;
  const limits = TIER_LIMITS[tier];

  if (limits.campaigns > 0) {
    const { count } = await supabase
      .from("campaigns")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((count ?? 0) >= limits.campaigns) {
      return Response.json(
        { error: `Campaign limit reached (${limits.campaigns}). Upgrade your plan to create more campaigns.` },
        { status: 403 }
      );
    }
  }

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      user_id: user.id,
      name: `${trade_type} in ${location}`,
      trade_type,
      location,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ campaign: data }, { status: 201 });
}
