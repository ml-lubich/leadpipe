import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Campaign, Lead } from "@/types";
import CampaignDetail from "./campaign-detail";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (!campaign) notFound();

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("campaign_id", id)
    .order("website_score", { ascending: false });

  return (
    <CampaignDetail
      campaign={campaign as Campaign}
      leads={(leads ?? []) as Lead[]}
    />
  );
}
