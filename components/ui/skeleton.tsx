import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-[#D1E8C8]/60",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
