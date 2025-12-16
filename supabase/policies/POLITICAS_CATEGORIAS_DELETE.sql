-- Política RLS para permitir DELETE de categorias
-- Execute este arquivo no SQL Editor do Supabase se a exclusão de categorias não estiver funcionando

DROP POLICY IF EXISTS "Anyone can delete categories" ON categories;
CREATE POLICY "Anyone can delete categories" ON categories
  FOR DELETE
  TO authenticated, anon
  USING (true);

