-- ============================================
-- LISTAR TODOS OS EMAILS DOS ADMINS CADASTRADOS
-- ============================================
-- Este script lista todos os emails dos usuários que têm
-- configurações na tabela restaurant_settings (são admins de restaurantes)

SELECT 
  u.email,
  rs.restaurant_name,
  u.created_at as data_cadastro,
  u.last_sign_in_at as ultimo_acesso
FROM auth.users u
INNER JOIN restaurant_settings rs ON rs.restaurant_id = u.id
ORDER BY u.email;

-- Versão alternativa: Apenas emails (sem informações adicionais)
-- SELECT 
--   u.email
-- FROM auth.users u
-- INNER JOIN restaurant_settings rs ON rs.restaurant_id = u.id
-- ORDER BY u.email;




