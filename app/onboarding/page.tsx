"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { generateSlug } from "@/lib/utils";
import { ArrowRight, LayoutDashboard, Users, Zap } from "lucide-react";

const NICHES = [
  "Moda e Beleza","Lifestyle","Fitness e Saúde","Gastronomia","Games",
  "Tecnologia","Finanças","Viagem","Pet","Educação","Humor e Entretenimento",
  "Esportes","Infantil e Família","Decoração","Outro",
];

const STEPS = [
  { icon: LayoutDashboard, label: "Seu perfil", description: "Como você quer ser conhecido no Pivo" },
  { icon: Users, label: "Primeira marca", description: "Adicione a primeira marca parceira" },
  { icon: Zap, label: "Primeira campanha", description: "Registre sua primeira campanha" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [followers, setFollowers] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandContact, setBrandContact] = useState("");
  const [dealTitle, setDealTitle] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [brandId, setBrandId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      setUserId(data.user.id);
      setName(data.user.user_metadata?.name ?? "");
    });
  }, []);

  const progress = ((step + 1) / STEPS.length) * 100;

  async function handleStep1() {
    if (!name.trim() || !niche) {
      toast({ variant: "destructive", title: "Preencha nome e nicho" });
      return;
    }
    setLoading(true);
    try {
      const slug = generateSlug(name) + "-" + Math.random().toString(36).slice(2, 6);

      const { error: userError } = await supabase
        .from("users")
        .update({ name: name.trim(), niche, followers_count: parseInt(followers) || null } as never)
        .eq("id", userId!);
      if (userError) throw userError;

      await supabase.from("media_kit").upsert({
        user_id: userId!,
        slug,
        platforms: {},
        past_campaigns: [],
        is_public: false,
      } as never, { onConflict: "user_id" });

      setStep(1);
    } catch (err: unknown) {
      toast({ variant: "destructive", title: "Erro", description: err instanceof Error ? err.message : "Erro" });
    } finally {
      setLoading(false);
    }
  }

  async function handleStep2(skip = false) {
    if (skip) { setStep(2); return; }
    if (!brandName.trim()) {
      toast({ variant: "destructive", title: "Informe o nome da marca" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("brands")
        .insert({ user_id: userId!, name: brandName.trim(), contact_name: brandContact || null } as never)
        .select("id")
        .single();
      if (error) throw error;
      setBrandId((data as { id: string }).id);
      setStep(2);
    } catch (err: unknown) {
      toast({ variant: "destructive", title: "Erro", description: err instanceof Error ? err.message : "Erro" });
    } finally {
      setLoading(false);
    }
  }

  async function handleStep3(skip = false) {
    if (!skip && dealTitle.trim() && brandId) {
      setLoading(true);
      try {
        await supabase.from("deals").insert({
          user_id: userId!,
          brand_id: brandId,
          title: dealTitle.trim(),
          value: parseFloat(dealValue.replace(",", ".")) || 0,
          status: "proposta_recebida",
        } as never);
      } catch { /* Se falhar, apenas segue */ } finally {
        setLoading(false);
      }
    }
    router.push("/dashboard");
    router.refresh();
  }

  const StepIcon = STEPS[step].icon;

  return (
    <>
      <div className="min-h-screen bg-[#F0F7EC] flex flex-col items-center justify-center p-6">
        <div className="flex items-center gap-2 mb-10">
          <span className="text-2xl">🦎</span>
          <span className="text-[#1A2547] font-nunito text-xl font-black">Pivo</span>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl border border-[#D1E8C8] shadow-sm overflow-hidden">
          <div className="h-1.5 bg-[#D1E8C8]">
            <div className="h-full bg-[#5DC93E] transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="p-8">
            {/* Steps indicator */}
            <div className="flex items-center gap-2 mb-6">
              {STEPS.map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < step ? "bg-[#5DC93E] text-white" :
                    i === step ? "bg-[#1A2547] text-white" : "bg-[#D1E8C8] text-[#5A6A82]"
                  }`}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 w-8 ${i < step ? "bg-[#5DC93E]" : "bg-[#D1E8C8]"}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#F0F7EC] rounded-2xl flex items-center justify-center">
                <StepIcon className="w-8 h-8 text-[#5DC93E]" />
              </div>
            </div>

            <h1 className="font-nunito text-2xl font-black text-[#1A2547] text-center mb-1">{STEPS[step].label}</h1>
            <p className="text-[#5A6A82] text-sm text-center mb-8">{STEPS[step].description}</p>

            {step === 0 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Nome artístico *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Como você é conhecido" />
                </div>
                <div className="space-y-1.5">
                  <Label>Nicho de conteúdo *</Label>
                  <Select value={niche} onValueChange={setNiche}>
                    <SelectTrigger><SelectValue placeholder="Selecione seu nicho" /></SelectTrigger>
                    <SelectContent>{NICHES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Número de seguidores (total)</Label>
                  <Input value={followers} onChange={(e) => setFollowers(e.target.value)} placeholder="Ex: 150000" type="number" min="0" />
                </div>
                <Button onClick={handleStep1} disabled={loading} className="w-full h-11 mt-2">
                  {loading ? "Salvando..." : <><span>Continuar</span> <ArrowRight className="w-4 h-4 ml-1" /></>}
                </Button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Nome da marca *</Label>
                  <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Ex: Nike, Natura, iFood..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Nome do contato</Label>
                  <Input value={brandContact} onChange={(e) => setBrandContact(e.target.value)} placeholder="Ex: Maria (marketing)" />
                </div>
                <Button onClick={() => handleStep2(false)} disabled={loading} className="w-full h-11 mt-2">
                  {loading ? "Salvando..." : <><span>Adicionar marca</span> <ArrowRight className="w-4 h-4 ml-1" /></>}
                </Button>
                <Button variant="ghost" onClick={() => handleStep2(true)} className="w-full text-[#5A6A82]">Pular por agora</Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {brandId ? (
                  <>
                    <div className="space-y-1.5">
                      <Label>Título da campanha</Label>
                      <Input value={dealTitle} onChange={(e) => setDealTitle(e.target.value)} placeholder="Ex: Campanha verão 2024" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Valor acordado (R$)</Label>
                      <Input value={dealValue} onChange={(e) => setDealValue(e.target.value)} placeholder="0,00" inputMode="decimal" />
                    </div>
                    <Button onClick={() => handleStep3(false)} disabled={loading} className="w-full h-11 mt-2">
                      {loading ? "Criando..." : <><span>Criar campanha e entrar</span> <ArrowRight className="w-4 h-4 ml-1" /></>}
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-[#5A6A82] text-center">Você pulou a etapa de marca. Adicione uma marca primeiro para criar campanhas.</p>
                )}
                <Button variant="ghost" onClick={() => handleStep3(true)} className="w-full text-[#5A6A82]">Pular e ir para o dashboard</Button>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-[#5A6A82] mt-6">Etapa {step + 1} de {STEPS.length}</p>
      </div>
      <Toaster />
    </>
  );
}
