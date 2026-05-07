"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { UserRow } from "@/lib/supabase/types";

const NICHES = [
  "Moda e Beleza","Lifestyle","Fitness e Saúde","Gastronomia","Games",
  "Tecnologia","Finanças","Viagem","Pet","Educação","Humor e Entretenimento",
  "Esportes","Infantil e Família","Decoração","Outro",
];

export function ConfiguracoesClient({ profile, userId }: { profile: UserRow | null; userId: string }) {
  const supabase = createClient();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(profile?.name ?? "");
  const [instagram, setInstagram] = useState(profile?.instagram_handle ?? "");
  const [niche, setNiche] = useState(profile?.niche ?? "");
  const [followers, setFollowers] = useState(profile?.followers_count?.toString() ?? "");

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: name.trim(),
          instagram_handle: instagram || null,
          niche: niche || null,
          followers_count: parseInt(followers) || null,
        } as never)
        .eq("id", userId);
      if (error) throw error;
      toast({ title: "Perfil atualizado!" });
    } catch (err: unknown) {
      toast({ variant: "destructive", title: "Erro", description: err instanceof Error ? err.message : "Erro" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-nunito text-2xl font-black text-[#1A2547]">Configurações</h1>
        <p className="text-[#5A6A82] text-sm mt-0.5">Gerencie seu perfil e preferências</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Perfil público</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome artístico</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          </div>
          <div className="space-y-1.5">
            <Label>Instagram</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A82] text-sm">@</span>
              <Input value={instagram} onChange={(e) => setInstagram(e.target.value.replace("@", ""))} placeholder="seuhandle" className="pl-7" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nicho</Label>
              <Select value={niche} onValueChange={setNiche}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{NICHES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Total de seguidores</Label>
              <Input value={followers} onChange={(e) => setFollowers(e.target.value)} placeholder="150000" type="number" />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar perfil"}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#1A2547] capitalize">{profile?.plan ?? "creator"}</p>
              <p className="text-sm text-[#5A6A82]">
                {profile?.trial_ends_at
                  ? `Trial até ${new Date(profile.trial_ends_at).toLocaleDateString("pt-BR")}`
                  : "Plano ativo"}
              </p>
            </div>
            <Button variant="secondary" size="sm">Fazer upgrade</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
