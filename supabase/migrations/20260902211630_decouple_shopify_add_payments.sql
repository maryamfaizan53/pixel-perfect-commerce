-- ============================================================================
--  Decouple orders from Shopify; add COD + online-payment (Safepay) support.
--  Product identifiers now reference Sanity document _ids / slugs.
-- ============================================================================

-- ---- orders ---------------------------------------------------------------
alter table public.orders
  add column if not exists order_number      text,
  add column if not exists phone             text,
  add column if not exists payment_method    text not null default 'cod',   -- 'cod' | 'online'
  add column if not exists payment_provider  text,                          -- 'safepay' | null
  add column if not exists payment_status    text not null default 'unpaid',-- 'unpaid' | 'paid' | 'failed' | 'refunded'
  add column if not exists payment_ref       text,
  add column if not exists shipping_fee      numeric(10,2) not null default 0,
  add column if not exists notes             text;

-- Backfill order_number from the old Shopify column where present, else generate.
update public.orders
   set order_number = coalesce(order_number, nullif(shopify_order_number, ''), 'AB-' || upper(substr(md5(id::text), 1, 6)))
 where order_number is null;

alter table public.orders alter column order_number set not null;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'orders_order_number_key') then
    alter table public.orders add constraint orders_order_number_key unique (order_number);
  end if;
end $$;

-- Shopify columns are now optional history; drop the NOT NULL / UNIQUE.
alter table public.orders alter column shopify_order_id drop not null;
alter table public.orders alter column shopify_order_number drop not null;
do $$ begin
  if exists (select 1 from pg_constraint where conname = 'orders_shopify_order_id_key') then
    alter table public.orders drop constraint orders_shopify_order_id_key;
  end if;
end $$;

alter table public.orders alter column currency_code set default 'PKR';

create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- ---- order_items --------------------------------------------------------
alter table public.order_items
  add column if not exists product_id   text,   -- Sanity _id
  add column if not exists product_slug text,
  add column if not exists variant_key  text,
  add column if not exists image_url_    text;  -- placeholder if image_url already exists differently

update public.order_items
   set product_id  = coalesce(product_id,  nullif(shopify_product_id, '')),
       variant_key = coalesce(variant_key, nullif(shopify_variant_id, ''))
 where product_id is null;

alter table public.order_items alter column shopify_product_id drop not null;
alter table public.order_items alter column shopify_variant_id drop not null;

alter table public.order_items drop column if exists image_url_;

create index if not exists order_items_product_id_idx on public.order_items (product_id);

-- ---- order-number generator (used by the backend on COD orders) ---------
create or replace function public.next_order_number()
returns text
language plpgsql
as $$
declare
  seq bigint;
begin
  seq := nextval('public.order_number_seq');
  return 'AB-' || lpad(seq::text, 6, '0');
end;
$$;

create sequence if not exists public.order_number_seq start 100001;

-- ---- RLS: allow the service role (backend) to write orders --------------
--  (frontend never inserts orders directly any more — the FastAPI backend does,
--   using the service key, which bypasses RLS. Users keep SELECT on their own.)
drop policy if exists "Users can insert own orders" on public.orders;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'orders' and policyname = 'Users select own orders') then
    create policy "Users select own orders" on public.orders
      for select using (auth.uid() = user_id);
  end if;
end $$;
