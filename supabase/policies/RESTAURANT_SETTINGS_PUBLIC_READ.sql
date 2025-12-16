-- ============================================
-- POLÍTICA RLS PARA PERMITIR LEITURA PÚBLICA
-- ============================================
-- As configurações dos restaurantes devem ser públicas
-- para que as páginas dos clientes funcionem

-- Remover política restritiva atual
DROP POLICY IF EXISTS "Restaurants can view own settings" ON restaurant_settings;

-- Criar política que permite leitura pública
CREATE POLICY "Public can view restaurant settings"
  ON restaurant_settings FOR SELECT
  USING (true); -- Qualquer pessoa pode ver configurações de restaurantes

