DROP POLICY IF EXISTS "Permitir upload de imagens" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura de imagens" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de imagens" ON storage.objects;

CREATE POLICY "Permitir upload de imagens"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Permitir leitura de imagens"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (bucket_id = 'images');

CREATE POLICY "Permitir exclusão de imagens"
ON storage.objects FOR DELETE
TO authenticated, anon
USING (bucket_id = 'images');

