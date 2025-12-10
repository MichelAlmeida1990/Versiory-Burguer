-- ============================================
-- VERIFICAÇÃO RÁPIDA: BATATAMARIA TEM PRODUTOS?
-- ============================================
-- Execute este script para verificar se o batatamaria tem produtos cadastrados

-- 1. Verificar usuário
SELECT 
    'Usuário encontrado' as status,
    id,
    email
FROM auth.users
WHERE email = 'batatamaria@gmail.com';

-- 2. Contar produtos do batatamaria
SELECT 
    'Produtos do batatamaria' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN available = true THEN 1 END) as ativos,
    COUNT(CASE WHEN available = false THEN 1 END) as inativos
FROM products
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com');

-- 3. Se não houver produtos, mostrar mensagem
DO $$
DECLARE
    v_total_produtos INTEGER;
    v_batatamaria_id UUID;
BEGIN
    SELECT id INTO v_batatamaria_id
    FROM auth.users
    WHERE email = 'batatamaria@gmail.com';
    
    IF v_batatamaria_id IS NULL THEN
        RAISE NOTICE '❌ ERRO: Usuário batatamaria@gmail.com não encontrado!';
        RAISE NOTICE '   Crie o usuário primeiro no Supabase Auth.';
        RETURN;
    END IF;
    
    SELECT COUNT(*) INTO v_total_produtos
    FROM products
    WHERE restaurant_id = v_batatamaria_id;
    
    IF v_total_produtos = 0 THEN
        RAISE NOTICE '⚠️ ATENÇÃO: Batatamaria NÃO TEM PRODUTOS CADASTRADOS!';
        RAISE NOTICE '';
        RAISE NOTICE '📋 SOLUÇÃO:';
        RAISE NOTICE '   1. Execute o script: ASSOCIAR_PRODUTOS_BOTECOMARIO.sql';
        RAISE NOTICE '   2. Este script copiará todos os produtos antigos para o batatamaria';
        RAISE NOTICE '   3. Depois disso, os pedidos aparecerão no admin';
        RAISE NOTICE '';
        RAISE NOTICE '🔍 Por isso os pedidos não aparecem:';
        RAISE NOTICE '   - Sem produtos com restaurant_id do batatamaria';
        RAISE NOTICE '   - Pedidos são criados com user_id legado';
        RAISE NOTICE '   - Admin busca por user_id do batatamaria e não encontra';
    ELSE
        RAISE NOTICE '✅ Batatamaria tem % produtos cadastrados', v_total_produtos;
        RAISE NOTICE '   Se os pedidos ainda não aparecem, verifique:';
        RAISE NOTICE '   - Se os produtos usados no pedido têm restaurant_id correto';
        RAISE NOTICE '   - Execute o script CORRIGIR_PEDIDOS_BATATAMARIA_AUTO.sql';
    END IF;
END $$;

-- 4. Mostrar alguns produtos do batatamaria (se houver)
SELECT 
    p.id,
    p.name,
    p.price,
    p.available,
    c.name as categoria
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com')
ORDER BY p.name
LIMIT 10;

