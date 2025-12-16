-- ============================================
-- CRIAR PIZZARIA TOM & JERRY
-- ============================================
-- Este script apenas verifica se o usuário existe e está configurado corretamente.
-- NÃO copia produtos ou categorias antigas.
-- 
-- IMPORTANTE: 
-- 1. Primeiro crie o usuário no Supabase Auth:
--    - Email: tomjerry@gmail.com
--    - Senha: (defina uma senha)
-- 2. Depois execute este script para verificar se está tudo OK
-- 3. Após executar, você pode começar a criar produtos e categorias pelo admin

DO $$
DECLARE
    uuid_tomjerry UUID;
    categorias_copiadas INTEGER := 0;
    produtos_copiados INTEGER := 0;
BEGIN
    -- ============================================
    -- BUSCAR UUID DO USUÁRIO TOM & JERRY
    -- ============================================
    SELECT id INTO uuid_tomjerry
    FROM auth.users
    WHERE email = 'tomjerry@gmail.com';
    
    IF uuid_tomjerry IS NULL THEN
        RAISE EXCEPTION '❌ ERRO: Usuário tomjerry@gmail.com não encontrado!';
        RAISE NOTICE '';
        RAISE NOTICE '📋 SOLUÇÃO:';
        RAISE NOTICE '   1. Vá no Supabase Dashboard > Authentication > Users';
        RAISE NOTICE '   2. Clique em "Add user" ou "Invite user"';
        RAISE NOTICE '   3. Email: tomjerry@gmail.com';
        RAISE NOTICE '   4. Defina uma senha';
        RAISE NOTICE '   5. Crie o usuário';
        RAISE NOTICE '   6. Execute este script novamente';
        RAISE NOTICE '';
        RETURN;
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICANDO PIZZARIA TOM & JERRY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'UUID: %', uuid_tomjerry;
    RAISE NOTICE 'Email: tomjerry@gmail.com';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    
    -- Verificar dados existentes
    SELECT COUNT(*) INTO categorias_copiadas
    FROM categories
    WHERE restaurant_id = uuid_tomjerry;
    
    SELECT COUNT(*) INTO produtos_copiados
    FROM products
    WHERE restaurant_id = uuid_tomjerry;
    
    RAISE NOTICE '✅ Usuário configurado corretamente!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Status atual:';
    RAISE NOTICE '  - Categorias: %', categorias_copiadas;
    RAISE NOTICE '  - Produtos: %', produtos_copiados;
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ VERIFICAÇÃO CONCLUÍDA!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PIZZARIA TOM & JERRY:';
    RAISE NOTICE '  - Usuário: Configurado ✅';
    RAISE NOTICE '  - Categorias: % (você pode criar pelo admin)', categorias_copiadas;
    RAISE NOTICE '  - Produtos: % (você pode criar pelo admin)', produtos_copiados;
    RAISE NOTICE '';
    RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
    RAISE NOTICE '   1. Faça login no admin com: tomjerry@gmail.com';
    RAISE NOTICE '   2. Acesse: /admin';
    RAISE NOTICE '   3. Crie suas categorias (aba Categories)';
    RAISE NOTICE '   4. Crie seus produtos (aba Products)';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Restaurante pronto para começar!';
    RAISE NOTICE '========================================';
END $$;

-- ============================================
-- VERIFICAÇÃO PÓS-EXECUÇÃO
-- ============================================
-- Execute estas queries para verificar se tudo foi criado corretamente:

SELECT 
    'Usuário Tom & Jerry' as verificação,
    id,
    email,
    created_at
FROM auth.users
WHERE email = 'tomjerry@gmail.com';

SELECT 
    'Categorias do Tom & Jerry' as verificação,
    COUNT(*) as total
FROM categories
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com');

SELECT 
    'Produtos do Tom & Jerry' as verificação,
    COUNT(*) as total,
    COUNT(CASE WHEN available = true THEN 1 END) as ativos,
    COUNT(CASE WHEN available = false THEN 1 END) as inativos
FROM products
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com');

