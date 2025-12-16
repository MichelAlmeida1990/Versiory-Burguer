-- ============================================
-- ASSOCIAR PRODUTOS ANTIGOS AO RESTAURANTE LOGADO
-- ============================================
-- Este script permite associar produtos antigos (sem restaurant_id) 
-- ao restaurante logado, para que possam ser usados

-- IMPORTANTE: Execute este script enquanto estiver logado como o restaurante
-- que deseja associar os produtos antigos

-- Exemplo: Associar TODOS os produtos sem restaurant_id ao restaurante logado
-- (Substitua 'SEU_USER_ID_AQUI' pelo UUID do seu usuário do Supabase Auth)

-- Opção 1: Associar TODOS os produtos antigos a um restaurante específico
-- UPDATE products 
-- SET restaurant_id = 'SEU_USER_ID_AQUI'::uuid
-- WHERE restaurant_id IS NULL;

-- Opção 2: Associar apenas produtos de uma categoria específica
-- UPDATE products 
-- SET restaurant_id = 'SEU_USER_ID_AQUI'::uuid
-- WHERE restaurant_id IS NULL 
--   AND category_id = 'ID_DA_CATEGORIA_AQUI'::uuid;

-- Opção 3: Associar produtos por nome (exemplo: todos que começam com "Hambúrguer")
-- UPDATE products 
-- SET restaurant_id = 'SEU_USER_ID_AQUI'::uuid
-- WHERE restaurant_id IS NULL 
--   AND name LIKE 'Hambúrguer%';

-- ============================================
-- COMO OBTER SEU USER_ID:
-- ============================================
-- 1. No Supabase Dashboard, vá em Authentication > Users
-- 2. Encontre seu usuário e copie o UUID
-- OU
-- 3. Execute no SQL Editor:
-- SELECT id, email FROM auth.users WHERE email = 'seu@email.com';

-- ============================================
-- VERIFICAR PRODUTOS ANTIGOS:
-- ============================================
-- SELECT COUNT(*) as total_produtos_sem_restaurante 
-- FROM products 
-- WHERE restaurant_id IS NULL;

-- SELECT id, name, category_id, created_at 
-- FROM products 
-- WHERE restaurant_id IS NULL 
-- ORDER BY created_at DESC;

-- ============================================
-- VERIFICAR PRODUTOS APÓS ASSOCIAÇÃO:
-- ============================================
-- SELECT COUNT(*) as total_produtos_do_restaurante 
-- FROM products 
-- WHERE restaurant_id = 'SEU_USER_ID_AQUI'::uuid;

