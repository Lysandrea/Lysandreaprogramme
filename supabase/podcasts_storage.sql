-- ── Podcasts privés — bucket + RLS ────────────────────────────────────────
--
-- ÉTAPE 1 : Dans le Dashboard Supabase, crée le bucket manuellement :
--   Storage → New bucket
--   Name : podcasts-prives
--   Public bucket : NON (décoché)
--   Puis exécute les politiques RLS ci-dessous dans l'éditeur SQL.
--
-- OU via SQL (si ton projet autorise les insertions dans storage.buckets) :
--
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'podcasts-prives',
--   'podcasts-prives',
--   false,
--   104857600,   -- 100 MB max par fichier
--   ARRAY['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav']
-- )
-- ON CONFLICT (id) DO NOTHING;

-- ── Politique 1 : Clientes avec programme publié ───────────────────────────
CREATE POLICY "clientes_publiees_peuvent_ecouter"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'podcasts-prives'
    AND EXISTS (
      SELECT 1 FROM public.ai_programmes
      WHERE ai_programmes.cliente_id = auth.uid()
        AND ai_programmes.statut     = 'publie'
    )
  );

-- ── Politique 2 : Coach peut tout écouter (pour vérifier la qualité) ───────
CREATE POLICY "coach_peut_ecouter_tout"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'podcasts-prives'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id   = auth.uid()
        AND profiles.role = 'coach'
    )
  );

-- ── Politique 3 : Coach peut uploader des fichiers audio ───────────────────
CREATE POLICY "coach_peut_uploader"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'podcasts-prives'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id   = auth.uid()
        AND profiles.role = 'coach'
    )
  );
