import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Lead, OutreachHistory } from "@/types";
import LeadDetail from "./lead-detail";

export default async function LeadPage({
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

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (!lead) notFound();

  const { data: outreach } = await supabase
    .from("outreach_history")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  return (
    <LeadDetail
      lead={lead as Lead}
      outreach={(outreach ?? []) as OutreachHistory[]}
    />
  );
}
