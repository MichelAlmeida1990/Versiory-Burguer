-- ============================================
-- VERIFICAR ONDE ESTÃO OS PRODUTOS ANTIGOS
-- ============================================

-- Verificar quantos produtos cada restaurante tem
SELECT 
    'PRODUTOS POR RESTAURANTE' as info,
    COALESCE(u.email, 'SEM RESTAURANTE (NULL)') as restaurante,
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN p.available = true THEN 1 END) as produtos_ativos,
    COUNT(CASE WHEN p.available = false THEN 1 END) as produtos_inativos
FROM products p
LEFT JOIN auth.users u ON u.id = p.restaurant_id::uuid
GROUP BY u.email, p.restaurant_id
ORDER BY total_produtos DESC;

-- Verificar produtos do botecomario (que deveriam ser antigos?)
SELECT 
    'PRODUTOS DO BOTECOMARIO' as info,
    p.id as produto_id,
    p.name as produto_nome,
    p.available as disponivel,
    p.restaurant_id,
    p.created_at as criado_em
FROM products p
WHERE p.restaurant_id = '21f08dcd-f7fb-4655-a478-625d05fa392f'
ORDER BY p.name
LIMIT 20;

-- Verificar produtos do demo
SELECT 
    'PRODUTOS DO DEMO' as info,
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN available = true THEN 1 END) as produtos_ativos
FROM products
WHERE restaurant_id = 'f5f457d9-821e-4a21-9029-e181b1bee792';

