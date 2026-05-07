import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { KanbanBoard } from "./kanban-board";
import type { DealWithBrand } from "@/lib/supabase/types";

export default async function CampanhasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [dealsResult, brandsResult] = await Promise.all([
    supabase
      .from("deals")
      .select("*, brands(id, name, logo_url), deliverables(*), payments(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("brands")
      .select("id, name, logo_url")
      .eq("user_id", user.id)
      .order("name"),
  ]);

  return (
    <KanbanBoard
      initialDeals={(dealsResult.data ?? []) as unknown as DealWithBrand[]}
      brands={(brandsResult.data ?? []) as { id: string; name: string; logo_url: string | null }[]}
      userId={user.id}
    />
  );
}
