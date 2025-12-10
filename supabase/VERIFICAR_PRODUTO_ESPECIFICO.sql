-- ============================================
-- VERIFICAR PRODUTO ESPECÍFICO DO PEDIDO
-- ============================================

-- Verificar qual produto está no pedido
SELECT 
    'PRODUTO DO PEDIDO' as info,
    o.id as pedido_id,
    o.user_id as pedido_user_id,
    o.customer_name as cliente,
    o.created_at as pedido_criado_em,
    p.id as produto_id,
    p.name as produto_nome,
    p.restaurant_id as produto_restaurant_id,
    p.available as produto_disponivel,
    CASE 
        WHEN p.restaurant_id IS NULL THEN '⚠️ PRODUTO ANTIGO (sem restaurant_id) - Deveria ir para o DEMO'
        WHEN p.restaurant_id = 'f5f457d9-821e-4a21-9029-e181b1bee792' THEN '✅ PRODUTO DO DEMO'
        WHEN p.restaurant_id = '21f08dcd-f7fb-4655-a478-625d05fa392f' THEN '❌ PRODUTO DO BOTECOMARIO'
        ELSE '❓ PRODUTO DE OUTRO RESTAURANTE'
    END as tipo_produto,
    (SELECT email FROM auth.users WHERE id = p.restaurant_id::uuid) as dono_do_produto
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.id = 'dcb7df7b-9413-418f-8a13-b84b3a3d6313';

-- Verificar se existem produtos antigos (sem restaurant_id) disponíveis
SELECT 
    'PRODUTOS ANTIGOS DISPONÍVEIS' as info,
    COUNT(*) as total_produtos_antigos,
    COUNT(CASE WHEN available = true THEN 1 END) as produtos_antigos_ativos
FROM products
WHERE restaurant_id IS NULL;

-- Listar alguns produtos antigos disponíveis
SELECT 
    'LISTA DE PRODUTOS ANTIGOS' as info,
    id as produto_id,
    name as produto_nome,
    available as disponivel,
    restaurant_id
FROM products
WHERE restaurant_id IS NULL
  AND available = true
ORDER BY name
LIMIT 10;

