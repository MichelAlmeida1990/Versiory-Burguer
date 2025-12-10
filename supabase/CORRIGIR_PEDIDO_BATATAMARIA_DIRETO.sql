-- ============================================
-- CORRIGIR PEDIDO DO BATATAMARIA (VERSÃO DIRETA)
-- ============================================
-- Este script corrige pedidos que foram criados com ID legado
-- mas que têm produtos do batatamaria

-- 1. Ver pedidos legados que têm produtos do batatamaria
SELECT 
    o.id as pedido_id,
    o.user_id as pedido_user_id_atual,
    o.customer_name,
    o.customer_email,
    o.created_at,
    COUNT(DISTINCT oi.product_id) as total_produtos,
    COUNT(DISTINCT CASE WHEN p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com') THEN oi.product_id END) as produtos_batatamaria,
    COUNT(DISTINCT CASE WHEN p.restaurant_id IS NULL THEN oi.product_id END) as produtos_sem_restaurante,
    COUNT(DISTINCT CASE WHEN p.restaurant_id != (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com') AND p.restaurant_id IS NOT NULL THEN oi.product_id END) as produtos_outro_restaurante
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.user_id LIKE 'legacy_%'
  AND o.created_at >= NOW() - INTERVAL '7 days'
GROUP BY o.id, o.user_id, o.customer_name, o.customer_email, o.created_at
ORDER BY o.created_at DESC;

-- 2. Corrigir pedidos legados que têm APENAS produtos do batatamaria
UPDATE orders
SET user_id = (SELECT id::text FROM auth.users WHERE email = 'batatamaria@gmail.com')
WHERE id IN (
    SELECT o.id
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    WHERE o.user_id LIKE 'legacy_%'
      AND p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com')
    GROUP BY o.id
    HAVING COUNT(DISTINCT CASE WHEN p.restaurant_id != (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com') AND p.restaurant_id IS NOT NULL THEN oi.product_id END) = 0
      AND COUNT(DISTINCT CASE WHEN p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com') THEN oi.product_id END) > 0
);

-- 3. Verificar pedidos após correção
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
        ELSE '❓ OUTRO'
    END as restaurante
FROM orders o
WHERE o.created_at >= NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC;

-- 4. Contar pedidos por restaurante
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


