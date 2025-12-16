-- ============================================
-- LISTAR APENAS OS EMAILS DOS ADMINS
-- ============================================
-- Versão simplificada: retorna apenas a lista de emails

SELECT 
  u.email
FROM auth.users u
INNER JOIN restaurant_settings rs ON rs.restaurant_id = u.id
ORDER BY u.email;

