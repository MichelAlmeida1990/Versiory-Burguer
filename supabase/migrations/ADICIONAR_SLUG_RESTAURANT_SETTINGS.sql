-- ============================================
-- ADICIONAR CAMPO SLUG NA TABELA restaurant_settings
-- ============================================
-- Este campo permite criar URLs amigáveis para cada restaurante
-- Exemplo: /tomjerry, /batatamaria, etc.

-- Adicionar coluna slug se não existir
ALTER TABLE restaurant_settings 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Criar índice para busca rápida por slug
CREATE INDEX IF NOT EXISTS idx_restaurant_settings_slug ON restaurant_settings(slug);

-- Atualizar slugs existentes baseado no nome do restaurante (opcional)
-- Você pode ajustar os slugs manualmente depois
UPDATE restaurant_settings
SET slug = LOWER(REPLACE(REPLACE(REPLACE(restaurant_name, ' ', ''), '&', ''), 'é', 'e'))
WHERE slug IS NULL;

-- Exemplo de slugs para restaurantes conhecidos:
-- UPDATE restaurant_settings 
-- SET slug = 'tomjerry'
-- WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com');

-- UPDATE restaurant_settings 
-- SET slug = 'batatamaria'
-- WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com');

-- Comentário
COMMENT ON COLUMN restaurant_settings.slug IS 'Slug único para URL amigável (ex: tomjerry, batatamaria)';

