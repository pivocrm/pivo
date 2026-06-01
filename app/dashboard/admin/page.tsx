export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Users, ShieldCheck, Clock, TrendingUp } from "lucide-react";

const ADMIN_EMAIL = "pivocrm@gmail.com";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) redirect("/dashboard");

  const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const { data: profiles } = await supabaseAdmin.from("users").select("*");

  const authUsers = authData?.users ?? [];
  const profileMap = new Map((profiles ?? []).map((p: { id: string; name: string; instagram_handle: string | null; plan: string; trial_ends_at: string | null }) => [p.id, p]));

  const rows = authUsers
    .filter((u) => u.email !== ADMIN_EMAIL)
    .map((u) => ({
      id: u.id,
      email: u.email ?? "—",
      name: profileMap.get(u.id)?.name ?? u.user_metadata?.name ?? "—",
      instagram: profileMap.get(u.id)?.instagram_handle ?? null,
      plan: profileMap.get(u.id)?.plan ?? "—",
      trial_ends_at: profileMap.get(u.id)?.trial_ends_at ?? null,
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at ?? null,
      confirmed: !!u.email_confirmed_at,
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalUsers = rows.length;
  const confirmed = rows.filter((r) => r.confirmed).length;
  const onTrial = rows.filter((r) => r.trial_ends_at && new Date(r.trial_ends_at) > new Date()).length;
  const last7days = rows.filter((r) => {
    const d = new Date(r.created_at);
    return d > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black font-nunito text-[#1A2547]">Painel Admin</h1>
        <p className="text-sm text-[#5A6A82]">Visível apenas para pivocrm@gmail.com</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#D1E8C8] p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-[#5DC93E]" />
            <span className="text-xs text-[#5A6A82] font-medium">Total usuários</span>
          </div>
          <p className="text-3xl font-black text-[#1A2547]">{totalUsers}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#D1E8C8] p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-[#5DC93E]" />
            <span className="text-xs text-[#5A6A82] font-medium">E-mails confirmados</span>
          </div>
          <p className="text-3xl font-black text-[#1A2547]">{confirmed}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#D1E8C8] p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-xs text-[#5A6A82] font-medium">Em trial</span>
          </div>
          <p className="text-3xl font-black text-[#1A2547]">{onTrial}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#D1E8C8] p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-[#6366F1]" />
            <span className="text-xs text-[#5A6A82] font-medium">Novos (7 dias)</span>
          </div>
          <p className="text-3xl font-black text-[#1A2547]">{last7days}</p>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-[#D1E8C8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#D1E8C8]">
          <h2 className="font-bold text-[#1A2547]">Usuários cadastrados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FDF6]">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#5A6A82] uppercase tracking-wide">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#5A6A82] uppercase tracking-wide">E-mail</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#5A6A82] uppercase tracking-wide">Instagram</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#5A6A82] uppercase tracking-wide">Plano</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#5A6A82] uppercase tracking-wide">Cadastro</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#5A6A82] uppercase tracking-wide">Último login</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#5A6A82] uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F7ED]">
              {rows.map((row) => {
                const trialActive = row.trial_ends_at && new Date(row.trial_ends_at) > new Date();
                const upgraded = row.plan !== "creator";
                const cancelled = !trialActive && !upgraded && row.trial_ends_at;

                let statusBadge;
                if (!row.confirmed) {
                  statusBadge = <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Pendente</span>;
                } else if (trialActive) {
                  statusBadge = <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Trial ativo</span>;
                } else if (upgraded) {
                  statusBadge = <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#E8F5E4] text-[#2D7A1A]">Confirmado</span>;
                } else if (cancelled) {
                  statusBadge = <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">Cancelado</span>;
                } else {
                  statusBadge = <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#E8F5E4] text-[#2D7A1A]">Confirmado</span>;
                }

                return (
                  <tr key={row.id} className="hover:bg-[#F8FDF6] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1A2547]">{row.name}</td>
                    <td className="px-4 py-3 text-[#5A6A82]">{row.email}</td>
                    <td className="px-4 py-3 text-[#5A6A82]">{row.instagram ? `@${row.instagram}` : "—"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#E8F5E4] text-[#2D7A1A]">
                        {row.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#5A6A82]">{formatDate(row.created_at)}</td>
                    <td className="px-4 py-3 text-[#5A6A82]">{row.last_sign_in ? formatDate(row.last_sign_in) : "—"}</td>
                    <td className="px-4 py-3">{statusBadge}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#5A6A82]">Nenhum usuário cadastrado ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
