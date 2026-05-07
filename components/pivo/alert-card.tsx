import Link from "next/link";
import { AlertTriangle, Clock, DollarSign, MessageSquare, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertType = "prazo" | "pagamento" | "proposta" | "info";

interface AlertCardProps {
  type: AlertType;
  message: string;
  href: string;
  className?: string;
}

const alertConfig: Record<AlertType, { icon: LucideIcon; className: string; iconClass: string }> = {
  prazo: {
    icon: Clock,
    className: "bg-amber-50 border-amber-200",
    iconClass: "text-amber-500",
  },
  pagamento: {
    icon: DollarSign,
    className: "bg-red-50 border-red-200",
    iconClass: "text-red-500",
  },
  proposta: {
    icon: MessageSquare,
    className: "bg-blue-50 border-blue-200",
    iconClass: "text-blue-500",
  },
  info: {
    icon: AlertTriangle,
    className: "bg-[#F0F7EC] border-[#D1E8C8]",
    iconClass: "text-[#5DC93E]",
  },
};

export function AlertCard({ type, message, href, className }: AlertCardProps) {
  const { icon: Icon, className: alertClass, iconClass } = alertConfig[type];

  return (
    <Link href={href} className={cn(
      "flex items-start gap-3 rounded-xl border p-3.5 transition-all hover:shadow-sm hover:scale-[1.01] group",
      alertClass,
      className
    )}>
      <div className={cn("flex-shrink-0 mt-0.5", iconClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm text-[#1A2547] font-medium leading-snug group-hover:text-[#243060]">
        {message}
      </p>
      <span className="ml-auto flex-shrink-0 text-xs text-[#5A6A82] self-center opacity-0 group-hover:opacity-100 transition-opacity">
        Ver →
      </span>
    </Link>
  );
}
