"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  DollarSign,
  BookOpen,
  Settings,
  LogOut,
  Loader2,
  ShieldCheck,
} from "lucide-react";

const ADMIN_EMAIL = "pivocrm@gmail.com";
import { cn, getDaysRemaining } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { UserRow } from "@/lib/supabase/types";

interface SidebarProps {
  user: UserRow;
  onClose?: () => void;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/campanhas", label: "Campanhas", icon: Megaphone },
  { href: "/dashboard/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/dashboard/media-kit", label: "Media Kit", icon: BookOpen },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar({ user, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const isAdmin = user.email === ADMIN_EMAIL;
  const trialDays = user.trial_ends_at ? getDaysRemaining(user.trial_ends_at) : 0;
  const isTrialActive = trialDays > 0 && user.plan === "creator" && !isAdmin;
  const trialProgress = Math.max(0, Math.min(100, (trialDays / 7) * 100));

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  function handleNavClick(href: string) {
    if (!isActive(href, NAV_ITEMS.find((n) => n.href === href)?.exact)) {
      setPendingHref(href);
    }
    onClose?.();
  }

  return (
    <div className="flex flex-col h-full bg-[#1A2547] text-white">
      {/* Logo */}
      <div className="px-5 py-3 border-b border-white/10 flex justify-center">
        <Image
          src="/logo.png"
          alt="Pivo"
          width={100}
          height={84}
          className="object-contain"
          style={{ mixBlendMode: "screen" }}
          priority
        />
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="w-9 h-9 rounded-xl object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-[#5DC93E] flex items-center justify-center text-[#1A2547] font-bold text-sm flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            {user.instagram_handle && (
              <p className="text-xs text-[#8A9BBE] truncate">@{user.instagram_handle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {[
          ...NAV_ITEMS,
          ...(isAdmin ? [{ href: "/dashboard/admin", label: "Admin", icon: ShieldCheck, exact: false }] : []),
        ].map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          const pending = pendingHref === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => handleNavClick(href)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-[#5DC93E] text-[#1A2547] font-bold shadow-sm"
                  : pending
                  ? "bg-white/20 text-white"
                  : "text-[#8A9BBE] hover:bg-white/10 hover:text-white"
              )}
            >
              {pending ? (
                <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
              ) : (
                <Icon className="w-4 h-4 flex-shrink-0" />
              )}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Trial badge + logout */}
      <div className="px-4 pb-6 space-y-3">
        {isTrialActive && (
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8A9BBE]">Trial gratuito</span>
              <span className="text-xs font-bold text-[#5DC93E]">{trialDays}d restantes</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5DC93E] rounded-full transition-all"
                style={{ width: `${trialProgress}%` }}
              />
            </div>
            <p className="text-xs text-[#8A9BBE] mt-1.5">
              Assine para manter acesso completo
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#8A9BBE] hover:bg-white/10 hover:text-white transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </div>
  );
}
