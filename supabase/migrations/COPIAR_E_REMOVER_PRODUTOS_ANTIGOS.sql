-- ============================================
-- COPIAR PRODUTOS ANTIGOS PARA CADA RESTAURANTE E REMOVER OS ANTIGOS
-- ============================================
-- Este script:
-- 1. Copia todos os produtos antigos (sem restaurant_id) para cada restaurante
-- 2. Opcionalmente, remove os produtos antigos originais
-- 
-- IMPORTANTE: Execute a cópia primeiro e verifique se está tudo ok
-- antes de executar a remoção dos produtos antigos

DO $$
DECLARE
    v_restaurante RECORD;
    v_categorias_copiadas INTEGER;
    v_produtos_copiados INTEGER;
    v_cat_record RECORD;
    v_prod_record RECORD;
    v_nova_categoria_id UUID;
    v_total_restaurantes INTEGER := 0;
    v_total_categorias_copiadas INTEGER := 0;
    v_total_produtos_copiados INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'INICIANDO CÓPIA DE PRODUTOS ANTIGOS';
    RAISE NOTICE '========================================';
    
    -- ============================================
    -- PASSO 1: COPIAR PARA CADA RESTAURANTE
    -- ============================================
    FOR v_restaurante IN
        SELECT id, email
        FROM auth.users
        WHERE email IN (
            'botecomario@gmail.com',
            'batatamaria@gmail.com',
            'demo@versiory.com.br'
        )
        ORDER BY email
    LOOP
        v_total_restaurantes := v_total_restaurantes + 1;
        v_categorias_copiadas := 0;
        v_produtos_copiados := 0;
        
        RAISE NOTICE '';
        RAISE NOTICE '----------------------------------------';
        RAISE NOTICE 'Processando restaurante: % (%)', v_restaurante.email, v_restaurante.id;
        RAISE NOTICE '----------------------------------------';
        
        -- Verificar se já tem produtos (evitar duplicar)
        SELECT COUNT(*) INTO v_produtos_copiados
        FROM products
        WHERE restaurant_id = v_restaurante.id;
        
        IF v_produtos_copiados > 0 THEN
            RAISE NOTICE '⚠️ Restaurante já possui % produtos. Pulando...', v_produtos_copiados;
            CONTINUE;
        END IF;
        
        v_produtos_copiados := 0;
        
        -- Copiar categorias antigas
        FOR v_cat_record IN 
            SELECT * FROM categories WHERE restaurant_id IS NULL
        LOOP
            INSERT INTO categories (
                name, image, "order", restaurant_id, created_at, updated_at
            ) VALUES (
                v_cat_record.name,
                v_cat_record.image,
                v_cat_record."order",
                v_restaurante.id,
                COALESCE(v_cat_record.created_at, NOW()),
                COALESCE(v_cat_record.updated_at, NOW())
            );
            
            v_categorias_copiadas := v_categorias_copiadas + 1;
        END LOOP;
        
        v_total_categorias_copiadas := v_total_categorias_copiadas + v_categorias_copiadas;
        RAISE NOTICE '✅ Categorias copiadas: %', v_categorias_copiadas;
        
        -- Copiar produtos antigos
        FOR v_prod_record IN 
            SELECT * FROM products WHERE restaurant_id IS NULL
        LOOP
            -- Buscar a categoria correspondente (se o produto tiver categoria)
            v_nova_categoria_id := NULL;
            IF v_prod_record.category_id IS NOT NULL THEN
                SELECT c_nova.id INTO v_nova_categoria_id
                FROM categories c_antiga
                JOIN categories c_nova ON c_nova.name = c_antiga.name 
                                       AND c_nova."order" = c_antiga."order"
                WHERE c_antiga.id = v_prod_record.category_id
                  AND c_nova.restaurant_id = v_restaurante.id
                LIMIT 1;
            END IF;
            
            INSERT INTO products (
                name, description, price, image, category_id, available, 
                restaurant_id, created_at, updated_at
            ) VALUES (
                v_prod_record.name,
                v_prod_record.description,
                v_prod_record.price,
                v_prod_record.image,
                v_nova_categoria_id,
                COALESCE(v_prod_record.available, true),
                v_restaurante.id,
                COALESCE(v_prod_record.created_at, NOW()),
                COALESCE(v_prod_record.updated_at, NOW())
            );
            
            v_produtos_copiados := v_produtos_copiados + 1;
        END LOOP;
        
        v_total_produtos_copiados := v_total_produtos_copiados + v_produtos_copiados;
        RAISE NOTICE '✅ Produtos copiados: %', v_produtos_copiados;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CÓPIA CONCLUÍDA!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total de restaurantes processados: %', v_total_restaurantes;
    RAISE NOTICE 'Total de categorias copiadas: %', v_total_categorias_copiadas;
    RAISE NOTICE 'Total de produtos copiados: %', v_total_produtos_copiados;
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ IMPORTANTE:';
    RAISE NOTICE '   Verifique se os produtos foram copiados corretamente';
    RAISE NOTICE '   antes de executar a remoção dos produtos antigos.';
    RAISE NOTICE '========================================';
    
END $$;

-- ============================================
-- VERIFICAÇÃO: Contar produtos por restaurante
-- ============================================
SELECT 
    COALESCE(u.email, 'SEM RESTAURANTE') as restaurante,
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN p.available = true THEN 1 END) as produtos_ativos,
    COUNT(CASE WHEN p.available = false THEN 1 END) as produtos_inativos
FROM products p
LEFT JOIN auth.users u ON u.id = p.restaurant_id
GROUP BY u.email, p.restaurant_id
ORDER BY 
    CASE WHEN p.restaurant_id IS NULL THEN 1 ELSE 0 END,
    u.email;

-- ============================================
-- PASSO 2: REMOVER PRODUTOS DUPLICADOS (OPCIONAL)
-- ============================================
-- Esta seção remove produtos duplicados mantendo apenas uma versão por restaurante
-- ⚠️ ATENÇÃO: Execute apenas depois de verificar que os produtos foram copiados corretamente!

-- Verificar produtos duplicados (mesmo nome, mesmo restaurante)
SELECT 
    p.restaurant_id,
    u.email as restaurante,
    p.name,
    COUNT(*) as quantidade_duplicados
FROM products p
LEFT JOIN auth.users u ON u.id = p.restaurant_id
WHERE p.restaurant_id IS NOT NULL
GROUP BY p.restaurant_id, u.email, p.name
HAVING COUNT(*) > 1
ORDER BY p.restaurant_id, p.name;

-- Se quiser remover produtos duplicados, descomente as linhas abaixo:
/*
DO $$
DECLARE
    v_produto_duplicado RECORD;
    v_produtos_removidos INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'REMOVENDO PRODUTOS DUPLICADOS';
    RAISE NOTICE '========================================';
    
    -- Para cada grupo de produtos duplicados, manter apenas o mais antigo
    FOR v_produto_duplicado IN
        SELECT 
            p.restaurant_id,
            p.name,
            MIN(p.id) as id_manter,
            COUNT(*) as total
        FROM products p
        WHERE p.restaurant_id IS NOT NULL
        GROUP BY p.restaurant_id, p.name
        HAVING COUNT(*) > 1
    LOOP
        -- Remover duplicados, mantendo apenas o mais antigo (menor ID)
        DELETE FROM products
        WHERE restaurant_id = v_produto_duplicado.restaurant_id
          AND name = v_produto_duplicado.name
          AND id != v_produto_duplicado.id_manter;
        
        v_produtos_removidos := v_produtos_removidos + (v_produto_duplicado.total - 1);
        
        RAISE NOTICE 'Removidos % duplicados de "%" (restaurante: %)', 
            (v_produto_duplicado.total - 1), 
            v_produto_duplicado.name,
            v_produto_duplicado.restaurant_id;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Total de produtos duplicados removidos: %', v_produtos_removidos;
    RAISE NOTICE '========================================';
END $$;
*/

-- ============================================
-- PASSO 3: REMOVER PRODUTOS ANTIGOS (OPCIONAL)
-- ============================================
-- ⚠️ ATENÇÃO: Descomente as linhas abaixo APENAS depois de verificar
-- que todos os produtos foram copiados corretamente para cada restaurante!

-- Primeiro, verificar quantos produtos antigos existem
SELECT 
    COUNT(*) as total_produtos_antigos,
    COUNT(CASE WHEN available = true THEN 1 END) as produtos_antigos_ativos
FROM products
WHERE restaurant_id IS NULL;

-- Se quiser remover os produtos antigos, descomente as linhas abaixo:
/*
-- Remover produtos antigos (sem restaurant_id)
DELETE FROM products WHERE restaurant_id IS NULL;

-- Remover categorias antigas (sem restaurant_id)
DELETE FROM categories WHERE restaurant_id IS NULL;

RAISE NOTICE '✅ Produtos e categorias antigos removidos!';
*/

-- ============================================
-- NOTAS
-- ============================================
-- 1. Execute o script completo primeiro (cópia)
-- 2. Verifique se todos os restaurantes têm produtos
-- 3. Execute a query de verificação de duplicados (PASSO 2)
-- 4. Se houver duplicados, descomente a seção de remoção de duplicados e execute
-- 5. Teste o sistema
-- 6. Se quiser remover produtos antigos, descomente a seção PASSO 3 e execute

