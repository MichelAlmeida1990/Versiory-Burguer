-- ============================================
-- VERIFICAR PIZZARIA TOM & JERRY
-- ============================================
-- Execute este script para verificar se a pizzaria Tom & Jerry está configurada corretamente

-- 1. Verificar usuário
SELECT 
    'Usuário encontrado' as status,
    id,
    email,
    created_at
FROM auth.users
WHERE email = 'tomjerry@gmail.com';

-- 2. Contar categorias do Tom & Jerry
SELECT 
    'Categorias do Tom & Jerry' as info,
    COUNT(*) as total
FROM categories
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com');

-- 3. Contar produtos do Tom & Jerry
SELECT 
    'Produtos do Tom & Jerry' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN available = true THEN 1 END) as ativos,
    COUNT(CASE WHEN available = false THEN 1 END) as inativos
FROM products
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com');

-- 4. Verificar se está tudo OK
DO $$
DECLARE
    v_total_produtos INTEGER;
    v_total_categorias INTEGER;
    v_tomjerry_id UUID;
BEGIN
    SELECT id INTO v_tomjerry_id
    FROM auth.users
    WHERE email = 'tomjerry@gmail.com';
    
    IF v_tomjerry_id IS NULL THEN
        RAISE NOTICE '❌ ERRO: Usuário tomjerry@gmail.com não encontrado!';
        RAISE NOTICE '';
        RAISE NOTICE '📋 SOLUÇÃO:';
        RAISE NOTICE '   1. Vá no Supabase Dashboard > Authentication > Users';
        RAISE NOTICE '   2. Clique em "Add user" ou "Invite user"';
        RAISE NOTICE '   3. Email: tomjerry@gmail.com';
        RAISE NOTICE '   4. Defina uma senha';
        RAISE NOTICE '   5. Execute o script: CRIAR_PIZZARIA_TOM_JERRY.sql';
        RETURN;
    END IF;
    
    SELECT COUNT(*) INTO v_total_categorias
    FROM categories
    WHERE restaurant_id = v_tomjerry_id;
    
    SELECT COUNT(*) INTO v_total_produtos
    FROM products
    WHERE restaurant_id = v_tomjerry_id;
    
    IF v_total_produtos = 0 AND v_total_categorias = 0 THEN
        RAISE NOTICE '⚠️ ATENÇÃO: Tom & Jerry NÃO TEM PRODUTOS/CATEGORIAS!';
        RAISE NOTICE '';
        RAISE NOTICE '📋 SOLUÇÃO:';
        RAISE NOTICE '   Execute o script: CRIAR_PIZZARIA_TOM_JERRY.sql';
        RAISE NOTICE '   Este script copiará todos os produtos e categorias antigos para o Tom & Jerry';
    ELSE
        RAISE NOTICE '✅ Tom & Jerry está configurado!';
        RAISE NOTICE '   - Categorias: %', v_total_categorias;
        RAISE NOTICE '   - Produtos: %', v_total_produtos;
        RAISE NOTICE '';
        RAISE NOTICE '🎉 Pode fazer login com: tomjerry@gmail.com';
    END IF;
END $$;

-- 5. Mostrar alguns produtos do Tom & Jerry (se houver)
SELECT 
    p.id,
    p.name,
    p.price,
    p.available,
    c.name as categoria
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com')
ORDER BY p.name
LIMIT 10;



