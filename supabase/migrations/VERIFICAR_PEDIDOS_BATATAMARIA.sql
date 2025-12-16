-- ============================================
-- VERIFICAR PEDIDOS DO BATATAMARIA
-- ============================================
-- Este script verifica os pedidos associados ao batatamaria@gmail.com
-- e compara com o que está sendo buscado no admin

-- 1. Buscar UUID do batatamaria
SELECT 
    id as user_uuid,
    email,
    created_at
FROM auth.users
WHERE email = 'batatamaria@gmail.com';

-- 2. Verificar pedidos com user_id igual ao UUID do batatamaria
SELECT 
    o.id,
    o.user_id,
    o.customer_name,
    o.customer_email,
    o.status,
    o.total,
    o.created_at,
    CASE 
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'batatamaria@gmail.com') THEN '✅ CORRETO'
        ELSE '❌ DIFERENTE'
    END as status_comparacao
FROM orders o
WHERE o.user_id = (SELECT id::text FROM auth.users WHERE email = 'batatamaria@gmail.com')
ORDER BY o.created_at DESC
LIMIT 20;

-- 3. Verificar TODOS os pedidos recentes (para debug)
SELECT 
    o.id,
    o.user_id,
    o.customer_name,
    o.customer_email,
    o.status,
    o.created_at,
    CASE 
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'batatamaria@gmail.com') THEN '✅ BATATAMARIA'
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'botecomario@gmail.com') THEN '✅ BOTECOMARIO'
        WHEN o.user_id LIKE 'legacy_%' THEN '⚠️ LEGADO'
        ELSE '❓ DESCONHECIDO'
    END as restaurante
FROM orders o
ORDER BY o.created_at DESC
LIMIT 20;

-- 4. Verificar produtos usados nos pedidos do batatamaria
SELECT 
    o.id as pedido_id,
    o.user_id as pedido_user_id,
    o.customer_name,
    oi.product_id,
    p.name as produto_nome,
    p.restaurant_id as produto_restaurant_id,
    CASE 
        WHEN p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com') THEN '✅ CORRETO'
        WHEN p.restaurant_id IS NULL THEN '⚠️ PRODUTO ANTIGO'
        ELSE '❌ DIFERENTE'
    END as status_produto
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.user_id = (SELECT id::text FROM auth.users WHERE email = 'batatamaria@gmail.com')
ORDER BY o.created_at DESC
LIMIT 50;

-- 5. Contar pedidos por restaurante
SELECT 
    CASE 
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'batatamaria@gmail.com') THEN 'batatamaria'
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'botecomario@gmail.com') THEN 'botecomario'
        WHEN o.user_id LIKE 'legacy_%' THEN 'legado'
        ELSE 'outro'
    END as restaurante,
    COUNT(*) as total_pedidos
FROM orders o
GROUP BY 
    CASE 
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'batatamaria@gmail.com') THEN 'batatamaria'
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'botecomario@gmail.com') THEN 'botecomario'
        WHEN o.user_id LIKE 'legacy_%' THEN 'legado'
        ELSE 'outro'
    END;

