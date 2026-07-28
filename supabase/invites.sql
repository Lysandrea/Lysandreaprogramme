-- Invites table — one row per sold spot, created by the stripe-webhook edge function

create table if not exists public.invites (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null,
  token      text        not null unique,
  used       boolean     not null default false,
  created_at timestamptz not null default now()
);

alter table public.invites enable row level security;

-- No direct anon/authenticated SELECT — all access via SECURITY DEFINER functions below.
-- service_role (edge functions) bypasses RLS and can do everything.

-- Returns true if the token exists and has not yet been consumed.
-- Called by the /inscription page before showing the form.
create or replace function public.verify_invite_token(p_token text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.invites
    where token = p_token and used = false
  );
$$;

-- Marks a token as used after the customer successfully creates their account.
-- Called by the /inscription page after signUp succeeds.
create or replace function public.use_invite_token(p_token text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.invites set used = true where token = p_token;
$$;

-- Allow the anon and authenticated roles to call these functions.
-- The functions are SECURITY DEFINER so they run as the table owner,
-- never exposing other rows or emails.
grant execute on function public.verify_invite_token(text) to anon, authenticated;
grant execute on function public.use_invite_token(text)   to anon, authenticated;
