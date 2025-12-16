-- ============================================
-- VERIFICAR PRODUTOS DO BATATAMARIA
-- ============================================

-- 1. Verificar se o usuário batatamaria existe
SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE email = 'batatamaria@gmail.com';

-- 2. Verificar quantos produtos o batatamaria tem
SELECT 
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN available = true THEN 1 END) as produtos_ativos,
    COUNT(CASE WHEN available = false THEN 1 END) as produtos_inativos
FROM products
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com');

-- 3. Listar produtos do batatamaria
SELECT 
    p.id,
    p.name,
    p.restaurant_id,
    p.available,
    c.name as categoria
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com')
ORDER BY p.name;

-- 4. Verificar produtos SEM restaurant_id (produtos antigos)
SELECT 
    COUNT(*) as total_produtos_sem_restaurante,
    COUNT(CASE WHEN available = true THEN 1 END) as produtos_ativos_sem_restaurante
FROM products
WHERE restaurant_id IS NULL;

-- 5. Listar alguns produtos sem restaurant_id
SELECT 
    p.id,
    p.name,
    p.available,
    c.name as categoria
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.restaurant_id IS NULL
ORDER BY p.name
LIMIT 20;
