CREATE TABLE IF NOT EXISTS ai_programmes (
  id                       uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id               uuid REFERENCES profiles(id) ON DELETE CASCADE,
  profil_resume            text,
  programme                jsonb,
  questions_personnalisees jsonb,
  statut                   text NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide', 'publie')),
  generated_at             timestamptz DEFAULT now(),
  valide_at                timestamptz,
  publie_at                timestamptz,
  UNIQUE (cliente_id)
);

ALTER TABLE ai_programmes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_programmes_coach_all" ON ai_programmes
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'coach'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'coach'));

CREATE POLICY "ai_programmes_cliente_read_published" ON ai_programmes
  FOR SELECT TO authenticated
  USING (cliente_id = auth.uid() AND statut = 'publie');

ALTER TABLE bilans ADD COLUMN IF NOT EXISTS reponses_personnalisees jsonb;

ALTER TABLE intake_responses ADD COLUMN IF NOT EXISTS completed boolean DEFAULT false;
