-- ============================================================
-- PIVO — Schema SQL completo com RLS
-- Executar no Supabase SQL Editor
-- ============================================================

-- Extensão para UUIDs
create extension if not exists "uuid-ossp";

-- ============================================================
-- TIPOS ENUM
-- ============================================================
create type deal_status as enum (
  'proposta_recebida',
  'negociando',
  'contrato',
  'em_andamento',
  'aguardando_pagamento',
  'concluido'
);

create type deliverable_type as enum (
  'post', 'reels', 'stories', 'tiktok', 'youtube'
);

create type deliverable_status as enum (
  'pendente', 'entregue', 'aprovado'
);

create type payment_status as enum (
  'pendente', 'recebido', 'atrasado'
);

create type user_plan as enum (
  'creator', 'agency', 'agency_pro'
);

create type contract_status as enum (
  'sem_contrato', 'enviado', 'assinado'
);

-- ============================================================
-- TABELA: users (perfil público do criador)
-- ============================================================
create table if not exists public.users (
  id           uuid references auth.users(id) on delete cascade primary key,
  email        text not null unique,
  name         text not null,
  avatar_url   text,
  instagram_handle text,
  niche        text,
  followers_count bigint,
  plan         user_plan not null default 'creator',
  trial_ends_at timestamptz,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- TABELA: brands
-- ============================================================
create table if not exists public.brands (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  name            text not null,
  logo_url        text,
  contact_name    text,
  contact_email   text,
  contact_whatsapp text,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- TABELA: deals
-- ============================================================
create table if not exists public.deals (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  brand_id        uuid not null references public.brands(id) on delete restrict,
  title           text not null,
  value           decimal(12, 2) not null default 0,
  status          deal_status not null default 'proposta_recebida',
  deadline        date,
  briefing        text,
  notes           text,
  contract_url    text,
  contract_status contract_status not null default 'sem_contrato',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger deals_updated_at
  before update on public.deals
  for each row execute function public.set_updated_at();

-- ============================================================
-- TABELA: deliverables
-- ============================================================
create table if not exists public.deliverables (
  id         uuid primary key default uuid_generate_v4(),
  deal_id    uuid not null references public.deals(id) on delete cascade,
  title      text not null,
  type       deliverable_type not null,
  due_date   date,
  status     deliverable_status not null default 'pendente'
);

-- ============================================================
-- TABELA: payments
-- ============================================================
create table if not exists public.payments (
  id           uuid primary key default uuid_generate_v4(),
  deal_id      uuid not null references public.deals(id) on delete cascade,
  amount       decimal(12, 2) not null,
  status       payment_status not null default 'pendente',
  payment_date date,
  invoice_url  text,
  notes        text
);

-- ============================================================
-- TABELA: media_kit
-- ============================================================
create table if not exists public.media_kit (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references public.users(id) on delete cascade unique,
  bio                text,
  profile_image_url  text,
  platforms          jsonb not null default '{}',
  engagement_rate    decimal(5, 2),
  past_campaigns     jsonb not null default '[]',
  contact_email      text,
  is_public          boolean not null default false,
  slug               text not null unique
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users        enable row level security;
alter table public.brands       enable row level security;
alter table public.deals        enable row level security;
alter table public.deliverables enable row level security;
alter table public.payments     enable row level security;
alter table public.media_kit    enable row level security;

-- users
create policy "users: own row only"
  on public.users for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- brands
create policy "brands: own rows only"
  on public.brands for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- deals
create policy "deals: own rows only"
  on public.deals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- deliverables — acessado via deal (mesmo dono)
create policy "deliverables: via own deal"
  on public.deliverables for all
  using (
    exists (
      select 1 from public.deals d
      where d.id = deliverables.deal_id
        and d.user_id = auth.uid()
    )
  );

-- payments — acessado via deal (mesmo dono)
create policy "payments: via own deal"
  on public.payments for all
  using (
    exists (
      select 1 from public.deals d
      where d.id = payments.deal_id
        and d.user_id = auth.uid()
    )
  );

-- media_kit — dono edita, público lê se is_public = true
create policy "media_kit: owner full access"
  on public.media_kit for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "media_kit: public read when is_public"
  on public.media_kit for select
  using (is_public = true);

-- ============================================================
-- FUNÇÃO: criar perfil ao registrar
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  trial_date timestamptz := now() + interval '14 days';
begin
  insert into public.users (id, email, name, plan, trial_ends_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'creator',
    trial_date
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
create index if not exists idx_brands_user_id    on public.brands(user_id);
create index if not exists idx_deals_user_id     on public.deals(user_id);
create index if not exists idx_deals_brand_id    on public.deals(brand_id);
create index if not exists idx_deals_status      on public.deals(status);
create index if not exists idx_deliverables_deal on public.deliverables(deal_id);
create index if not exists idx_payments_deal     on public.payments(deal_id);
create index if not exists idx_media_kit_slug    on public.media_kit(slug);
create index if not exists idx_media_kit_user    on public.media_kit(user_id);
