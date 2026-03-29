import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Template } from "@/types";
import TemplatesClient from "./templates-client";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: templates } = await supabase
    .from("templates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <TemplatesClient
      initialTemplates={(templates ?? []) as Template[]}
      userId={user.id}
    />
  );
}
