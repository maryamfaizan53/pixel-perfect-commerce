-- ============================================================================
--  Let the status-history trigger record the admin's note instead of a generic
--  "Status updated", and give the backend one atomic RPC to update an order.
--  (The old trigger + a manual insert were creating duplicate history rows.)
-- ============================================================================

create or replace function public.create_order_status_history()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') or (old.status is distinct from new.status) then
    insert into public.order_status_history (order_id, status, note)
    values (
      new.id,
      new.status,
      nullif(current_setting('app.order_note', true), '')
    );
  end if;
  return new;
end $$;

-- One call from the backend; the trigger above picks up app.order_note.
create or replace function public.admin_update_order(
  p_id            uuid,
  p_status        text default null,
  p_payment_status text default null,
  p_tracking      text default null,
  p_admin_notes   text default null,
  p_note          text default null
) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform set_config('app.order_note', coalesce(p_note, ''), true);
  update public.orders set
    status         = coalesce(p_status, status),
    payment_status = coalesce(p_payment_status, payment_status),
    tracking_number = coalesce(p_tracking, tracking_number),
    admin_notes    = coalesce(p_admin_notes, admin_notes),
    updated_at     = now()
  where id = p_id;
end $$;
