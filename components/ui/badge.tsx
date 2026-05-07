import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[#5DC93E]/15 text-[#2a7a1a] border border-[#5DC93E]/30",
        secondary: "bg-[#1A2547]/10 text-[#1A2547] border border-[#1A2547]/20",
        destructive: "bg-red-100 text-red-700 border border-red-200",
        outline: "border border-[#D1E8C8] text-[#5A6A82]",
        warning: "bg-amber-100 text-amber-700 border border-amber-200",
        info: "bg-blue-100 text-blue-700 border border-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
