import Image from "next/image";
import { cn, generateBrandColor, getInitials } from "@/lib/utils";

interface BrandAvatarProps {
  name: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { container: "w-7 h-7", text: "text-xs" },
  md: { container: "w-9 h-9", text: "text-sm" },
  lg: { container: "w-12 h-12", text: "text-base" },
};

export function BrandAvatar({ name, logoUrl, size = "md", className }: BrandAvatarProps) {
  const { container, text } = sizeMap[size];
  const bg = generateBrandColor(name);
  const initials = getInitials(name);

  if (logoUrl) {
    return (
      <div className={cn("relative rounded-xl overflow-hidden flex-shrink-0 bg-white border border-[#D1E8C8]", container, className)}>
        <Image src={logoUrl} alt={name} fill className="object-contain p-0.5" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl flex-shrink-0 font-bold text-white",
        container,
        text,
        className
      )}
      style={{ backgroundColor: bg }}
      title={name}
    >
      {initials}
    </div>
  );
}
