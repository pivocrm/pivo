import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FinanceiroClient } from "./financeiro-client";

export default async function FinanceiroPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: userDeals } = await supabase
    .from("deals")
    .select("id")
    .eq("user_id", user.id);

  const dealIds = (userDeals ?? []).map((d) => (d as { id: string }).id);

  const { data: payments } = dealIds.length > 0
    ? await supabase
        .from("payments")
        .select("*, deals(id, title, brands(name))")
        .in("deal_id", dealIds)
        .order("payment_date", { ascending: false, nullsFirst: false })
    : { data: [] };

  return <FinanceiroClient initialPayments={(payments ?? []) as never} userId={user.id} />;
}
