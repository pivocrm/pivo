import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

export function isDeadlineOverdue(deadline: string | null | undefined): boolean {
  if (!deadline) return false;
  return isBefore(new Date(deadline), new Date());
}

export function isDeadlineUrgent(deadline: string | null | undefined): boolean {
  if (!deadline) return false;
  const d = new Date(deadline);
  return isAfter(d, new Date()) && isBefore(d, addDays(new Date(), 2));
}

export function generateBrandColor(name: string): string {
  const colors = [
    "#5DC93E", "#1A2547", "#F59E0B", "#EF4444",
    "#8B5CF6", "#EC4899", "#06B6D4", "#F97316",
    "#10B981", "#6366F1",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function getDaysRemaining(date: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}
