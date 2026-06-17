-- =====================================================
-- EXPORT MARKETPLACE SCHEMA  (additive — layers on top of the
-- existing farmer app; nothing is dropped)
--
-- Model: software-light marketplace + escrow.
--   farmer (supply)  ->  export_listings + certifications
--   buyer  (demand)  ->  rfqs, quotes, export_orders
--   admin            ->  verifies certs + drives escrow state machine
--
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- Safe to re-run (idempotent: IF NOT EXISTS / OR REPLACE / drop policy).
-- =====================================================

-- ---------- 0. Roles -------------------------------------------------
-- One account model; a profile is a farmer, a buyer (importer), or admin.
do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('farmer', 'buyer', 'admin');
  end if;
end $$;

alter table public.profiles
  add column if not exists role user_role not null default 'farmer';

-- Importer (foreign buyer) details, 1:1 with a profile that has role='buyer'.
create table if not exists public.buyer_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  company_name text not null,
  country text not null,                 -- destination market
  contact_name text,
  website text,
  vat_number text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- 1. Certifications (trust layer) --------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'cert_type') then
    create type cert_type as enum
      ('global_gap','organic','fairtrade','phytosanitary','iso22000','haccp','other');
  end if;
end $$;

create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.profiles(id) on delete cascade,
  type cert_type not null,
  document_url text,
  issued_date date,
  expiry_date date,
  verified boolean not null default false,   -- set by admin
  created_at timestamptz not null default now()
);

-- ---------- 2. Export listings (supply) ------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'listing_status') then
    create type listing_status as enum ('draft','active','reserved','sold','archived');
  end if;
end $$;

-- Incoterms kept as text (EXW, FOB, CIF, ...) to stay flexible.
create table if not exists public.export_listings (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.profiles(id) on delete cascade,
  crop text not null,
  variety text,
  grade text,                               -- e.g. "Grade A", "16/18 ct"
  quantity_kg numeric(12,2) not null check (quantity_kg > 0),
  price_per_kg numeric(12,2) not null check (price_per_kg >= 0),
  currency text not null default 'USD',
  incoterm text not null default 'FOB',
  origin_region text,                       -- traceability: where it's grown
  available_from date,
  harvest_window text,
  certification_ids uuid[] default '{}',    -- references certifications.id
  photos text[] default '{}',
  description text,
  status listing_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_export_listings_active
  on public.export_listings (status, crop);

-- ---------- 3. RFQs (demand: buyer requests) -------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'rfq_status') then
    create type rfq_status as enum ('open','quoted','closed','cancelled');
  end if;
end $$;

create table if not exists public.rfqs (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  crop text not null,
  grade text,
  quantity_kg numeric(12,2) not null check (quantity_kg > 0),
  target_price_per_kg numeric(12,2),
  currency text not null default 'USD',
  incoterm text not null default 'FOB',
  destination_country text not null,
  needed_by date,
  notes text,
  status rfq_status not null default 'open',
  created_at timestamptz not null default now()
);

-- ---------- 4. Quotes (response to an RFQ or against a listing) ------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'quote_status') then
    create type quote_status as enum ('pending','accepted','rejected','expired');
  end if;
end $$;

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid references public.rfqs(id) on delete set null,
  listing_id uuid references public.export_listings(id) on delete set null,
  farmer_id uuid not null references public.profiles(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  price_per_kg numeric(12,2) not null check (price_per_kg >= 0),
  quantity_kg numeric(12,2) not null check (quantity_kg > 0),
  currency text not null default 'USD',
  incoterm text not null default 'FOB',
  valid_until date,
  status quote_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- ---------- 5. Export orders + escrow state machine -----------------
-- Escrow (software-light): the platform records funding/release states;
-- actual settlement is driven by admin until a PSP is integrated.
do $$ begin
  if not exists (select 1 from pg_type where typname = 'escrow_status') then
    create type escrow_status as enum
      ('awaiting_funding','funded','in_production','shipped','delivered','released','refunded','disputed');
  end if;
end $$;

create table if not exists public.export_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  farmer_id uuid not null references public.profiles(id) on delete restrict,
  listing_id uuid references public.export_listings(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  crop text not null,
  grade text,
  quantity_kg numeric(12,2) not null check (quantity_kg > 0),
  price_per_kg numeric(12,2) not null check (price_per_kg >= 0),
  total_amount numeric(14,2) not null,
  currency text not null default 'USD',
  incoterm text not null default 'FOB',
  destination_country text,
  escrow_status escrow_status not null default 'awaiting_funding',
  tracking_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_export_orders_buyer  on public.export_orders (buyer_id);
create index if not exists idx_export_orders_farmer on public.export_orders (farmer_id);

-- Audit trail for every escrow transition (who, when, from -> to).
create table if not exists public.escrow_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.export_orders(id) on delete cascade,
  from_status escrow_status,
  to_status escrow_status not null,
  actor_id uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

-- ---------- 6. Row Level Security -----------------------------------
alter table public.buyer_profiles  enable row level security;
alter table public.certifications  enable row level security;
alter table public.export_listings enable row level security;
alter table public.rfqs            enable row level security;
alter table public.quotes          enable row level security;
alter table public.export_orders   enable row level security;
alter table public.escrow_events   enable row level security;

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- buyer_profiles: owner manages own; anyone authenticated can read (for trust badges)
drop policy if exists bp_select on public.buyer_profiles;
create policy bp_select on public.buyer_profiles for select using (auth.role() = 'authenticated');
drop policy if exists bp_write on public.buyer_profiles;
create policy bp_write on public.buyer_profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

-- certifications: farmer manages own; everyone authenticated can read (verify trust)
drop policy if exists cert_select on public.certifications;
create policy cert_select on public.certifications for select using (auth.role() = 'authenticated');
drop policy if exists cert_write on public.certifications;
create policy cert_write on public.certifications for all
  using (auth.uid() = farmer_id) with check (auth.uid() = farmer_id);

-- export_listings: anyone authenticated sees active listings; farmer manages own
drop policy if exists el_select on public.export_listings;
create policy el_select on public.export_listings for select
  using (status = 'active' or auth.uid() = farmer_id or public.is_admin());
drop policy if exists el_write on public.export_listings;
create policy el_write on public.export_listings for all
  using (auth.uid() = farmer_id) with check (auth.uid() = farmer_id);

-- rfqs: buyer manages own; farmers can read open RFQs to quote them
drop policy if exists rfq_select on public.rfqs;
create policy rfq_select on public.rfqs for select
  using (status = 'open' or auth.uid() = buyer_id or public.is_admin());
drop policy if exists rfq_write on public.rfqs;
create policy rfq_write on public.rfqs for all
  using (auth.uid() = buyer_id) with check (auth.uid() = buyer_id);

-- quotes: visible to the farmer who made it and the buyer it targets
drop policy if exists q_select on public.quotes;
create policy q_select on public.quotes for select
  using (auth.uid() = farmer_id or auth.uid() = buyer_id or public.is_admin());
drop policy if exists q_insert on public.quotes;
create policy q_insert on public.quotes for insert with check (auth.uid() = farmer_id);
drop policy if exists q_update on public.quotes;
create policy q_update on public.quotes for update
  using (auth.uid() = farmer_id or auth.uid() = buyer_id);

-- export_orders: visible to the two parties + admin; admin drives escrow
drop policy if exists eo_select on public.export_orders;
create policy eo_select on public.export_orders for select
  using (auth.uid() = buyer_id or auth.uid() = farmer_id or public.is_admin());
drop policy if exists eo_insert on public.export_orders;
create policy eo_insert on public.export_orders for insert
  with check (auth.uid() = buyer_id);
drop policy if exists eo_update on public.export_orders;
create policy eo_update on public.export_orders for update
  using (auth.uid() = buyer_id or auth.uid() = farmer_id or public.is_admin());

-- escrow_events: readable by order parties + admin; only admin writes
drop policy if exists ee_select on public.escrow_events;
create policy ee_select on public.escrow_events for select using (
  public.is_admin() or exists (
    select 1 from public.export_orders o
    where o.id = order_id and (o.buyer_id = auth.uid() or o.farmer_id = auth.uid())
  )
);
drop policy if exists ee_insert on public.escrow_events;
create policy ee_insert on public.escrow_events for insert with check (public.is_admin());

-- ---------- 7. updated_at triggers (reuse existing helper) ----------
-- update_updated_at_column() already exists from the base schema.
drop trigger if exists trg_export_listings_updated on public.export_listings;
create trigger trg_export_listings_updated before update on public.export_listings
  for each row execute function public.update_updated_at_column();

drop trigger if exists trg_export_orders_updated on public.export_orders;
create trigger trg_export_orders_updated before update on public.export_orders
  for each row execute function public.update_updated_at_column();
