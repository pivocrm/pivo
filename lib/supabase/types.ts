export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DealStatus =
  | "proposta_recebida"
  | "negociando"
  | "contrato"
  | "em_andamento"
  | "aguardando_pagamento"
  | "concluido";

export type DeliverableType = "post" | "reels" | "stories" | "tiktok" | "youtube";
export type DeliverableStatus = "pendente" | "entregue" | "aprovado";
export type PaymentStatus = "pendente" | "recebido" | "atrasado";
export type UserPlan = "creator" | "agency" | "agency_pro";
export type ContractStatus = "sem_contrato" | "enviado" | "assinado";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          instagram_handle: string | null;
          niche: string | null;
          followers_count: number | null;
          plan: UserPlan;
          trial_ends_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          instagram_handle?: string | null;
          niche?: string | null;
          followers_count?: number | null;
          plan?: UserPlan;
          trial_ends_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          instagram_handle?: string | null;
          niche?: string | null;
          followers_count?: number | null;
          plan?: UserPlan;
          trial_ends_at?: string | null;
          created_at?: string;
        };
      };
      brands: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          logo_url: string | null;
          contact_name: string | null;
          contact_email: string | null;
          contact_whatsapp: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          logo_url?: string | null;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_whatsapp?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          logo_url?: string | null;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_whatsapp?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      deals: {
        Row: {
          id: string;
          user_id: string;
          brand_id: string;
          title: string;
          value: number;
          status: DealStatus;
          deadline: string | null;
          briefing: string | null;
          notes: string | null;
          contract_url: string | null;
          contract_status: ContractStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          brand_id: string;
          title: string;
          value?: number;
          status?: DealStatus;
          deadline?: string | null;
          briefing?: string | null;
          notes?: string | null;
          contract_url?: string | null;
          contract_status?: ContractStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          brand_id?: string;
          title?: string;
          value?: number;
          status?: DealStatus;
          deadline?: string | null;
          briefing?: string | null;
          notes?: string | null;
          contract_url?: string | null;
          contract_status?: ContractStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      deliverables: {
        Row: {
          id: string;
          deal_id: string;
          title: string;
          type: DeliverableType;
          due_date: string | null;
          status: DeliverableStatus;
        };
        Insert: {
          id?: string;
          deal_id: string;
          title: string;
          type: DeliverableType;
          due_date?: string | null;
          status?: DeliverableStatus;
        };
        Update: {
          id?: string;
          deal_id?: string;
          title?: string;
          type?: DeliverableType;
          due_date?: string | null;
          status?: DeliverableStatus;
        };
      };
      payments: {
        Row: {
          id: string;
          deal_id: string;
          amount: number;
          status: PaymentStatus;
          payment_date: string | null;
          invoice_url: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          deal_id: string;
          amount: number;
          status?: PaymentStatus;
          payment_date?: string | null;
          invoice_url?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          deal_id?: string;
          amount?: number;
          status?: PaymentStatus;
          payment_date?: string | null;
          invoice_url?: string | null;
          notes?: string | null;
        };
      };
      media_kit: {
        Row: {
          id: string;
          user_id: string;
          bio: string | null;
          profile_image_url: string | null;
          platforms: Json;
          engagement_rate: number | null;
          past_campaigns: Json;
          contact_email: string | null;
          is_public: boolean;
          slug: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bio?: string | null;
          profile_image_url?: string | null;
          platforms?: Json;
          engagement_rate?: number | null;
          past_campaigns?: Json;
          contact_email?: string | null;
          is_public?: boolean;
          slug: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bio?: string | null;
          profile_image_url?: string | null;
          platforms?: Json;
          engagement_rate?: number | null;
          past_campaigns?: Json;
          contact_email?: string | null;
          is_public?: boolean;
          slug?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Derived types for convenience
export type UserRow = Database["public"]["Tables"]["users"]["Row"];
export type BrandRow = Database["public"]["Tables"]["brands"]["Row"];
export type DealRow = Database["public"]["Tables"]["deals"]["Row"];
export type DeliverableRow =
  Database["public"]["Tables"]["deliverables"]["Row"];
export type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
export type MediaKitRow = Database["public"]["Tables"]["media_kit"]["Row"];

export interface DealWithBrand extends DealRow {
  brands: Pick<BrandRow, "id" | "name" | "logo_url">;
  deliverables?: DeliverableRow[];
  payments?: PaymentRow[];
}

export interface PlatformData {
  instagram?: { handle: string; followers: number };
  tiktok?: { handle: string; followers: number };
  youtube?: { handle: string; subscribers: number };
}

export interface PastCampaign {
  brand_name: string;
  logo_url?: string;
}
