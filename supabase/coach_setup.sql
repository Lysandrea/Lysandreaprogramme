-- ════════════════════════════════════════════════════════════════
-- Lysa Andréa — Setup compte coach + migrations
-- Colle tout ce SQL dans Supabase → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════
-- TÂCHE 1 — Compte coach lysaandreacoaching@gmail.com
-- ════════════════════════════════════════════

-- Étape 1 : Vérifier si le compte auth existe
-- Si aucune ligne → aller dans Authentication > Users > "Invite user"
-- avec l'email : lysaandreacoaching@gmail.com
select id, email, created_at
from auth.users
where email = 'lysaandreacoaching@gmail.com';

-- Étape 2 : Créer / forcer le profil coach
insert into public.profiles (id, prenom, role, avatar_url)
select id, 'Lysa', 'coach', 'L'
from auth.users
where email = 'lysaandreacoaching@gmail.com'
on conflict (id) do update set
  prenom     = excluded.prenom,
  role       = excluded.role,
  avatar_url = excluded.avatar_url;

-- Étape 3 : Vérification finale
select p.id, p.prenom, p.role, p.avatar_url, u.email
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'lysaandreacoaching@gmail.com';

-- ════════════════════════════════════════════
-- MIGRATIONS — bilans (colonnes réponse coach)
-- ════════════════════════════════════════════

alter table public.bilans
  add column if not exists reponse_coach    text,
  add column if not exists reponse_coach_at timestamptz;

-- Politique : le coach peut écrire reponse_coach dans les bilans de ses clientes
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'bilans'
      and policyname = 'Coach répond aux bilans de ses clientes'
  ) then
    create policy "Coach répond aux bilans de ses clientes"
      on public.bilans for update
      using (
        exists (
          select 1 from public.profiles
          where id = bilans.cliente_id and coach_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.profiles
          where id = bilans.cliente_id and coach_id = auth.uid()
        )
      );
  end if;
end $$;

-- ════════════════════════════════════════════
-- MIGRATIONS — notifications (politique update)
-- ════════════════════════════════════════════

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'notifications'
      and policyname = 'Coach met à jour ses notifications'
  ) then
    create policy "Coach met à jour ses notifications"
      on public.notifications for update
      using (auth.uid() = coach_id);
  end if;
end $$;

-- ════════════════════════════════════════════
-- AUTO-ASSIGN COACH
-- Lie automatiquement les nouvelles clientes au coach existant
-- ════════════════════════════════════════════

create or replace function public.auto_assign_coach()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_coach_id uuid;
begin
  select id into v_coach_id from public.profiles where role = 'coach' limit 1;
  if v_coach_id is not null then
    update public.profiles set coach_id = v_coach_id where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_cliente_auto_assign on public.profiles;
create trigger on_cliente_auto_assign
  after insert on public.profiles
  for each row
  when (new.role = 'cliente')
  execute procedure public.auto_assign_coach();
