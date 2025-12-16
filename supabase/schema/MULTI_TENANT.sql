-- ============================================
-- SISTEMA MULTI-TENANT (Multi-Restaurante)
-- ============================================
-- Cada restaurante terá seus próprios produtos, categorias e pedidos isolados

-- 1. Adicionar coluna restaurant_id nas tabelas
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_restaurant ON products(restaurant_id);

-- 3. Atualizar orders para usar restaurant_id ao invés de user_id genérico
-- (user_id em orders já existe, mas vamos garantir que seja o ID do restaurante)
-- Não precisamos alterar orders pois já tem user_id que será o ID do restaurante logado

-- 4. Criar políticas RLS (Row Level Security) para isolar dados por restaurante
-- Isso garante que cada restaurante só veja seus próprios dados

-- Habilitar RLS nas tabelas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política para categories: restaurante só vê suas próprias categorias
-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Restaurants can view own categories" ON categories;
DROP POLICY IF EXISTS "Restaurants can insert own categories" ON categories;
DROP POLICY IF EXISTS "Restaurants can update own categories" ON categories;
DROP POLICY IF EXISTS "Restaurants can delete own categories" ON categories;

CREATE POLICY "Restaurants can view own categories"
  ON categories FOR SELECT
  USING (restaurant_id = auth.uid() OR restaurant_id IS NULL);

CREATE POLICY "Restaurants can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (restaurant_id = auth.uid());

CREATE POLICY "Restaurants can update own categories"
  ON categories FOR UPDATE
  USING (restaurant_id = auth.uid());

CREATE POLICY "Restaurants can delete own categories"
  ON categories FOR DELETE
  USING (restaurant_id = auth.uid());

-- Política para products: restaurante só vê seus próprios produtos
-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Restaurants can view own products" ON products;
DROP POLICY IF EXISTS "Restaurants can insert own products" ON products;
DROP POLICY IF EXISTS "Restaurants can update own products" ON products;
DROP POLICY IF EXISTS "Restaurants can delete own products" ON products;

CREATE POLICY "Restaurants can view own products"
  ON products FOR SELECT
  USING (restaurant_id = auth.uid() OR restaurant_id IS NULL);

CREATE POLICY "Restaurants can insert own products"
  ON products FOR INSERT
  WITH CHECK (restaurant_id = auth.uid());

CREATE POLICY "Restaurants can update own products"
  ON products FOR UPDATE
  USING (restaurant_id = auth.uid());

CREATE POLICY "Restaurants can delete own products"
  ON products FOR DELETE
  USING (restaurant_id = auth.uid());

-- Política para orders: restaurante só vê seus próprios pedidos
-- (user_id em orders é VARCHAR, então comparamos como string)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Restaurants can view own orders" ON orders;
DROP POLICY IF EXISTS "Restaurants can insert own orders" ON orders;
DROP POLICY IF EXISTS "Restaurants can update own orders" ON orders;
DROP POLICY IF EXISTS "Restaurants can delete own orders" ON orders;

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

