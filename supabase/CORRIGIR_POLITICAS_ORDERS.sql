-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA ORDERS
-- ============================================
-- Este script corrige as políticas RLS para orders, removendo a permissão
-- de ver pedidos com user_id IS NULL, garantindo isolamento completo

-- Remover políticas antigas
DROP POLICY IF EXISTS "Restaurants can view own orders" ON orders;
DROP POLICY IF EXISTS "Restaurants can insert own orders" ON orders;
DROP POLICY IF EXISTS "Restaurants can update own orders" ON orders;
DROP POLICY IF EXISTS "Restaurants can delete own orders" ON orders;

-- Criar políticas corrigidas (SEM user_id IS NULL)
CREATE POLICY "Restaurants can view own orders"
  ON orders FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Restaurants can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (user_id = auth.uid()::text OR user_id LIKE 'legacy_%');

CREATE POLICY "Restaurants can update own orders"
  ON orders FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Restaurants can delete own orders"
  ON orders FOR DELETE
  USING (user_id = auth.uid()::text);

-- Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;

