-- ════════════════════════════════════════════════════════════════
-- Lysa Andréa — Nouvelles tables : letters, avis + migration profiles
-- Colle dans Supabase → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════════

-- ── 1. Colonne whatsapp sur profiles ────────────────────────────
alter table public.profiles
  add column if not exists whatsapp text;

-- ── 2. Table letters ────────────────────────────────────────────
create table if not exists public.letters (
  id          uuid        default gen_random_uuid() primary key,
  cliente_id  uuid        references public.profiles(id) on delete cascade unique,
  contenu     text        not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.letters enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='letters' and policyname='Cliente gère sa lettre') then
    create policy "Cliente gère sa lettre"
      on public.letters for all using (auth.uid() = cliente_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='letters' and policyname='Coach lit les lettres') then
    create policy "Coach lit les lettres"
      on public.letters for select
      using (exists (select 1 from public.profiles where id = letters.cliente_id and coach_id = auth.uid()));
  end if;
end $$;

-- ── 3. Table avis ────────────────────────────────────────────────
create table if not exists public.avis (
  id          uuid        default gen_random_uuid() primary key,
  cliente_id  uuid        references public.profiles(id) on delete cascade unique,
  note        int         check (note between 1 and 5),
  commentaire text        not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.avis enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='avis' and policyname='Cliente gère son avis') then
    create policy "Cliente gère son avis"
      on public.avis for all using (auth.uid() = cliente_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='avis' and policyname='Coach lit les avis') then
    create policy "Coach lit les avis"
      on public.avis for select
      using (exists (select 1 from public.profiles where id = avis.cliente_id and coach_id = auth.uid()));
  end if;
end $$;
