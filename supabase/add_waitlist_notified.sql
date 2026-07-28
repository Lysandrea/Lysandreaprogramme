-- Add notified column to waitlist table
-- Existing rows default to false (not yet notified)
alter table public.waitlist
  add column if not exists notified boolean not null default false;
