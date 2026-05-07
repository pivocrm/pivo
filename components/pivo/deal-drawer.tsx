"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BrandAvatar } from "@/components/pivo/brand-avatar";
import { DealStatusBadge } from "@/components/pivo/status-badge";
import { createClient } from "@/lib/supabase/client";
import { syncPaymentForDeal } from "@/lib/supabase/payment-sync";
import { useToast } from "@/hooks/use-toast";
import { Plus, Check, Trash2, Calendar, DollarSign, X } from "lucide-react";
import type {
  DealWithBrand, DealStatus, DeliverableRow, DeliverableType, ContractStatus, BrandRow,
} from "@/lib/supabase/types";

const DEAL_STATUSES: { value: DealStatus; label: string }[] = [
  { value: "proposta_recebida", label: "Proposta Recebida" },
  { value: "negociando", label: "Negociando" },
  { value: "contrato", label: "Contrato" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "aguardando_pagamento", label: "Aguardando Pagamento" },
  { value: "concluido", label: "Concluído" },
];

const DELIVERABLE_TYPES: { value: DeliverableType; label: string }[] = [
  { value: "post", label: "Post" },
  { value: "reels", label: "Reels" },
  { value: "stories", label: "Stories" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
];

interface DealDrawerProps {
  deal?: DealWithBrand | null;
  brands: Pick<BrandRow, "id" | "name" | "logo_url">[];
  open: boolean;
  defaultStatus?: DealStatus;
  onClose: () => void;
  onSave: (savedDeal?: DealWithBrand) => void;
  userId: string;
}

export function DealDrawer({
  deal, brands, open, defaultStatus = "proposta_recebida", onClose, onSave, userId,
}: DealDrawerProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [localBrands, setLocalBrands] = useState(brands);
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [creatingBrand, setCreatingBrand] = useState(false);

  const [title, setTitle] = useState("");
  const [brandId, setBrandId] = useState("");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<DealStatus>(defaultStatus);
  const [deadline, setDeadline] = useState("");
  const [briefing, setBriefing] = useState("");
  const [notes, setNotes] = useState("");
  const [contractStatus, setContractStatus] = useState<ContractStatus>("sem_contrato");
  const [deliverables, setDeliverables] = useState<Partial<DeliverableRow>[]>([]);
  const [newDelivTitle, setNewDelivTitle] = useState("");
  const [newDelivType, setNewDelivType] = useState<DeliverableType>("post");

  useEffect(() => {
    if (!open) return;
    if (deal) {
      setTitle(deal.title);
      setBrandId(deal.brand_id);
      setValue(deal.value.toString());
      setStatus(deal.status);
      setDeadline(deal.deadline ?? "");
      setBriefing(deal.briefing ?? "");
      setNotes(deal.notes ?? "");
      setContractStatus(deal.contract_status);
      setDeliverables(deal.deliverables ?? []);
    } else {
      setTitle("");
      setBrandId(localBrands[0]?.id ?? "");
      setValue("");
      setStatus(defaultStatus);
      setDeadline("");
      setBriefing("");
      setNotes("");
      setContractStatus("sem_contrato");
      setDeliverables([]);
    }
    setShowNewBrand(false);
    setNewBrandName("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, deal?.id, defaultStatus]);

  const selectedBrand = localBrands.find((b) => b.id === brandId);

  async function handleCreateBrand() {
    if (!newBrandName.trim()) return;
    setCreatingBrand(true);
    const { data, error } = await supabase
      .from("brands")
      .insert({ name: newBrandName.trim(), user_id: userId } as never)
      .select("id, name, logo_url")
      .single();
    setCreatingBrand(false);
    if (error) {
      toast({ variant: "destructive", title: "Erro ao criar marca", description: error.message });
    } else {
      const created = data as Pick<BrandRow, "id" | "name" | "logo_url">;
      setLocalBrands((prev) => [...prev, created]);
      setBrandId(created.id);
      setNewBrandName("");
      setShowNewBrand(false);
    }
  }

  const handleSave = useCallback(async () => {
    if (!title.trim() || !brandId) {
      toast({ variant: "destructive", title: "Campos obrigatórios", description: "Título e marca são obrigatórios." });
      return;
    }
    setSaving(true);
    try {
      const numericValue = parseFloat(value.replace(",", ".")) || 0;
      let savedId: string;

      if (deal) {
        const { error } = await supabase
          .from("deals")
          .update({
            title: title.trim(), brand_id: brandId, value: numericValue, status,
            deadline: deadline || null, briefing: briefing || null, notes: notes || null,
            contract_status: contractStatus, updated_at: new Date().toISOString(),
          } as never)
          .eq("id", deal.id);
        if (error) throw error;
        savedId = deal.id;

        for (const d of deliverables) {
          if (d.id) {
            await supabase.from("deliverables")
              .update({ title: d.title, type: d.type, status: d.status } as never)
              .eq("id", d.id);
          } else if (d.title) {
            await supabase.from("deliverables").insert({
              deal_id: deal.id, title: d.title, type: d.type ?? "post", status: d.status ?? "pendente",
            } as never);
          }
        }
      } else {
        const { data: newDeal, error } = await supabase
          .from("deals")
          .insert({
            user_id: userId, brand_id: brandId, title: title.trim(), value: numericValue,
            status, deadline: deadline || null, briefing: briefing || null, notes: notes || null,
            contract_status: contractStatus,
          } as never)
          .select("id")
          .single();
        if (error) throw error;
        savedId = (newDeal as { id: string }).id;

        const toInsert = deliverables
          .filter((d) => d.title)
          .map((d) => ({ deal_id: savedId, title: d.title!, type: d.type ?? "post", status: "pendente" as const }));
        if (toInsert.length > 0) {
          await supabase.from("deliverables").insert(toInsert as never);
        }
      }

      await syncPaymentForDeal(supabase, savedId, numericValue, status);

      const { data: fullDeal } = await supabase
        .from("deals")
        .select("*, brands(id, name, logo_url), deliverables(*), payments(*)")
        .eq("id", savedId)
        .single();

      toast({
        title: deal ? "Deal atualizado!" : "Deal criado!",
        description: `"${title.trim()}" salvo com sucesso.`,
      });
      onSave(fullDeal as unknown as DealWithBrand);
    } catch (err: unknown) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: err instanceof Error ? err.message : "Erro" });
    } finally {
      setSaving(false);
    }
  }, [title, brandId, value, status, deadline, briefing, notes, contractStatus, deliverables, deal, userId, supabase, toast, onSave]);

  const addDeliverable = () => {
    if (!newDelivTitle.trim()) return;
    setDeliverables((prev) => [...prev, { title: newDelivTitle.trim(), type: newDelivType, status: "pendente" }]);
    setNewDelivTitle("");
    setNewDelivType("post");
  };

  const toggleDeliverable = (index: number) => {
    setDeliverables((prev) =>
      prev.map((d, i) => i === index ? { ...d, status: d.status === "pendente" ? "entregue" : "pendente" } : d)
    );
  };

  const removeDeliverable = async (index: number) => {
    const d = deliverables[index];
    if (d.id) await supabase.from("deliverables").delete().eq("id", d.id);
    setDeliverables((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:w-[480px] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#D1E8C8]">
          <SheetHeader>
            <div className="flex items-center gap-3 mb-3">
              {selectedBrand && <BrandAvatar name={selectedBrand.name} logoUrl={selectedBrand.logo_url} size="md" />}
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-lg truncate">{deal ? deal.title : "Nova Campanha"}</SheetTitle>
                {deal && <p className="text-sm text-[#5A6A82] truncate">{deal.brands?.name}</p>}
              </div>
              {deal && <DealStatusBadge status={deal.status} />}
            </div>
          </SheetHeader>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

          {/* Brand field with inline creation */}
          <div className="space-y-1.5">
            <Label>Marca *</Label>
            {showNewBrand ? (
              <div className="flex gap-2">
                <Input
                  autoFocus
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Nome da nova marca"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateBrand()}
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => { setShowNewBrand(false); setNewBrandName(""); }}
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  onClick={handleCreateBrand}
                  disabled={!newBrandName.trim() || creatingBrand}
                  className="shrink-0"
                >
                  {creatingBrand ? (
                    <span className="text-xs">...</span>
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select value={brandId} onValueChange={setBrandId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {localBrands.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => setShowNewBrand(true)}
                  title="Adicionar nova marca"
                  className="shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Título da campanha *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Campanha verão Instagram" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Valor (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6A82]" />
                <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="0,00" className="pl-9" inputMode="decimal" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Prazo de entrega</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6A82]" />
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="pl-9" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as DealStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DEAL_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Status do contrato</Label>
            <Select value={contractStatus} onValueChange={(v) => setContractStatus(v as ContractStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sem_contrato">Sem contrato</SelectItem>
                <SelectItem value="enviado">Enviado</SelectItem>
                <SelectItem value="assinado">Assinado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label>Briefing</Label>
            <Textarea value={briefing} onChange={(e) => setBriefing(e.target.value)} placeholder="Detalhes da campanha, tom, referências..." rows={4} />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Entregáveis</Label>
            {deliverables.length > 0 && (
              <ul className="space-y-2">
                {deliverables.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 group">
                    <button
                      onClick={() => toggleDeliverable(i)}
                      className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        d.status !== "pendente" ? "bg-[#5DC93E] border-[#5DC93E]" : "border-[#D1E8C8] hover:border-[#5DC93E]"
                      }`}
                    >
                      {d.status !== "pendente" && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className={`flex-1 text-sm ${d.status !== "pendente" ? "line-through text-[#5A6A82]" : "text-[#1A2547]"}`}>{d.title}</span>
                    <span className="text-xs text-[#5A6A82] bg-[#F0F7EC] rounded-full px-2 py-0.5">
                      {DELIVERABLE_TYPES.find((t) => t.value === d.type)?.label}
                    </span>
                    <button onClick={() => removeDeliverable(i)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <Input value={newDelivTitle} onChange={(e) => setNewDelivTitle(e.target.value)} placeholder="Nome do entregável" className="flex-1 h-9 text-sm" onKeyDown={(e) => e.key === "Enter" && addDeliverable()} />
              <Select value={newDelivType} onValueChange={(v) => setNewDelivType(v as DeliverableType)}>
                <SelectTrigger className="w-28 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{DELIVERABLE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={addDeliverable} className="h-9 px-2.5"><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label>Notas internas</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anotações, histórico de conversas..." rows={3} />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#D1E8C8] px-6 py-4 bg-white flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? "Salvando..." : deal ? "Salvar alterações" : "Criar campanha"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
