-- ═══════════════════════════════════════════════════════════════════════
-- FIX 1 — Patch handle_new_user() to always set coach_id on signup
-- Run this in Supabase SQL Editor to apply immediately.
-- (schema.sql has already been updated to match.)
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_role    text;
  v_coach   uuid;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'cliente');

  if v_role = 'cliente' then
    select id into v_coach from public.profiles where role = 'coach' limit 1;
  end if;

  insert into public.profiles (id, prenom, role, coach_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'prenom', split_part(new.email, '@', 1)),
    v_role,
    v_coach
  )
  on conflict (id) do nothing;
  return new;
end;
$$;


-- ═══════════════════════════════════════════════════════════════════════
-- FIX 2 — Safety-net BEFORE INSERT trigger on profiles
-- Fires whenever a cliente row is inserted with coach_id = NULL,
-- regardless of what the frontend or handle_new_user() does.
-- This is the permanent backstop.
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.auto_set_coach_id()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if NEW.role = 'cliente' and NEW.coach_id is null then
    select id into NEW.coach_id
    from public.profiles
    where role = 'coach'
    limit 1;
  end if;
  return NEW;
end;
$$;

drop trigger if exists set_coach_id_on_insert on public.profiles;
create trigger set_coach_id_on_insert
  before insert on public.profiles
  for each row execute procedure public.auto_set_coach_id();


-- ═══════════════════════════════════════════════════════════════════════
-- FIX 3 — Backfill any existing clientes that have coach_id = NULL
-- ═══════════════════════════════════════════════════════════════════════

update public.profiles
set    coach_id = (select id from public.profiles where role = 'coach' limit 1)
where  role     = 'cliente'
and    coach_id is null;
