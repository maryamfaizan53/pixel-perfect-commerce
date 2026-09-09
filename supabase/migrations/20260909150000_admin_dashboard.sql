-- ============================================================================
--  Admin dashboard: order fulfilment columns + reporting functions.
-- ============================================================================

alter table public.orders
  add column if not exists tracking_number text,
  add column if not exists admin_notes     text;

-- Keep updated_at fresh on every write (column exists, no trigger yet).
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

create index if not exists orders_status_created_idx on public.orders (status, created_at desc);
create index if not exists orders_email_idx on public.orders (lower(email));

-- ---- KPI numbers for a time window -----------------------------------------
--  Revenue = total_price of every order except cancelled / refunded.
create or replace function public.admin_order_stats(p_start timestamptz, p_end timestamptz)
returns json language sql stable as $$
  with o as (
    select * from public.orders where created_at >= p_start and created_at < p_end
  ),
  live as (select * from o where status not in ('cancelled','refunded'))
  select json_build_object(
    'revenue',        coalesce((select sum(total_price) from live), 0),
    'orderCount',     (select count(*) from o),
    'liveOrderCount', (select count(*) from live),
    'aov',            coalesce((select avg(total_price) from live), 0),
    'newCustomers',   (select count(distinct lower(email)) from o),
    'pendingCount',   (select count(*) from o where status = 'pending'),
    'cancelledCount', (select count(*) from o where status = 'cancelled'),
    'paidCount',      (select count(*) from o where payment_status = 'paid'),
    'unpaidCount',    (select count(*) from o where payment_status = 'unpaid'),
    'codCount',       (select count(*) from o where payment_method = 'cod'),
    'onlineCount',    (select count(*) from o where payment_method = 'online'),
    'byStatus',       (select coalesce(json_object_agg(status, c), '{}'::json)
                        from (select status, count(*) c from o group by status) s)
  );
$$;

-- ---- daily revenue series (zero-filled) ------------------------------------
create or replace function public.admin_daily_revenue(p_start date, p_end date)
returns table(day date, revenue numeric, orders int)
language sql stable as $$
  with days as (
    select generate_series(p_start, p_end, interval '1 day')::date as day
  ),
  agg as (
    select created_at::date as day,
           sum(total_price) filter (where status not in ('cancelled','refunded')) as revenue,
           count(*) as orders
    from public.orders
    where created_at::date between p_start and p_end
    group by 1
  )
  select d.day,
         coalesce(a.revenue, 0)::numeric as revenue,
         coalesce(a.orders, 0)::int      as orders
  from days d left join agg a using (day)
  order by d.day;
$$;

-- ---- top-selling products in a window (Phase 2, cheap to add now) ---------
create or replace function public.admin_top_products(p_start timestamptz, p_limit int)
returns table(product_id text, product_slug text, product_title text, qty bigint, revenue numeric)
language sql stable as $$
  select oi.product_id,
         max(oi.product_slug)  as product_slug,
         max(oi.product_title) as product_title,
         sum(oi.quantity)      as qty,
         sum(oi.total)         as revenue
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where o.created_at >= p_start
    and o.status not in ('cancelled','refunded')
  group by oi.product_id
  order by qty desc
  limit p_limit;
$$;
