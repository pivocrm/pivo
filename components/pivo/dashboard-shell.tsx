"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, Zap } from "lucide-react";
import { Sidebar } from "@/components/pivo/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { getDaysRemaining } from "@/lib/utils";
import type { UserRow } from "@/lib/supabase/types";

const ADMIN_EMAIL = "pivocrm@gmail.com";

interface DashboardShellProps {
  user: UserRow;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user.email === ADMIN_EMAIL;
  const trialDays = user.trial_ends_at ? getDaysRemaining(user.trial_ends_at) : 0;
  const trialExpired = !isAdmin && user.plan === "creator" && user.trial_ends_at != null && trialDays <= 0;

  return (
    <div className="flex min-h-screen bg-[#F0F7EC]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col fixed inset-y-0 left-0 z-30">
        <Sidebar user={user} />
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#1A2547]/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar user={user} onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-white border-b border-[#D1E8C8]">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl hover:bg-[#F0F7EC] transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5 text-[#1A2547]" />
          </button>
          <Image src="/logo.png" alt="Pivo" width={72} height={36} className="object-contain" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Trial expired — full-screen block */}
      {trialExpired && (
        <div className="fixed inset-0 z-[100] bg-[#1A2547]/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-[#5DC93E]/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Zap className="w-8 h-8 text-[#5DC93E]" />
            </div>
            <h2 className="font-nunito text-2xl font-black text-[#1A2547] mb-2">
              Seu trial expirou
            </h2>
            <p className="text-[#5A6A82] text-sm leading-relaxed mb-6">
              Os 7 dias de teste gratuito chegaram ao fim.<br />
              Faça o upgrade para continuar usando o Pivo e não perder nenhuma campanha ou dado.
            </p>
            <a
              href="mailto:pivocrm@gmail.com?subject=Quero fazer upgrade do Pivo"
              className="block w-full bg-[#5DC93E] text-[#1A2547] font-bold text-base py-3.5 rounded-2xl hover:bg-[#4db534] transition-colors"
            >
              Fazer upgrade agora
            </a>
            <p className="text-xs text-[#8A9BBE] mt-4">
              Entre em contato e ativamos seu plano em minutos.
            </p>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}
