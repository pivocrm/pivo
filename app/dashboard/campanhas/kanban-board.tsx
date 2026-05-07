"use client";

import { useState, useCallback } from "react";
import {
  DndContext, DragOverlay, closestCorners,
  KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { BrandAvatar } from "@/components/pivo/brand-avatar";
import { CurrencyDisplay } from "@/components/pivo/currency-display";
import { DealDrawer } from "@/components/pivo/deal-drawer";
import { createClient } from "@/lib/supabase/client";
import { syncPaymentForDeal } from "@/lib/supabase/payment-sync";
import { formatDate, isDeadlineOverdue, isDeadlineUrgent } from "@/lib/utils";
import { Plus, Calendar, AlertTriangle } from "lucide-react";
import type { DealWithBrand, DealStatus, BrandRow } from "@/lib/supabase/types";
import { useToast } from "@/hooks/use-toast";

const COLUMNS: { id: DealStatus; label: string }[] = [
  { id: "proposta_recebida", label: "Proposta Recebida" },
  { id: "negociando", label: "Negociando" },
  { id: "contrato", label: "Contrato" },
  { id: "em_andamento", label: "Em Andamento" },
  { id: "aguardando_pagamento", label: "Aguardando Pagamento" },
  { id: "concluido", label: "Concluído" },
];

const COLUMN_COLORS: Record<DealStatus, string> = {
  proposta_recebida: "bg-blue-500",
  negociando: "bg-amber-500",
  contrato: "bg-purple-500",
  em_andamento: "bg-[#5DC93E]",
  aguardando_pagamento: "bg-orange-500",
  concluido: "bg-[#1A2547]",
};

const formatCurrency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format;

interface KanbanCardProps {
  deal: DealWithBrand;
  onClick: () => void;
  isDragging?: boolean;
}

function KanbanCard({ deal, onClick, isDragging }: KanbanCardProps) {
  const brand = deal.brands;
  const overdue = isDeadlineOverdue(deal.deadline);
  const urgent = isDeadlineUrgent(deal.deadline);
  const deadlineColor = overdue ? "text-red-600" : urgent ? "text-amber-600" : "text-[#5A6A82]";

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-[#D1E8C8] p-3.5 cursor-pointer hover:shadow-md hover:border-[#5DC93E]/40 transition-all ${isDragging ? "opacity-50 rotate-2 shadow-lg" : ""}`}
    >
      <div className="flex items-start gap-2.5 mb-3">
        <BrandAvatar name={brand?.name ?? "?"} logoUrl={brand?.logo_url} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#5A6A82] truncate">{brand?.name}</p>
          <p className="text-sm font-semibold text-[#1A2547] leading-snug line-clamp-2">{deal.title}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <CurrencyDisplay value={deal.value} size="sm" className="text-[#1A2547] font-bold" />
        {deal.deadline && (
          <div className={`flex items-center gap-1 text-xs font-medium ${deadlineColor}`}>
            {overdue || urgent ? <AlertTriangle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
            {formatDate(deal.deadline)}
          </div>
        )}
      </div>
      {deal.deliverables && deal.deliverables.length > 0 && (
        <div className="mt-2.5 pt-2.5 border-t border-[#D1E8C8]">
          <div className="flex items-center justify-between text-xs text-[#5A6A82]">
            <span>Entregáveis</span>
            <span className="font-medium">
              {deal.deliverables.filter((d) => d.status !== "pendente").length}/{deal.deliverables.length}
            </span>
          </div>
          <div className="mt-1.5 h-1 bg-[#D1E8C8] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5DC93E] rounded-full"
              style={{ width: `${deal.deliverables.length > 0 ? (deal.deliverables.filter((d) => d.status !== "pendente").length / deal.deliverables.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SortableKanbanCard({ deal, onClick }: { deal: DealWithBrand; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes} {...listeners}>
      <KanbanCard deal={deal} onClick={onClick} isDragging={isDragging} />
    </div>
  );
}

function AddBrandModal({
  onClose,
  userId,
  onBrandCreated,
}: {
  onClose: () => void;
  userId: string;
  onBrandCreated: (brand: Pick<BrandRow, "id" | "name" | "logo_url">) => void;
}) {
  const supabase = createClient();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("brands")
      .insert({ name: name.trim(), user_id: userId } as never)
      .select("id, name, logo_url")
      .single();
    setLoading(false);
    if (error) {
      toast({ variant: "destructive", title: "Erro ao salvar marca", description: error.message });
    } else {
      onBrandCreated(data as Pick<BrandRow, "id" | "name" | "logo_url">);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A2547]/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-xl">
        <p className="text-2xl mb-3 text-center">🏷️</p>
        <h3 className="font-nunito font-black text-[#1A2547] text-lg mb-1 text-center">Adicionar marca</h3>
        <p className="text-[#5A6A82] text-sm mb-5 text-center">Cadastre pelo menos uma marca para criar campanhas.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da marca"
            className="w-full px-3 py-2.5 rounded-xl border border-[#D1E8C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#5DC93E]/40 focus:border-[#5DC93E]"
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={!name.trim() || loading}>
              {loading ? "Salvando..." : "Continuar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  initialDeals: DealWithBrand[];
  brands: Pick<BrandRow, "id" | "name" | "logo_url">[];
  userId: string;
}

export function KanbanBoard({ initialDeals, brands: initialBrands, userId }: KanbanBoardProps) {
  const supabase = createClient();
  const { toast } = useToast();

  const [deals, setDeals] = useState<DealWithBrand[]>(initialDeals);
  const [localBrands, setLocalBrands] = useState(initialBrands);
  const [activeDeal, setActiveDeal] = useState<DealWithBrand | null>(null);
  const [draggingDeal, setDraggingDeal] = useState<DealWithBrand | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerKey, setDrawerKey] = useState(0);
  const [defaultStatus, setDefaultStatus] = useState<DealStatus>("proposta_recebida");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getColumnDeals = useCallback((status: DealStatus) => deals.filter((d) => d.status === status), [deals]);
  const getColumnTotal = useCallback((status: DealStatus) => getColumnDeals(status).reduce((sum, d) => sum + Number(d.value), 0), [getColumnDeals]);

  function openNewDeal(status: DealStatus = "proposta_recebida") {
    setActiveDeal(null);
    setDefaultStatus(status);
    setDrawerKey((k) => k + 1);
    setDrawerOpen(true);
  }

  function openEditDeal(deal: DealWithBrand) {
    setActiveDeal(deal);
    setDrawerOpen(true);
  }

  function handleDragStart(event: DragStartEvent) {
    setDraggingDeal(deals.find((d) => d.id === event.active.id) ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setDraggingDeal(null);
    if (!over) return;

    const draggedDeal = deals.find((d) => d.id === active.id);
    if (!draggedDeal) return;

    const targetStatus = (COLUMNS.find((c) => c.id === over.id)?.id ?? deals.find((d) => d.id === over.id)?.status) as DealStatus | undefined;
    if (!targetStatus || draggedDeal.status === targetStatus) return;

    setDeals((prev) => prev.map((d) => d.id === draggedDeal.id ? { ...d, status: targetStatus } : d));

    const { error } = await supabase
      .from("deals")
      .update({ status: targetStatus, updated_at: new Date().toISOString() } as never)
      .eq("id", draggedDeal.id);

    if (error) {
      setDeals((prev) => prev.map((d) => d.id === draggedDeal.id ? { ...d, status: draggedDeal.status } : d));
      toast({ variant: "destructive", title: "Erro ao mover campanha", description: error.message });
      return;
    }

    await syncPaymentForDeal(supabase, draggedDeal.id, Number(draggedDeal.value), targetStatus);
  }

  function handleSave(savedDeal?: DealWithBrand) {
    if (savedDeal) {
      if (activeDeal) {
        setDeals((prev) => prev.map((d) => d.id === savedDeal.id ? savedDeal : d));
      } else {
        setDeals((prev) => [savedDeal, ...prev]);
      }
    }
    setDrawerOpen(false);
    setActiveDeal(null);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-nunito text-2xl font-black text-[#1A2547]">Pipeline de Campanhas</h1>
          <p className="text-[#5A6A82] text-sm mt-0.5">{deals.length} campanha{deals.length !== 1 ? "s" : ""} no total</p>
        </div>
        <Button onClick={() => openNewDeal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova campanha
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div
          className="flex gap-4 pb-4 w-full overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#F0F7EC] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C8DFC0] hover:[&::-webkit-scrollbar-thumb]:bg-[#5DC93E]/50"
          style={{ minHeight: "calc(100vh - 220px)" }}
        >
          {COLUMNS.map(({ id, label }) => {
            const columnDeals = getColumnDeals(id);
            const total = getColumnTotal(id);
            return (
              <div key={id} className="flex-shrink-0 w-64">
                <div className="flex items-center gap-2 mb-1 px-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${COLUMN_COLORS[id]}`} />
                  <span className="text-sm font-bold text-[#1A2547] flex-1 truncate">{label}</span>
                  <span className="text-xs text-[#5A6A82] font-medium bg-white rounded-full px-2 py-0.5 border border-[#D1E8C8]">{columnDeals.length}</span>
                </div>
                {total > 0 && <p className="text-xs text-[#5A6A82] px-1 mb-3 font-medium">{formatCurrency(total)}</p>}

                <SortableContext id={id} items={columnDeals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                  <div className="min-h-[100px] rounded-xl bg-white/50 border border-dashed border-[#D1E8C8] p-2 space-y-2.5">
                    {columnDeals.map((deal) => (
                      <SortableKanbanCard key={deal.id} deal={deal} onClick={() => openEditDeal(deal)} />
                    ))}
                    {columnDeals.length === 0 && (
                      <p className="text-center text-xs text-[#5A6A82] py-6">Nenhuma campanha</p>
                    )}
                  </div>
                </SortableContext>

                <button
                  onClick={() => openNewDeal(id)}
                  className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#5A6A82] hover:bg-white hover:text-[#1A2547] border border-transparent hover:border-[#D1E8C8] transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar campanha
                </button>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {draggingDeal && <KanbanCard deal={draggingDeal} onClick={() => {}} isDragging />}
        </DragOverlay>
      </DndContext>

      {localBrands.length > 0 ? (
        <DealDrawer
          key={drawerKey}
          deal={activeDeal}
          brands={localBrands}
          open={drawerOpen}
          defaultStatus={defaultStatus}
          onClose={() => { setDrawerOpen(false); setActiveDeal(null); }}
          onSave={handleSave}
          userId={userId}
        />
      ) : drawerOpen && (
        <AddBrandModal
          onClose={() => setDrawerOpen(false)}
          userId={userId}
          onBrandCreated={(newBrand) => {
            setLocalBrands((prev) => [...prev, newBrand]);
            setDrawerKey((k) => k + 1);
          }}
        />
      )}
    </>
  );
}
