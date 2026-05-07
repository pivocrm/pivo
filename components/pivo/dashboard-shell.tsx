"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/pivo/sidebar";
import { Toaster } from "@/components/ui/toaster";
import type { UserRow } from "@/lib/supabase/types";

interface DashboardShellProps {
  user: UserRow;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

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

      <Toaster />
    </div>
  );
}
