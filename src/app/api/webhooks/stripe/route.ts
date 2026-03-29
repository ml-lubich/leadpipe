import { getStripe } from "@/lib/stripe";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Use service role for webhook handler (no user context)
function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createAdminClient(url, serviceKey);
}

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return Response.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return Response.json(
      {
        error: `Webhook signature verification failed: ${err instanceof Error ? err.message : "unknown"}`,
      },
      { status: 400 }
    );
  }

  const supabase = getAdminSupabase();
  if (!supabase) {
    return Response.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.supabase_user_id;
      const tier = session.metadata?.tier;
      if (userId && tier) {
        await supabase
          .from("users")
          .update({
            subscription_tier: tier,
            subscription_status: "active",
            stripe_customer_id: session.customer as string,
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer;

      const status = subscription.status;
      const mappedStatus =
        status === "active" || status === "trialing"
          ? status
          : status === "past_due"
            ? "past_due"
            : "canceled";

      await supabase
        .from("users")
        .update({
          subscription_status: mappedStatus,
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer;

      await supabase
        .from("users")
        .update({
          subscription_tier: "free",
          subscription_status: "canceled",
          current_period_end: null,
        })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  return Response.json({ received: true });
}
