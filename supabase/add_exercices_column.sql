-- Migration : ajoute la colonne exercices_data à bilans
-- Colle dans Supabase → SQL Editor → New query

ALTER TABLE bilans ADD COLUMN IF NOT EXISTS exercices_data jsonb;
