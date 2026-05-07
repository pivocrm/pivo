import { cn } from "@/lib/utils";
import type { DealStatus, PaymentStatus } from "@/lib/supabase/types";

const dealStatusConfig: Record<DealStatus, { label: string; className: string }> = {
  proposta_recebida: {
    label: "Proposta Recebida",
    className: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  negociando: {
    label: "Negociando",
    className: "bg-amber-100 text-amber-700 border border-amber-200",
  },
  contrato: {
    label: "Contrato",
    className: "bg-purple-100 text-purple-700 border border-purple-200",
  },
  em_andamento: {
    label: "Em Andamento",
    className: "bg-[#5DC93E]/15 text-[#2a7a1a] border border-[#5DC93E]/30",
  },
  aguardando_pagamento: {
    label: "Aguardando Pgto.",
    className: "bg-orange-100 text-orange-700 border border-orange-200",
  },
  concluido: {
    label: "Concluído",
    className: "bg-[#1A2547]/10 text-[#1A2547] border border-[#1A2547]/20",
  },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  pendente: {
    label: "Pendente",
    className: "bg-amber-100 text-amber-700 border border-amber-200",
  },
  recebido: {
    label: "Recebido",
    className: "bg-[#5DC93E]/15 text-[#2a7a1a] border border-[#5DC93E]/30",
  },
  atrasado: {
    label: "Atrasado",
    className: "bg-red-100 text-red-700 border border-red-200",
  },
};

interface DealStatusBadgeProps {
  status: DealStatus;
  className?: string;
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function DealStatusBadge({ status, className }: DealStatusBadgeProps) {
  const config = dealStatusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const config = paymentStatusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export { dealStatusConfig, paymentStatusConfig };
