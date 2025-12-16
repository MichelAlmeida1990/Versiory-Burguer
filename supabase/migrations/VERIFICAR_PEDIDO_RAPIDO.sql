-- ============================================
-- VERIFICAÇÃO RÁPIDA: ÚLTIMO PEDIDO
-- ============================================
-- Execute este script para verificar o último pedido criado

-- 1. ÚLTIMO PEDIDO CRIADO
SELECT 
    'ÚLTIMO PEDIDO' as info,
    o.id as pedido_id,
    o.user_id as pedido_user_id,
    o.customer_name as cliente,
    o.customer_email as email,
    o.status,
    o.total,
    o.created_at as criado_em,
    CASE 
        WHEN o.user_id = 'f5f457d9-821e-4a21-9029-e181b1bee792' THEN '✅ É DO DEMO'
        ELSE '❌ NÃO É DO DEMO'
    END as pertence_ao_demo
FROM orders o
ORDER BY o.created_at DESC
LIMIT 1;

-- 2. PRODUTOS DO ÚLTIMO PEDIDO
SELECT 
    'PRODUTOS DO ÚLTIMO PEDIDO' as info,
    o.id as pedido_id,
    p.id as produto_id,
    p.name as produto_nome,
    p.restaurant_id as produto_restaurant_id,
    CASE 
        WHEN p.restaurant_id IS NULL THEN '⚠️ PRODUTO ANTIGO'
        WHEN p.restaurant_id = 'f5f457d9-821e-4a21-9029-e181b1bee792' THEN '✅ PRODUTO DO DEMO'
        ELSE '❓ PRODUTO DE OUTRO'
    END as tipo_produto
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.id = (SELECT id FROM orders ORDER BY created_at DESC LIMIT 1)
ORDER BY p.name;

-- 3. VERIFICAR SE O PEDIDO DEVERIA APARECER NO DEMO
SELECT 
    'ANÁLISE DO ÚLTIMO PEDIDO' as info,
    o.id as pedido_id,
    o.user_id as pedido_user_id,
    CASE 
        WHEN o.user_id = 'f5f457d9-821e-4a21-9029-e181b1bee792' THEN '✅ user_id CORRETO'
        ELSE '❌ user_id INCORRETO - Deveria ser: f5f457d9-821e-4a21-9029-e181b1bee792'
    END as status_user_id,
    COUNT(DISTINCT oi.product_id) as total_produtos,
    COUNT(DISTINCT CASE WHEN p.restaurant_id IS NULL THEN oi.product_id END) as produtos_antigos,
    COUNT(DISTINCT CASE WHEN p.restaurant_id = 'f5f457d9-821e-4a21-9029-e181b1bee792' THEN oi.product_id END) as produtos_do_demo,
    CASE 
        WHEN COUNT(DISTINCT CASE WHEN p.restaurant_id IS NULL THEN oi.product_id END) = COUNT(DISTINCT oi.product_id) THEN '✅ TODOS ANTIGOS - Deve aparecer no demo'
        WHEN COUNT(DISTINCT CASE WHEN p.restaurant_id = 'f5f457d9-821e-4a21-9029-e181b1bee792' THEN oi.product_id END) = COUNT(DISTINCT oi.product_id) THEN '✅ TODOS DO DEMO - Deve aparecer no demo'
        ELSE '⚠️ PRODUTOS MISTURADOS'
    END as conclusao
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.id = (SELECT id FROM orders ORDER BY created_at DESC LIMIT 1)
GROUP BY o.id, o.user_id;

