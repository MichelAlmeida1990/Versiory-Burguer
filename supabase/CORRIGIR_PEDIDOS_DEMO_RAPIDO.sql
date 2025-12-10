-- ============================================
-- CORRIGIR PEDIDOS DO DEMO - VERSÃO RÁPIDA
-- ============================================
-- Corrige todos os pedidos do Michel e outros que foram criados
-- com user_id errado para o ID correto do demo@versiory.com.br

-- 1. Verificar ID do demo
SELECT 
    id,
    email,
    id::text as id_text
FROM auth.users
WHERE email = 'demo@versiory.com.br';

-- 2. Verificar pedidos que precisam ser corrigidos
SELECT 
    o.id,
    o.user_id,
    o.customer_name,
    o.created_at,
    CASE 
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'demo@versiory.com.br') THEN '✅ CORRETO'
        ELSE '❌ PRECISA CORRIGIR'
    END as status
FROM orders o
WHERE o.created_at >= NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC;

-- 3. CORRIGIR TODOS OS PEDIDOS DO MICHEL
UPDATE orders
SET user_id = (SELECT id::text FROM auth.users WHERE email = 'demo@versiory.com.br')
WHERE customer_name LIKE '%Michel%'
  AND user_id != (SELECT id::text FROM auth.users WHERE email = 'demo@versiory.com.br')
  AND created_at >= NOW() - INTERVAL '7 days';

-- 4. CORRIGIR TODOS OS PEDIDOS COM user_id = '21f08dcd-f7fb-4655-a478-625d05fa392f'
-- (ID errado que estava sendo usado)
UPDATE orders
SET user_id = (SELECT id::text FROM auth.users WHERE email = 'demo@versiory.com.br')
WHERE user_id = '21f08dcd-f7fb-4655-a478-625d05fa392f'
  AND created_at >= NOW() - INTERVAL '7 days';

-- 5. Verificar resultado
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
WHERE o.created_at >= NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC;

-- 6. Contar pedidos por restaurante
SELECT 
    CASE 
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'demo@versiory.com.br') THEN 'demo'
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'botecomario@gmail.com') THEN 'botecomario'
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'batatamaria@gmail.com') THEN 'batatamaria'
        WHEN o.user_id LIKE 'legacy_%' THEN 'legado'
        ELSE 'outro'
    END as restaurante,
    COUNT(*) as total_pedidos
FROM orders o
WHERE o.created_at >= NOW() - INTERVAL '7 days'
GROUP BY 
    CASE 
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'demo@versiory.com.br') THEN 'demo'
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'botecomario@gmail.com') THEN 'botecomario'
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'batatamaria@gmail.com') THEN 'batatamaria'
        WHEN o.user_id LIKE 'legacy_%' THEN 'legado'
        ELSE 'outro'
    END
ORDER BY restaurante;

