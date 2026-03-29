import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { User, TIER_LIMITS } from "@/types";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  const typedProfile: User = profile ?? {
    id: authUser.id,
    email: authUser.email ?? "",
    full_name: authUser.user_metadata?.full_name ?? null,
    avatar_url: authUser.user_metadata?.avatar_url ?? null,
    stripe_customer_id: null,
    subscription_tier: "free" as const,
    subscription_status: "active" as const,
    leads_used_this_month: 0,
    current_period_end: null,
    created_at: authUser.created_at,
    updated_at: authUser.created_at,
  };

  const limits = TIER_LIMITS[typedProfile.subscription_tier];

  return <SettingsClient profile={typedProfile} limits={limits} />;
}
