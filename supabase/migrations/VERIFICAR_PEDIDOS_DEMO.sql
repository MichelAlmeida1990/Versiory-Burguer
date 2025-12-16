-- ============================================
-- VERIFICAR PEDIDOS DO DEMO@VERSIORY.COM.BR
-- ============================================

-- 1. Verificar usuário demo
SELECT 
    id,
    email,
    id::text as id_text,
    created_at
FROM auth.users
WHERE email = 'demo@versiory.com.br';

-- 2. Verificar produtos do demo
SELECT 
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN available = true THEN 1 END) as produtos_ativos
FROM products
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'demo@versiory.com.br');

-- 3. Verificar pedidos recentes
SELECT 
    o.id,
    o.user_id,
    o.user_id::text as user_id_text,
    o.customer_name,
    o.customer_email,
    o.status,
    o.created_at,
    (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as total_itens
FROM orders o
WHERE o.created_at >= NOW() - INTERVAL '1 day'
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
        WHEN p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'demo@versiory.com.br') THEN '✅ DEMO'
        WHEN p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'botecomario@gmail.com') THEN '✅ BOTECOMARIO'
        WHEN p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com') THEN '✅ BATATAMARIA'
        WHEN p.restaurant_id IS NULL THEN '⚠️ SEM RESTAURANT_ID'
        ELSE '❓ OUTRO'
    END as produto_restaurante
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.created_at >= NOW() - INTERVAL '1 day'
ORDER BY o.created_at DESC, o.id, oi.product_id;

-- 5. Verificar se há pedidos que deveriam ser do demo mas não estão
SELECT 
    o.id,
    o.user_id,
    o.customer_name,
    o.created_at,
    COUNT(DISTINCT oi.product_id) as total_produtos,
    COUNT(DISTINCT CASE WHEN p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'demo@versiory.com.br') THEN oi.product_id END) as produtos_demo,
    COUNT(DISTINCT CASE WHEN p.restaurant_id IS NULL THEN oi.product_id END) as produtos_sem_restaurante
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.user_id != (SELECT id::text FROM auth.users WHERE email = 'demo@versiory.com.br')
  AND o.created_at >= NOW() - INTERVAL '1 day'
GROUP BY o.id, o.user_id, o.customer_name, o.created_at
HAVING COUNT(DISTINCT CASE WHEN p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'demo@versiory.com.br') THEN oi.product_id END) > 0
ORDER BY o.created_at DESC;

