-- ============================================
-- DIAGNÓSTICO COMPLETO - BATATAMARIA
-- ============================================
-- Execute este script para diagnosticar o problema

-- 1. Verificar usuário batatamaria
SELECT 
    id,
    email,
    id::text as id_text,
    created_at
FROM auth.users
WHERE email = 'batatamaria@gmail.com';

-- 2. Verificar produtos do batatamaria
SELECT 
    p.id,
    p.name,
    p.restaurant_id,
    p.restaurant_id::text as restaurant_id_text,
    p.available,
    CASE 
        WHEN p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com') THEN '✅ CORRETO'
        WHEN p.restaurant_id IS NULL THEN '⚠️ SEM RESTAURANT_ID'
        ELSE '❌ ERRADO'
    END as status
FROM products p
WHERE p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com')
   OR p.restaurant_id IS NULL
ORDER BY p.restaurant_id NULLS LAST, p.name;

-- 3. Verificar pedidos recentes (últimos 7 dias)
SELECT 
    o.id,
    o.user_id,
    o.user_id::text as user_id_text,
    o.customer_name,
    o.customer_email,
    o.status,
    o.created_at,
    CASE 
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'batatamaria@gmail.com') THEN '✅ BATATAMARIA'
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'botecomario@gmail.com') THEN '✅ BOTECOMARIO'
        WHEN o.user_id LIKE 'legacy_%' THEN '⚠️ LEGADO'
        ELSE '❓ OUTRO'
    END as restaurante_identificado,
    (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as total_itens
FROM orders o
WHERE o.created_at >= NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC;

-- 4. Verificar produtos nos pedidos recentes
SELECT 
    o.id as pedido_id,
    o.user_id as pedido_user_id,
    o.customer_name,
    o.created_at as pedido_criado_em,
    oi.product_id,
    p.name as produto_nome,
    p.restaurant_id as produto_restaurant_id,
    p.restaurant_id::text as produto_restaurant_id_text,
    CASE 
        WHEN p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com') THEN '✅ BATATAMARIA'
        WHEN p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'botecomario@gmail.com') THEN '✅ BOTECOMARIO'
        WHEN p.restaurant_id IS NULL THEN '⚠️ SEM RESTAURANT_ID'
        ELSE '❓ OUTRO'
    END as produto_restaurante
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.created_at >= NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC, o.id, oi.product_id;

-- 5. Verificar pedidos que deveriam ser do batatamaria mas não estão
SELECT 
    o.id,
    o.user_id,
    o.customer_name,
    o.created_at,
    COUNT(DISTINCT oi.product_id) as total_produtos,
    COUNT(DISTINCT CASE WHEN p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com') THEN oi.product_id END) as produtos_batatamaria,
    COUNT(DISTINCT CASE WHEN p.restaurant_id IS NULL THEN oi.product_id END) as produtos_sem_restaurante,
    COUNT(DISTINCT CASE WHEN p.restaurant_id != (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com') AND p.restaurant_id IS NOT NULL THEN oi.product_id END) as produtos_outro_restaurante
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.user_id != (SELECT id::text FROM auth.users WHERE email = 'batatamaria@gmail.com')
  AND o.created_at >= NOW() - INTERVAL '7 days'
GROUP BY o.id, o.user_id, o.customer_name, o.created_at
HAVING COUNT(DISTINCT CASE WHEN p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com') THEN oi.product_id END) > 0
ORDER BY o.created_at DESC;

-- 6. Comparação de tipos (UUID vs TEXT)
SELECT 
    'UUID do batatamaria' as tipo,
    (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com')::text as valor
UNION ALL
SELECT 
    'user_id do último pedido' as tipo,
    (SELECT user_id FROM orders ORDER BY created_at DESC LIMIT 1) as valor;

