import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Lead } from "@/types";
import PipelineDashboard from "./pipeline-dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user.id)
    .order("website_score", { ascending: false });

  return <PipelineDashboard leads={(leads ?? []) as Lead[]} userId={user.id} />;
}
