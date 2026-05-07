"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCard, type AlertType } from "@/components/pivo/alert-card";
import { CurrencyDisplay } from "@/components/pivo/currency-display";
import { DollarSign, Megaphone, Clock, TrendingUp, Target, Hourglass } from "lucide-react";

interface Alert {
  type: AlertType;
  message: string;
  href: string;
}

interface DashboardClientProps {
  monthlyReceived: number;
  pendingAmount: number;
  activeDealsCount: number;
  pendingProposalsCount: number;
  upcomingCount: number;
  alerts: Alert[];
}

const today = new Date();

function getGreeting() {
  const h = today.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export function DashboardClient({
  monthlyReceived,
  pendingAmount,
  activeDealsCount,
  pendingProposalsCount,
  upcomingCount,
  alerts,
}: DashboardClientProps) {
  const cards = [
    {
      label: "Recebido no mês",
      value: <CurrencyDisplay value={monthlyReceived} size="xl" className="text-[#5DC93E]" />,
      icon: DollarSign,
      iconBg: "bg-[#5DC93E]/15",
      iconColor: "text-[#5DC93E]",
      description: format(today, "MMMM yyyy", { locale: ptBR }),
    },
    {
      label: "A receber",
      value: <CurrencyDisplay value={pendingAmount} size="xl" className="text-amber-600" />,
      icon: Hourglass,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      description: "aguardando pagamento",
    },
    {
      label: "Campanhas ativas",
      value: <span className="text-3xl font-bold text-[#1A2547]">{activeDealsCount}</span>,
      icon: Megaphone,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      description: "em andamento",
    },
    {
      label: "Propostas pendentes",
      value: <span className="text-3xl font-bold text-[#1A2547]">{pendingProposalsCount}</span>,
      icon: TrendingUp,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      description: "aguardando resposta",
    },
    {
      label: "Próximos vencimentos",
      value: <span className="text-3xl font-bold text-[#1A2547]">{upcomingCount}</span>,
      icon: Clock,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      description: "nos próximos 2 dias",
    },
  ];

  return (
    <div className="max-w-6xl space-y-8">
      {/* Saudação */}
      <div>
        <h1 className="font-nunito text-3xl font-black text-[#1A2547]">
          {getGreeting()} 👋
        </h1>
        <p className="text-[#5A6A82] mt-1">
          {format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map(({ label, value, icon: Icon, iconBg, iconColor, description }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-[#5A6A82]">{label}</p>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
                  <Icon className={`w-[18px] h-[18px] ${iconColor}`} />
                </div>
              </div>
              <div className="mb-1">{value}</div>
              <p className="text-xs text-[#5A6A82]">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertas */}
      <div>
        <h2 className="font-nunito text-lg font-bold text-[#1A2547] mb-4">
          O que precisa de atenção hoje
        </h2>
        {alerts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 flex flex-col items-center text-center gap-2">
              <Target className="w-10 h-10 text-[#5DC93E] mb-2" />
              <p className="font-semibold text-[#1A2547]">Tudo em dia por hoje. 🎯</p>
              <p className="text-sm text-[#5A6A82]">
                Nenhum prazo, pagamento ou proposta pendente. Continue assim!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {alerts.map((alert, i) => (
              <AlertCard key={i} type={alert.type} message={alert.message} href={alert.href} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
