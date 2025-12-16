-- ============================================
-- CRIAR CONFIGURAÇÕES EXEMPLO PARA RESTAURANTES
-- ============================================
-- Execute este script para criar configurações de exemplo para os restaurantes
-- Você pode editar depois pelo admin em /admin/settings

-- IMPORTANTE: Execute primeiro o script CRIAR_TABELA_RESTAURANT_SETTINGS.sql

-- Configurações para Tom & Jerry (baseado no design fornecido)
INSERT INTO restaurant_settings (
  restaurant_id,
  restaurant_name,
  home_title,
  home_subtitle,
  home_description,
  primary_color,
  secondary_color
)
SELECT 
  id,
  'Tom & Jerry Pizzaria',
  'A melhor Pizza da cidade',
  'Descubra nossos sabores incríveis',
  'Descubra nossos sabores incríveis. Pizzas artesanais feitas com ingredientes frescos e selecionados.',
  '#ff0000',  -- Vermelho do botão "Ver Cardápio"
  '#25D366'   -- Verde do botão WhatsApp
FROM auth.users
WHERE email = 'tomjerry@gmail.com'
ON CONFLICT (restaurant_id) DO UPDATE
SET
  restaurant_name = EXCLUDED.restaurant_name,
  home_title = EXCLUDED.home_title,
  home_subtitle = EXCLUDED.home_subtitle,
  home_description = EXCLUDED.home_description,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color,
  updated_at = NOW();

-- Configurações para Batatamaria
INSERT INTO restaurant_settings (
  restaurant_id,
  restaurant_name,
  home_title,
  home_subtitle,
  home_description,
  primary_color,
  secondary_color
)
SELECT 
  id,
  'Batatamaria',
  'Bem-vindo à Batatamaria!',
  'Sabor que encanta',
  'Seu restaurante favorito com os melhores sabores.',
  '#ffd700',
  '#ff8c00'
FROM auth.users
WHERE email = 'batatamaria@gmail.com'
ON CONFLICT (restaurant_id) DO UPDATE
SET
  restaurant_name = EXCLUDED.restaurant_name,
  home_title = EXCLUDED.home_title,
  home_subtitle = EXCLUDED.home_subtitle,
  home_description = EXCLUDED.home_description,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color,
  updated_at = NOW();

-- Verificar configurações criadas
SELECT 
  rs.restaurant_name,
  rs.home_title,
  u.email,
  rs.primary_color,
  rs.created_at
FROM restaurant_settings rs
JOIN auth.users u ON u.id = rs.restaurant_id
ORDER BY rs.created_at DESC;

