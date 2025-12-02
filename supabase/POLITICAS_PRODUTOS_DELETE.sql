-- Política RLS para permitir DELETE de produtos
-- Execute este arquivo no SQL Editor do Supabase se a exclusão de produtos não estiver funcionando

DROP POLICY IF EXISTS "Anyone can delete products" ON products;
CREATE POLICY "Anyone can delete products" ON products
  FOR DELETE
  TO authenticated, anon
  USING (true);

