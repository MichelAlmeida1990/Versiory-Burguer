-- ============================================
-- DEFINIR SLUG PARA TOM & JERRY
-- ============================================
-- Define o slug 'tomjerry' para o restaurante Tom & Jerry

UPDATE restaurant_settings
SET slug = 'tomjerry'
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com');

-- Verificar se foi atualizado
SELECT 
    rs.restaurant_name,
    rs.slug,
    u.email
FROM restaurant_settings rs
JOIN auth.users u ON u.id = rs.restaurant_id
WHERE u.email = 'tomjerry@gmail.com';

