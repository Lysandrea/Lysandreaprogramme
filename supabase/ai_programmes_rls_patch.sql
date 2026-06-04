-- Permet à la cliente d'insérer son propre programme (généré côté client via API Anthropic)
CREATE POLICY "ai_programmes_cliente_insert_own" ON ai_programmes
  FOR INSERT TO authenticated
  WITH CHECK (cliente_id = auth.uid());

-- Permet à la cliente de relire son propre enregistrement quelle que soit la valeur de statut
-- (nécessaire pour que le dashboard sache si le programme est en attente ou publié)
DROP POLICY IF EXISTS "ai_programmes_cliente_read_published" ON ai_programmes;

CREATE POLICY "ai_programmes_cliente_read_own" ON ai_programmes
  FOR SELECT TO authenticated
  USING (cliente_id = auth.uid());
