-- ============================================
-- VERIFICAÇÃO FINAL APÓS MOVIMENTAÇÃO
-- ============================================

-- 1. Verificar produtos do demo
SELECT 
    'PRODUTOS DO DEMO' as info,
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN available = true THEN 1 END) as produtos_ativos,
    COUNT(CASE WHEN available = false THEN 1 END) as produtos_inativos
FROM products
WHERE restaurant_id = 'f5f457d9-821e-4a21-9029-e181b1bee792';

-- 2. Verificar produtos do botecomario (deve estar zerado)
SELECT 
    'PRODUTOS DO BOTECOMARIO' as info,
    COUNT(*) as total_produtos
FROM products
WHERE restaurant_id = '21f08dcd-f7fb-4655-a478-625d05fa392f';

-- 3. Verificar pedidos do demo
SELECT 
    'PEDIDOS DO DEMO' as info,
    o.id as pedido_id,
    o.user_id as pedido_user_id,
    o.customer_name as cliente,
    o.status,
    o.total,
    o.created_at as criado_em
FROM orders o
WHERE o.user_id = 'f5f457d9-821e-4a21-9029-e181b1bee792'
ORDER BY o.created_at DESC;

-- 4. Verificar se o pedido tem produtos do demo
SELECT 
    'PRODUTOS DO PEDIDO DO DEMO' as info,
    o.id as pedido_id,
    p.id as produto_id,
    p.name as produto_nome,
    p.restaurant_id as produto_restaurant_id,
    CASE 
        WHEN p.restaurant_id = 'f5f457d9-821e-4a21-9029-e181b1bee792' THEN '✅ PRODUTO DO DEMO'
        ELSE '❌ PRODUTO DE OUTRO RESTAURANTE'
    END as status
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.user_id = 'f5f457d9-821e-4a21-9029-e181b1bee792'
ORDER BY o.created_at DESC, p.name;

