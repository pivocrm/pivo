import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ConfiguracoesClient } from "./configuracoes-client";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return <ConfiguracoesClient profile={profile} userId={user.id} />;
}
