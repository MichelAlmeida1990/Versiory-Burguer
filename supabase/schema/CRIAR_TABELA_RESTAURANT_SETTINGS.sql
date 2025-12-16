-- ============================================
-- TABELA DE CONFIGURAÇÕES DOS RESTAURANTES
-- ============================================
-- Esta tabela armazena configurações personalizadas de cada restaurante
-- como nome, logo, cores, etc.

CREATE TABLE IF NOT EXISTS restaurant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  restaurant_name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  home_banner_url TEXT,
  home_title TEXT,
  home_subtitle TEXT,
  home_description TEXT,
  primary_color VARCHAR(7) DEFAULT '#ccff00', -- Cor primária em hex
  secondary_color VARCHAR(7) DEFAULT '#ff0000', -- Cor secundária em hex
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_restaurant_settings_restaurant_id ON restaurant_settings(restaurant_id);

-- Comentários
COMMENT ON TABLE restaurant_settings IS 'Configurações personalizadas de cada restaurante';
COMMENT ON COLUMN restaurant_settings.restaurant_id IS 'ID do usuário/restaurante no auth.users';
COMMENT ON COLUMN restaurant_settings.restaurant_name IS 'Nome do restaurante para exibir no header';
COMMENT ON COLUMN restaurant_settings.logo_url IS 'URL da imagem do logo';
COMMENT ON COLUMN restaurant_settings.home_banner_url IS 'URL da imagem do banner da home';
COMMENT ON COLUMN restaurant_settings.home_title IS 'Título personalizado da home page';
COMMENT ON COLUMN restaurant_settings.home_subtitle IS 'Subtítulo da home page';
COMMENT ON COLUMN restaurant_settings.home_description IS 'Descrição/sobre o restaurante';

-- Política RLS (Row Level Security)
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;

-- Política: Restaurante só vê/edita suas próprias configurações
DROP POLICY IF EXISTS "Restaurants can view own settings" ON restaurant_settings;
CREATE POLICY "Restaurants can view own settings"
  ON restaurant_settings FOR SELECT
  USING (restaurant_id = auth.uid() OR restaurant_id IS NULL);

DROP POLICY IF EXISTS "Restaurants can insert own settings" ON restaurant_settings;
CREATE POLICY "Restaurants can insert own settings"
  ON restaurant_settings FOR INSERT
  WITH CHECK (restaurant_id = auth.uid());

DROP POLICY IF EXISTS "Restaurants can update own settings" ON restaurant_settings;
CREATE POLICY "Restaurants can update own settings"
  ON restaurant_settings FOR UPDATE
  USING (restaurant_id = auth.uid())
  WITH CHECK (restaurant_id = auth.uid());

-- ============================================
-- FUNÇÃO PARA CRIAR CONFIGURAÇÕES PADRÃO
-- ============================================
-- Ao criar um novo restaurante, criar configurações padrão automaticamente
-- (Pode ser chamada manualmente ou via trigger se necessário)

-- ============================================
-- EXEMPLO: Criar configurações para restaurantes existentes
-- ============================================

-- Para Tom & Jerry (substitua pelo UUID real do usuário)
-- INSERT INTO restaurant_settings (restaurant_id, restaurant_name, home_title, home_subtitle, home_description, primary_color, secondary_color)
-- SELECT id, 'Tom & Jerry Pizzaria', 'Bem-vindo à Tom & Jerry!', 'As melhores pizzas da cidade', 'Descubra nossos sabores incríveis', '#ff6b00', '#ff0000'
-- FROM auth.users WHERE email = 'tomjerry@gmail.com'
-- ON CONFLICT (restaurant_id) DO NOTHING;

-- Para Batatamaria (substitua pelo UUID real do usuário)
-- INSERT INTO restaurant_settings (restaurant_id, restaurant_name, home_title, home_subtitle, home_description, primary_color, secondary_color)
-- SELECT id, 'Batatamaria', 'Bem-vindo à Batatamaria!', 'Sabor que encanta', 'Seu restaurante favorito', '#ffd700', '#ff8c00'
-- FROM auth.users WHERE email = 'batatamaria@gmail.com'
-- ON CONFLICT (restaurant_id) DO NOTHING;

-- ============================================
-- QUERY PARA VERIFICAR CONFIGURAÇÕES
-- ============================================
-- SELECT 
--   rs.*,
--   u.email
-- FROM restaurant_settings rs
-- JOIN auth.users u ON u.id = rs.restaurant_id;

