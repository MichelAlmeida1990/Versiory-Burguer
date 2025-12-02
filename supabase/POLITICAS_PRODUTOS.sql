-- Políticas RLS para permitir INSERT e UPDATE de produtos
-- Execute este arquivo no SQL Editor do Supabase se o cadastro de produtos não estiver funcionando

DROP POLICY IF EXISTS "Anyone can create products" ON products;
CREATE POLICY "Anyone can create products" ON products
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update products" ON products;
CREATE POLICY "Anyone can update products" ON products
  FOR UPDATE USING (true);

