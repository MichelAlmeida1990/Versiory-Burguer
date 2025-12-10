-- ============================================
-- VERIFICAR PRODUTO DO ÚLTIMO PEDIDO
-- ============================================

-- Verificar qual produto está no pedido e seu restaurant_id
SELECT 
    'PRODUTO DO PEDIDO' as info,
    o.id as pedido_id,
    o.user_id as pedido_user_id,
    p.id as produto_id,
    p.name as produto_nome,
    p.restaurant_id as produto_restaurant_id,
    CASE 
        WHEN p.restaurant_id IS NULL THEN '⚠️ PRODUTO ANTIGO (sem restaurant_id)'
        WHEN p.restaurant_id = 'f5f457d9-821e-4a21-9029-e181b1bee792' THEN '✅ PRODUTO DO DEMO'
        WHEN p.restaurant_id = '21f08dcd-f7fb-4655-a478-625d05fa392f' THEN '❌ PRODUTO DE OUTRO RESTAURANTE'
        ELSE '❓ PRODUTO DE RESTAURANTE DESCONHECIDO'
    END as tipo_produto,
    (SELECT email FROM auth.users WHERE id = p.restaurant_id::uuid) as dono_do_produto
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.id = 'dcb7df7b-9413-418f-8a13-b84b3a3d6313';

-- Verificar qual restaurante tem esse UUID
SELECT 
    'RESTAURANTE DO PEDIDO' as info,
    id as restaurante_id,
    email as restaurante_email,
    created_at as criado_em
FROM auth.users
WHERE id::text = '21f08dcd-f7fb-4655-a478-625d05fa392f';

