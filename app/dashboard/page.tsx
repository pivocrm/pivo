import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";
import type { AlertType } from "@/components/pivo/alert-card";

interface PaymentRow { amount: number; status: string; deal_id: string; payment_date: string | null }
interface DealRow {
  id: string; title: string; status: string; deadline: string | null;
  created_at: string; brands: { name: string } | { name: string }[] | null;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const twoDaysStr = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const sevenDaysStr = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const { data: dealsForPayments } = await supabase
    .from("deals")
    .select("id")
    .eq("user_id", user.id);

  const dealIds = (dealsForPayments ?? []).map((d) => (d as { id: string }).id);

  const [paymentsResult, dealsResult] = await Promise.all([
    dealIds.length > 0
      ? supabase
          .from("payments")
          .select("amount, status, deal_id, payment_date")
          .in("deal_id", dealIds)
      : Promise.resolve({ data: [] as PaymentRow[] }),
    supabase
      .from("deals")
      .select("id, title, status, deadline, created_at, brands(name)")
      .eq("user_id", user.id)
      .in("status", [
        "em_andamento", "proposta_recebida", "negociando",
        "contrato", "aguardando_pagamento",
      ]),
  ]);

  const payments = (paymentsResult.data ?? []) as PaymentRow[];
  const activeDeals = (dealsResult.data ?? []) as DealRow[];

  const monthlyReceived = payments
    .filter((p) => p.status === "recebido" && p.payment_date && p.payment_date >= monthStart && p.payment_date <= monthEnd)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingAmount = payments
    .filter((p) => p.status === "pendente")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingProposals = activeDeals.filter((d) => d.status === "proposta_recebida");

  const getBrandName = (deal: DealRow) => {
    const brands = deal.brands;
    return Array.isArray(brands) ? brands[0]?.name : (brands as { name: string } | null)?.name;
  };

  const alerts: { type: AlertType; message: string; href: string }[] = [];

  // 1. Prazo ≤ 2 dias (qualquer deal ativo)
  const upcomingDeadlines = activeDeals.filter((d) => {
    if (!d.deadline) return false;
    return d.deadline <= twoDaysStr && d.deadline >= todayStr;
  });
  upcomingDeadlines.forEach((d) => {
    const brandName = getBrandName(d);
    const daysLabel = d.deadline === todayStr ? "hoje" : d.deadline === twoDaysStr ? "em 2 dias" : "em breve";
    alerts.push({
      type: "prazo",
      message: `"${d.title}"${brandName ? ` (${brandName})` : ""} — prazo ${daysLabel}`,
      href: "/dashboard/campanhas",
    });
  });

  // 2. Pagamentos atrasados: aguardando_pagamento com prazo vencido
  const overduePaymentDeals = activeDeals.filter(
    (d) => d.status === "aguardando_pagamento" && d.deadline && d.deadline < todayStr
  );
  if (overduePaymentDeals.length > 0) {
    overduePaymentDeals.forEach((d) => {
      const brandName = getBrandName(d);
      alerts.push({
        type: "pagamento",
        message: `Pagamento em atraso: "${d.title}"${brandName ? ` (${brandName})` : ""}`,
        href: "/dashboard/financeiro",
      });
    });
  } else {
    // Pagamentos com status atrasado no banco
    const atrasados = payments.filter((p) => p.status === "atrasado");
    if (atrasados.length > 0) {
      alerts.push({
        type: "pagamento",
        message: `${atrasados.length} pagamento${atrasados.length > 1 ? "s" : ""} em atraso`,
        href: "/dashboard/financeiro",
      });
    }
  }

  // 3. Propostas próximas do prazo (≤ 7 dias, não duplica com ≤ 2 dias)
  const proposalsNearDeadline = activeDeals.filter(
    (d) =>
      d.status === "proposta_recebida" &&
      d.deadline &&
      d.deadline > twoDaysStr &&
      d.deadline <= sevenDaysStr
  );
  proposalsNearDeadline.forEach((d) => {
    const brandName = getBrandName(d);
    alerts.push({
      type: "proposta",
      message: `Proposta "${d.title}"${brandName ? ` (${brandName})` : ""} — prazo em ${Math.ceil((new Date(d.deadline!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} dias`,
      href: "/dashboard/campanhas",
    });
  });

  // 4. Propostas sem resposta há 7+ dias
  const oldProposals = activeDeals.filter(
    (d) => d.status === "proposta_recebida" && d.created_at < sevenDaysAgo
  );
  if (oldProposals.length > 0) {
    alerts.push({
      type: "proposta",
      message: `${oldProposals.length} proposta${oldProposals.length > 1 ? "s" : ""} sem resposta há mais de 7 dias`,
      href: "/dashboard/campanhas",
    });
  }

  return (
    <DashboardClient
      monthlyReceived={monthlyReceived}
      pendingAmount={pendingAmount}
      activeDealsCount={activeDeals.length}
      pendingProposalsCount={pendingProposals.length}
      upcomingCount={upcomingDeadlines.length}
      alerts={alerts}
    />
  );
}
