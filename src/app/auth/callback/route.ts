import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_TEMPLATES = [
  {
    name: "No Website Outreach",
    trade_type: "General",
    subject_template:
      "Quick question about {{business_name}}'s online presence",
    body_template: `Hi {{owner_name}},

I came across {{business_name}} and noticed you don't currently have a website. In today's market, over 80% of customers search online before calling a {{trade_type}} — and without a site, you're invisible to them.

I help local {{trade_type}} businesses get found online and generate more calls. Would you be open to a quick 10-minute chat about how I could help {{business_name}} stand out?

Best,
[Your Name]`,
  },
  {
    name: "Low Reviews Outreach",
    trade_type: "General",
    subject_template: "{{business_name}} could use more Google reviews",
    body_template: `Hi {{owner_name}},

I noticed {{business_name}} currently has {{review_count}} Google reviews. Businesses with 20+ reviews get 3x more calls from Google Maps — it's one of the easiest wins for local {{trade_type}}.

I help businesses like yours build a steady stream of 5-star reviews on autopilot. Would a quick call this week make sense?

Best,
[Your Name]`,
  },
  {
    name: "General Introduction",
    trade_type: "General",
    subject_template: "Helping {{business_name}} get more customers",
    body_template: `Hi {{owner_name}},

I specialize in helping local {{trade_type}} businesses generate more leads and book more jobs. I took a look at {{business_name}}'s online presence and see some quick wins that could bring in more calls.

Would you be open to a brief conversation about how I could help? No pressure — just a friendly chat.

Best,
[Your Name]`,
  },
];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Seed default templates for new users (idempotent — skips if they already have some)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { count } = await supabase
          .from("templates")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (count === 0) {
          await supabase.from("templates").insert(
            DEFAULT_TEMPLATES.map((t) => ({
              ...t,
              user_id: user.id,
            }))
          );
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
