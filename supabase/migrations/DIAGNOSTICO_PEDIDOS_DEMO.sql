-- ============================================
-- DIAGNÓSTICO COMPLETO: PEDIDOS DO DEMO
-- ============================================
-- Este script verifica se os pedidos estão sendo salvos corretamente
-- e se a busca no admin está funcionando

-- 1. VERIFICAR UUID DO DEMO
SELECT 
    '1. UUID DO DEMO' as etapa,
    id as demo_uuid,
    email as demo_email,
    created_at as demo_criado_em
FROM auth.users
WHERE email = 'demo@versiory.com.br';

-- 2. VERIFICAR ÚLTIMOS 10 PEDIDOS NO BANCO
SELECT 
    '2. ÚLTIMOS 10 PEDIDOS' as etapa,
    o.id as pedido_id,
    o.user_id as pedido_user_id,
    o.customer_name as cliente_nome,
    o.customer_email as cliente_email,
    o.status as status,
    o.total as total,
    o.created_at as criado_em,
    CASE 
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'demo@versiory.com.br') THEN '✅ DEMO'
        WHEN o.user_id LIKE 'legacy_%' THEN '⚠️ LEGACY'
        ELSE '❓ OUTRO'
    END as tipo_user_id
FROM orders o
ORDER BY o.created_at DESC
LIMIT 10;

-- 3. VERIFICAR PRODUTOS DOS ÚLTIMOS PEDIDOS
SELECT 
    '3. PRODUTOS DOS ÚLTIMOS PEDIDOS' as etapa,
    o.id as pedido_id,
    o.user_id as pedido_user_id,
    oi.product_id,
    p.name as produto_nome,
    p.restaurant_id as produto_restaurant_id,
    CASE 
        WHEN p.restaurant_id IS NULL THEN '⚠️ PRODUTO ANTIGO'
        WHEN p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'demo@versiory.com.br') THEN '✅ PRODUTO DO DEMO'
        ELSE '❓ PRODUTO DE OUTRO RESTAURANTE'
    END as tipo_produto
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.created_at >= NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC, o.id, oi.product_id;

-- 4. VERIFICAR PEDIDOS QUE DEVEM APARECER NO DEMO
SELECT 
    '4. PEDIDOS QUE DEVEM APARECER NO DEMO' as etapa,
    o.id as pedido_id,
    o.user_id as pedido_user_id,
    o.customer_name as cliente_nome,
    o.created_at as criado_em,
    COUNT(DISTINCT oi.product_id) as total_produtos,
    COUNT(DISTINCT CASE WHEN p.restaurant_id IS NULL THEN oi.product_id END) as produtos_antigos,
    COUNT(DISTINCT CASE WHEN p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'demo@versiory.com.br') THEN oi.product_id END) as produtos_do_demo,
    CASE 
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'demo@versiory.com.br') THEN '✅ user_id CORRETO'
        ELSE '❌ user_id INCORRETO'
    END as status_user_id,
    CASE 
        WHEN COUNT(DISTINCT CASE WHEN p.restaurant_id IS NULL THEN oi.product_id END) = COUNT(DISTINCT oi.product_id) THEN '✅ TODOS ANTIGOS'
        WHEN COUNT(DISTINCT CASE WHEN p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'demo@versiory.com.br') THEN oi.product_id END) = COUNT(DISTINCT oi.product_id) THEN '✅ TODOS DO DEMO'
        ELSE '⚠️ MISTURADO'
    END as status_produtos
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY o.id, o.user_id, o.customer_name, o.created_at
HAVING 
    -- Pedidos com user_id do demo
    o.user_id = (SELECT id::text FROM auth.users WHERE email = 'demo@versiory.com.br')
    OR
    -- Pedidos com produtos antigos (devem aparecer no demo)
    COUNT(DISTINCT CASE WHEN p.restaurant_id IS NULL THEN oi.product_id END) = COUNT(DISTINCT oi.product_id)
ORDER BY o.created_at DESC;

-- 5. VERIFICAR COMPARAÇÃO DE UUIDs
SELECT 
    '5. COMPARAÇÃO DE UUIDs' as etapa,
    (SELECT id FROM auth.users WHERE email = 'demo@versiory.com.br') as demo_uuid_do_banco,
    (SELECT id::text FROM auth.users WHERE email = 'demo@versiory.com.br') as demo_uuid_com_cast,
    'f5f457d9-821e-4a21-9029-e181b1bee792' as demo_uuid_hardcoded,
    CASE 
        WHEN (SELECT id::text FROM auth.users WHERE email = 'demo@versiory.com.br') = 'f5f457d9-821e-4a21-9029-e181b1bee792' THEN '✅ UUIDs CORRESPONDEM'
        ELSE '❌ UUIDs NÃO CORRESPONDEM'
    END as comparacao;

-- 6. VERIFICAR PEDIDOS RECENTES COM user_id DIFERENTE DO DEMO
SELECT 
    '6. PEDIDOS COM user_id DIFERENTE DO DEMO' as etapa,
    o.id as pedido_id,
    o.user_id as pedido_user_id,
    o.customer_name as cliente_nome,
    o.created_at as criado_em,
    COUNT(DISTINCT CASE WHEN p.restaurant_id IS NULL THEN oi.product_id END) as produtos_antigos,
    COUNT(DISTINCT oi.product_id) as total_produtos
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.created_at >= NOW() - INTERVAL '7 days'
  AND o.user_id != (SELECT id::text FROM auth.users WHERE email = 'demo@versiory.com.br')
GROUP BY o.id, o.user_id, o.customer_name, o.created_at
HAVING COUNT(DISTINCT CASE WHEN p.restaurant_id IS NULL THEN oi.product_id END) = COUNT(DISTINCT oi.product_id)
ORDER BY o.created_at DESC;

