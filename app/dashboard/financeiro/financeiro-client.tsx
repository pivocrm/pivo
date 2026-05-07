"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentStatusBadge } from "@/components/pivo/status-badge";
import { CurrencyDisplay } from "@/components/pivo/currency-display";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import {
  DollarSign, Clock, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle2,
} from "lucide-react";
import type { PaymentStatus } from "@/lib/supabase/types";

interface PaymentWithDeal {
  id: string;
  deal_id: string;
  amount: number;
  status: PaymentStatus;
  payment_date: string | null;
  invoice_url: string | null;
  notes: string | null;
  deals: {
    id: string;
    title: string;
    brands: { name: string } | null;
  };
}

interface FinanceiroClientProps {
  initialPayments: PaymentWithDeal[];
  userId: string;
}

export function FinanceiroClient({ initialPayments }: FinanceiroClientProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentWithDeal[]>(initialPayments);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [markingId, setMarkingId] = useState<string | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  function isInMonth(dateStr: string | null): boolean {
    if (!dateStr) return false;
    try {
      return isWithinInterval(new Date(dateStr), { start: monthStart, end: monthEnd });
    } catch { return false; }
  }

  const totalReceived = payments
    .filter((p) => p.status === "recebido" && isInMonth(p.payment_date))
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalPending = payments
    .filter((p) => p.status === "pendente")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalOverdue = payments
    .filter((p) => p.status === "atrasado")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  async function markAsReceived(paymentId: string) {
    setMarkingId(paymentId);
    try {
      const today = new Date().toISOString().split("T")[0];
      const { error } = await supabase
        .from("payments")
        .update({ status: "recebido", payment_date: today } as never)
        .eq("id", paymentId);
      if (error) throw error;
      setPayments((prev) =>
        prev.map((p) => p.id === paymentId ? { ...p, status: "recebido" as PaymentStatus, payment_date: today } : p)
      );
      toast({ title: "Pagamento recebido!" });
    } catch (err: unknown) {
      toast({ variant: "destructive", title: "Erro", description: err instanceof Error ? err.message : "Erro" });
    } finally {
      setMarkingId(null);
    }
  }

  const displayPayments = payments.filter((p) => {
    if (p.status === "recebido") return isInMonth(p.payment_date);
    return true;
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito text-2xl font-black text-[#1A2547]">Financeiro</h1>
          <p className="text-[#5A6A82] text-sm mt-0.5">Controle de pagamentos de campanhas</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#D1E8C8] rounded-xl px-3 py-2">
          <button onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-1 hover:bg-[#F0F7EC] rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-[#5A6A82]" />
          </button>
          <span className="text-sm font-semibold text-[#1A2547] min-w-[120px] text-center capitalize">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </span>
          <button onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-1 hover:bg-[#F0F7EC] rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-[#5A6A82]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Recebido no mês", value: totalReceived, icon: DollarSign, iconBg: "bg-[#5DC93E]/15", iconColor: "text-[#5DC93E]", valueColor: "text-[#5DC93E]" },
          { label: "A receber", value: totalPending, icon: Clock, iconBg: "bg-amber-100", iconColor: "text-amber-600", valueColor: "text-amber-600" },
          { label: "Em atraso", value: totalOverdue, icon: AlertTriangle, iconBg: "bg-red-100", iconColor: "text-red-600", valueColor: "text-red-600" },
        ].map(({ label, value, icon: Icon, iconBg, iconColor, valueColor }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
                  <Icon className={`w-[18px] h-[18px] ${iconColor}`} />
                </div>
                <p className="text-sm text-[#5A6A82] font-medium">{label}</p>
              </div>
              <CurrencyDisplay value={value} size="lg" className={valueColor} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {displayPayments.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center gap-2">
              <DollarSign className="w-10 h-10 text-[#D1E8C8] mb-2" />
              <p className="font-semibold text-[#1A2547]">Nenhum pagamento registrado</p>
              <p className="text-sm text-[#5A6A82]">Os pagamentos aparecem quando você cria campanhas com valores.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#D1E8C8]">
                    <th className="text-left text-xs font-semibold text-[#5A6A82] px-5 py-3.5">Campanha</th>
                    <th className="text-left text-xs font-semibold text-[#5A6A82] px-3 py-3.5">Marca</th>
                    <th className="text-right text-xs font-semibold text-[#5A6A82] px-3 py-3.5">Valor</th>
                    <th className="text-left text-xs font-semibold text-[#5A6A82] px-3 py-3.5">Status</th>
                    <th className="text-left text-xs font-semibold text-[#5A6A82] px-3 py-3.5">Data prevista</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1E8C8]">
                  {displayPayments.map((payment) => {
                    const brands = payment.deals.brands;
                    const brandName = Array.isArray(brands) ? (brands[0] as { name: string })?.name : brands?.name;
                    return (
                      <tr key={payment.id} className="hover:bg-[#F0F7EC]/50 transition-colors">
                        <td className="px-5 py-3.5"><p className="text-sm font-medium text-[#1A2547] line-clamp-1">{payment.deals.title}</p></td>
                        <td className="px-3 py-3.5"><p className="text-sm text-[#5A6A82]">{brandName ?? "—"}</p></td>
                        <td className="px-3 py-3.5 text-right"><CurrencyDisplay value={Number(payment.amount)} size="sm" className="font-bold text-[#1A2547]" /></td>
                        <td className="px-3 py-3.5"><PaymentStatusBadge status={payment.status} /></td>
                        <td className="px-3 py-3.5"><p className="text-sm text-[#5A6A82]">{formatDate(payment.payment_date)}</p></td>
                        <td className="px-5 py-3.5">
                          {payment.status !== "recebido" && (
                            <Button size="sm" variant="outline" onClick={() => markAsReceived(payment.id)} disabled={markingId === payment.id} className="text-xs h-7 gap-1.5 whitespace-nowrap">
                              <CheckCircle2 className="w-3 h-3 text-[#5DC93E]" />
                              {markingId === payment.id ? "..." : "Marcar recebido"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
