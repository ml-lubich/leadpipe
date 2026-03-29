import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Campaign, Lead, Template } from "@/types";
import OutreachClient from "./outreach-client";

export default async function OutreachPage({
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
    .gte("lead_score", 50)
    .order("lead_score", { ascending: false });

  const { data: templates } = await supabase
    .from("templates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <OutreachClient
      campaign={campaign as Campaign}
      leads={(leads ?? []) as Lead[]}
      templates={(templates ?? []) as Template[]}
    />
  );
}
