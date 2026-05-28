-- ════════════════════════════════════════════════
-- Lysa Andréa — Schéma Supabase
-- Colle ce SQL dans : Supabase → SQL Editor → New query
-- ════════════════════════════════════════════════

-- ── 1. Table profiles (liée à auth.users) ──────
create table if not exists public.profiles (
  id                   uuid references auth.users(id) on delete cascade primary key,
  prenom               text        not null default '',
  role                 text        not null default 'cliente'
                       check (role in ('coach', 'cliente')),
  coach_id             uuid        references public.profiles(id),
  current_day          int         not null default 1 check (current_day between 1 and 57),
  programme_start_date date,
  avatar_url           text,
  created_at           timestamptz not null default now()
);

-- ── 2. Table jours ─────────────────────────────
create table if not exists public.jours (
  id               uuid        default gen_random_uuid() primary key,
  cliente_id       uuid        not null references public.profiles(id) on delete cascade,
  jour_num         int         not null check (jour_num between 1 and 56),
  seance_faite     boolean     not null default false,
  date_completion  timestamptz,
  created_at       timestamptz not null default now(),
  unique (cliente_id, jour_num)
);

-- ── 3. Table bilans ────────────────────────────
create table if not exists public.bilans (
  id           uuid        default gen_random_uuid() primary key,
  cliente_id   uuid        not null references public.profiles(id) on delete cascade,
  jour_num     int         not null check (jour_num between 1 and 56),
  gratitude    text        not null default '',
  lecon        text        not null default '',
  corps        int         check (corps between 0 and 4),
  emotion      text        not null default '',
  lacher       text        not null default '',
  created_at   timestamptz not null default now(),
  unique (cliente_id, jour_num)
);

-- ── 4. Table onboarding_progress ──────────────
create table if not exists public.onboarding_progress (
  cliente_id     uuid        primary key references public.profiles(id) on delete cascade,
  etape_actuelle int         not null default 1 check (etape_actuelle between 1 and 5),
  checklist      jsonb       not null default '{}',
  completed      boolean     not null default false,
  completed_at   timestamptz,
  signature      text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── 5. Table intake_responses ──────────────────
create table if not exists public.intake_responses (
  cliente_id   uuid        primary key references public.profiles(id) on delete cascade,
  reponses     jsonb       not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── 6. Table notifications (coach) ─────────────
create table if not exists public.notifications (
  id          uuid        default gen_random_uuid() primary key,
  coach_id    uuid        references public.profiles(id) on delete cascade,
  cliente_id  uuid        references public.profiles(id) on delete cascade,
  message     text        not null default '',
  type        text        not null default 'info',
  read        boolean     not null default false,
  created_at  timestamptz not null default now()
);

-- ── 7. Row Level Security ──────────────────────
alter table public.profiles            enable row level security;
alter table public.jours               enable row level security;
alter table public.bilans              enable row level security;
alter table public.onboarding_progress enable row level security;
alter table public.intake_responses    enable row level security;
alter table public.notifications       enable row level security;

-- profiles : chaque user voit/modifie son propre profil
create policy "Voir son propre profil"
  on public.profiles for select
  using (auth.uid() = id or coach_id = auth.uid());

create policy "Modifier son propre profil"
  on public.profiles for update
  using (auth.uid() = id);

-- Le coach peut modifier le current_day de ses clientes (débloquer)
create policy "Coach modifie ses clientes"
  on public.profiles for update
  using (coach_id = auth.uid());

-- jours : cliente gère ses jours, coach les lit
create policy "Cliente gère ses jours"
  on public.jours for all
  using (auth.uid() = cliente_id);

create policy "Coach lit les jours de ses clientes"
  on public.jours for select
  using (
    exists (
      select 1 from public.profiles
      where id = jours.cliente_id and coach_id = auth.uid()
    )
  );

-- bilans : cliente gère ses bilans, coach les lit
create policy "Cliente gère ses bilans"
  on public.bilans for all
  using (auth.uid() = cliente_id);

create policy "Coach lit les bilans de ses clientes"
  on public.bilans for select
  using (
    exists (
      select 1 from public.profiles
      where id = bilans.cliente_id and coach_id = auth.uid()
    )
  );

-- onboarding_progress policies
create policy "Cliente gère son onboarding"
  on public.onboarding_progress for all
  using (auth.uid() = cliente_id);

create policy "Coach lit l'onboarding de ses clientes"
  on public.onboarding_progress for select
  using (
    exists (
      select 1 from public.profiles
      where id = onboarding_progress.cliente_id and coach_id = auth.uid()
    )
  );

-- intake_responses policies
create policy "Cliente gère ses réponses intake"
  on public.intake_responses for all
  using (auth.uid() = cliente_id);

create policy "Coach lit les réponses intake de ses clientes"
  on public.intake_responses for select
  using (
    exists (
      select 1 from public.profiles
      where id = intake_responses.cliente_id and coach_id = auth.uid()
    )
  );

-- notifications policies
create policy "Coach voit ses notifications"
  on public.notifications for select
  using (auth.uid() = coach_id);

create policy "Système insère des notifications"
  on public.notifications for insert
  with check (true);

-- ── 8. Trigger : profil auto à l'inscription ───
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, prenom, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'prenom', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'cliente')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
