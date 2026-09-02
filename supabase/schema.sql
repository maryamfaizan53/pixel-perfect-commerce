-- ============================================================================
--  AI Bazar — full Supabase schema for a FRESH project.
--  Paste this into  Supabase Dashboard → SQL Editor → Run  (project qzmbxrgfrzqkersiorzr).
--  Idempotent-ish: safe to re-run. Already de-Shopified (Sanity ids + COD/Safepay).
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists vector;

-- ---------------------------------------------------------------------------
--  profiles  (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  phone text,
  bio text,
  date_of_birth date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;

do $$ begin
  create policy "own profile - select" on public.profiles for select using (auth.uid() = id);
  create policy "own profile - insert" on public.profiles for insert with check (auth.uid() = id);
  create policy "own profile - update" on public.profiles for update using (auth.uid() = id);
  create policy "own profile - delete" on public.profiles for delete using (auth.uid() = id);
exception when duplicate_object then null; end $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
--  addresses
-- ---------------------------------------------------------------------------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  street_address text not null,
  apartment text,
  city text not null,
  state text not null,
  postal_code text,
  country text not null default 'Pakistan',
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.addresses enable row level security;
do $$ begin
  create policy "own addresses - select" on public.addresses for select using (auth.uid() = user_id);
  create policy "own addresses - insert" on public.addresses for insert with check (auth.uid() = user_id);
  create policy "own addresses - update" on public.addresses for update using (auth.uid() = user_id);
  create policy "own addresses - delete" on public.addresses for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
--  orders  (COD + Safepay; product ids reference Sanity)
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.order_status as enum
    ('pending','confirmed','processing','shipped','delivered','cancelled','refunded');
exception when duplicate_object then null; end $$;

create sequence if not exists public.order_number_seq start 100001;

create or replace function public.next_order_number()
returns text language plpgsql as $$
begin
  return 'AB-' || lpad(nextval('public.order_number_seq')::text, 6, '0');
end; $$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,   -- null = guest
  order_number text unique not null default public.next_order_number(),
  email text not null,
  phone text,
  customer_name text,
  status public.order_status not null default 'pending',
  payment_method text not null default 'cod',        -- 'cod' | 'online'
  payment_provider text,                             -- 'safepay' | null
  payment_status text not null default 'unpaid',     -- 'unpaid' | 'paid' | 'failed' | 'refunded'
  payment_ref text,
  subtotal_price numeric(10,2) not null,
  shipping_fee numeric(10,2) not null default 0,
  total_price numeric(10,2) not null,
  currency_code text not null default 'PKR',
  shipping_address jsonb,
  billing_address jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_payment_status_idx on public.orders(payment_status);

-- Frontend only ever SELECTs its own orders; the backend (service key) inserts/updates.
do $$ begin
  create policy "own orders - select" on public.orders for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,          -- Sanity _id
  product_slug text,
  variant_key text,
  product_title text not null,
  variant_title text,
  quantity integer not null,
  price numeric(10,2) not null,
  total numeric(10,2) not null,
  image_url text,
  created_at timestamptz not null default now()
);
alter table public.order_items enable row level security;
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_product_id_idx on public.order_items(product_id);
do $$ begin
  create policy "own order items - select" on public.order_items for select using (
    exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid())
  );
exception when duplicate_object then null; end $$;

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  created_at timestamptz not null default now()
);
alter table public.order_status_history enable row level security;
do $$ begin
  create policy "own order history - select" on public.order_status_history for select using (
    exists (select 1 from public.orders o where o.id = order_status_history.order_id and o.user_id = auth.uid())
  );
exception when duplicate_object then null; end $$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

create or replace function public.log_order_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') or (old.status is distinct from new.status) then
    insert into public.order_status_history (order_id, status, note) values (new.id, new.status, 'Status updated');
  end if;
  return new;
end; $$;

drop trigger if exists orders_log_status on public.orders;
create trigger orders_log_status after insert or update of status on public.orders
  for each row execute function public.log_order_status();

-- ---------------------------------------------------------------------------
--  product reviews  (product_id / product_handle now = Sanity _id / slug)
-- ---------------------------------------------------------------------------
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id text not null,
  product_handle text not null,
  rating integer not null check (rating between 1 and 5),
  title text,
  content text,
  is_verified_purchase boolean not null default false,
  helpful_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index if not exists product_reviews_product_id_idx on public.product_reviews(product_id);
alter table public.product_reviews enable row level security;
do $$ begin
  create policy "reviews - public read" on public.product_reviews for select using (true);
  create policy "reviews - author insert" on public.product_reviews for insert to authenticated with check (auth.uid() = user_id);
  create policy "reviews - author update" on public.product_reviews for update to authenticated using (auth.uid() = user_id);
  create policy "reviews - author delete" on public.product_reviews for delete to authenticated using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

create table if not exists public.review_helpful_votes (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.product_reviews(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (review_id, user_id)
);
alter table public.review_helpful_votes enable row level security;
do $$ begin
  create policy "votes - public read" on public.review_helpful_votes for select using (true);
  create policy "votes - author insert" on public.review_helpful_votes for insert to authenticated with check (auth.uid() = user_id);
  create policy "votes - author delete" on public.review_helpful_votes for delete to authenticated using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

create or replace function public.sync_review_helpful_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.product_reviews set helpful_count = helpful_count + 1 where id = new.review_id; return new;
  elsif tg_op = 'DELETE' then
    update public.product_reviews set helpful_count = greatest(helpful_count - 1, 0) where id = old.review_id; return old;
  end if;
  return null;
end; $$;

drop trigger if exists review_votes_sync on public.review_helpful_votes;
create trigger review_votes_sync after insert or delete on public.review_helpful_votes
  for each row execute function public.sync_review_helpful_count();

drop trigger if exists reviews_touch on public.product_reviews;
create trigger reviews_touch before update on public.product_reviews
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
--  wishlists  (product_id / product_handle = Sanity _id / slug)
-- ---------------------------------------------------------------------------
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id text not null,
  product_handle text not null,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);
alter table public.wishlists enable row level security;
do $$ begin
  create policy "wishlist - own select" on public.wishlists for select using (auth.uid() = user_id);
  create policy "wishlist - own insert" on public.wishlists for insert with check (auth.uid() = user_id);
  create policy "wishlist - own delete" on public.wishlists for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
--  AI chatbot RAG store
-- ---------------------------------------------------------------------------
create table if not exists public.documents (
  id bigserial primary key,
  content text not null,
  metadata jsonb,
  embedding vector(768)
);

create or replace function public.match_documents (
  query_embedding vector(768), match_threshold float, match_count int
) returns table (id bigint, content text, metadata jsonb, similarity float)
language plpgsql as $$
begin
  return query
    select d.id, d.content, d.metadata, 1 - (d.embedding <=> query_embedding) as similarity
    from public.documents d
    where 1 - (d.embedding <=> query_embedding) > match_threshold
    order by d.embedding <=> query_embedding
    limit match_count;
end; $$;

-- ---------------------------------------------------------------------------
--  avatars storage bucket
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('avatars','avatars',true)
  on conflict (id) do nothing;
do $$ begin
  create policy "avatars public read" on storage.objects for select using (bucket_id = 'avatars');
  create policy "avatars own write" on storage.objects for insert
    with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
  create policy "avatars own update" on storage.objects for update
    using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
  create policy "avatars own delete" on storage.objects for delete
    using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
--  realtime
-- ---------------------------------------------------------------------------
do $$ begin
  alter publication supabase_realtime add table public.wishlists;
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null; end $$;

grant select on public.product_reviews, public.review_helpful_votes to anon;
