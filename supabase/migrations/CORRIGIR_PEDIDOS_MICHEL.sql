-- ============================================
-- CORRIGIR PEDIDOS DO MICHEL PAULO ALMEIDA
-- ============================================
-- Os pedidos foram criados com user_id errado
-- Vamos corrigir para o ID correto do demo@versiory.com.br

-- 1. Verificar qual é o ID correto do demo
SELECT 
    id,
    email,
    id::text as id_text
FROM auth.users
WHERE email = 'demo@versiory.com.br';

-- 2. Verificar os pedidos do Michel
SELECT 
    o.id,
    o.user_id,
    o.customer_name,
    o.created_at,
    (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as total_itens
FROM orders o
WHERE o.customer_name LIKE '%Michel%'
ORDER BY o.created_at DESC;

-- 3. Corrigir os pedidos do Michel para o ID correto do demo
UPDATE orders
SET user_id = (SELECT id::text FROM auth.users WHERE email = 'demo@versiory.com.br')
WHERE customer_name LIKE '%Michel%'
  AND user_id = '21f08dcd-f7fb-4655-a478-625d05fa392f'
  AND created_at >= NOW() - INTERVAL '7 days';

-- 4. Verificar resultado
SELECT 
    o.id,
    o.user_id,
    o.customer_name,
    o.status,
    o.created_at,
    CASE 
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'demo@versiory.com.br') THEN '✅ CORRETO - DEMO'
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'botecomario@gmail.com') THEN '✅ BOTECOMARIO'
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'batatamaria@gmail.com') THEN '✅ BATATAMARIA'
        ELSE '❓ OUTRO'
    END as restaurante
FROM orders o
WHERE o.customer_name LIKE '%Michel%'
ORDER BY o.created_at DESC;

-- 5. Verificar produtos nos pedidos corrigidos
SELECT 
    o.id as pedido_id,
    o.user_id,
    o.customer_name,
    p.name as produto_nome,
    p.restaurant_id as produto_restaurant_id,
    CASE 
        WHEN p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'demo@versiory.com.br') THEN '✅ DEMO'
        WHEN p.restaurant_id IS NULL THEN '⚠️ SEM RESTAURANT_ID'
        ELSE '❓ OUTRO'
    END as produto_restaurante
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.customer_name LIKE '%Michel%'
ORDER BY o.created_at DESC, o.id, p.name;

