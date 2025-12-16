-- ============================================
-- ASSOCIAR PRODUTOS ANTIGOS AO DEMO@VERSIORY.COM.BR
-- ============================================
-- Este script associa todos os produtos antigos (sem restaurant_id)
-- ao demo@versiory.com.br, que será a dona desses produtos
-- 
-- Novos produtos cadastrados pelo demo serão criados automaticamente
-- com restaurant_id = demo@versiory.com.br

DO $$
DECLARE
    v_demo_id UUID;
    v_demo_id_text TEXT;
    v_categorias_atualizadas INTEGER := 0;
    v_produtos_atualizados INTEGER := 0;
BEGIN
    -- Obter ID do demo
    SELECT id INTO v_demo_id
    FROM auth.users
    WHERE email = 'demo@versiory.com.br';
    
    IF v_demo_id IS NULL THEN
        RAISE EXCEPTION 'Usuário demo@versiory.com.br não encontrado. Crie o usuário primeiro no Supabase Auth.';
    END IF;
    
    v_demo_id_text := v_demo_id::text;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ASSOCIANDO PRODUTOS ANTIGOS AO DEMO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ID do demo: % (text: %)', v_demo_id, v_demo_id_text;
    RAISE NOTICE '';
    
    -- ============================================
    -- ASSOCIAR CATEGORIAS ANTIGAS AO DEMO
    -- ============================================
    RAISE NOTICE 'Associando categorias antigas ao demo...';
    
    UPDATE categories
    SET restaurant_id = v_demo_id,
        updated_at = NOW()
    WHERE restaurant_id IS NULL;
    
    GET DIAGNOSTICS v_categorias_atualizadas = ROW_COUNT;
    
    RAISE NOTICE '✅ Categorias atualizadas: %', v_categorias_atualizadas;
    
    -- ============================================
    -- ASSOCIAR PRODUTOS ANTIGOS AO DEMO
    -- ============================================
    RAISE NOTICE 'Associando produtos antigos ao demo...';
    
    UPDATE products
    SET restaurant_id = v_demo_id,
        updated_at = NOW()
    WHERE restaurant_id IS NULL;
    
    GET DIAGNOSTICS v_produtos_atualizados = ROW_COUNT;
    
    RAISE NOTICE '✅ Produtos atualizados: %', v_produtos_atualizados;
    
    -- ============================================
    -- RESUMO FINAL
    -- ============================================
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ASSOCIAÇÃO CONCLUÍDA!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Categorias associadas: %', v_categorias_atualizadas;
    RAISE NOTICE 'Produtos associados: %', v_produtos_atualizados;
    RAISE NOTICE '';
    RAISE NOTICE 'Agora demo@versiory.com.br é dona de todos os produtos antigos.';
    RAISE NOTICE 'Novos produtos cadastrados pelo demo terão restaurant_id automaticamente.';
    RAISE NOTICE '========================================';
    
END $$;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar produtos do demo
SELECT 
    'Produtos do demo' as info,
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN available = true THEN 1 END) as produtos_ativos,
    COUNT(CASE WHEN available = false THEN 1 END) as produtos_inativos
FROM products
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'demo@versiory.com.br');

-- Verificar se ainda há produtos sem restaurante
SELECT 
    'Produtos sem restaurante' as info,
    COUNT(*) as total
FROM products
WHERE restaurant_id IS NULL;
-- Deve retornar 0

-- Verificar categorias do demo
SELECT 
    'Categorias do demo' as info,
    COUNT(*) as total_categorias
FROM categories
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'demo@versiory.com.br');

-- Verificar se ainda há categorias sem restaurante
SELECT 
    'Categorias sem restaurante' as info,
    COUNT(*) as total
FROM categories
WHERE restaurant_id IS NULL;
-- Deve retornar 0

-- Listar alguns produtos do demo
SELECT 
    p.id,
    p.name,
    p.price,
    p.available,
    c.name as categoria
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'demo@versiory.com.br')
ORDER BY p.name
LIMIT 10;

