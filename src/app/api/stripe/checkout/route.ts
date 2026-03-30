import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { getStripe, PRICE_IDS } from "@/lib/stripe";

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return Response.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit(`stripe-checkout:${user.id}`, { windowMs: 60_000, maxRequests: 3 });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterMs);

  let body: { tier?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const tier = body.tier;
  if (!tier || !PRICE_IDS[tier]) {
    return Response.json(
      { error: "Invalid tier. Must be 'pro' or 'agency'." },
      { status: 400 }
    );
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: PRICE_IDS[tier], quantity: 1 }],
    success_url: `${appUrl}/settings?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/settings`,
    metadata: { supabase_user_id: user.id, tier },
  });

  return Response.json({ url: session.url });
}
