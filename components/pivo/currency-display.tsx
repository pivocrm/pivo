import { cn, formatCurrency } from "@/lib/utils";

interface CurrencyDisplayProps {
  value: number;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl font-bold",
  xl: "text-3xl font-bold",
};

export function CurrencyDisplay({ value, className, size = "md" }: CurrencyDisplayProps) {
  return (
    <span className={cn("font-semibold tabular-nums", sizeMap[size], className)}>
      {formatCurrency(value)}
    </span>
  );
}
