-- ============================================
-- CRIAR CÓPIAS DOS DADOS ANTIGOS PARA CADA RESTAURANTE
-- ============================================
-- Este script cria CÓPIAS dos dados antigos (sem restaurant_id)
-- para cada restaurante, garantindo isolamento total:
-- - botecomario@gmail.com
-- - batatamaria@gmail.com
-- 
-- IMPORTANTE: Cada restaurante terá seus próprios produtos e categorias
-- isolados. Nenhum dado será compartilhado entre restaurantes.
-- Os produtos antigos originais (sem restaurant_id) permanecerão intactos.

DO $$
DECLARE
    uuid_botecomario UUID;
    uuid_batatamaria UUID;
    categorias_copiadas_botecomario INTEGER := 0;
    categorias_copiadas_batatamaria INTEGER := 0;
    produtos_copiados_botecomario INTEGER := 0;
    produtos_copiados_batatamaria INTEGER := 0;
    cat_record RECORD;
    prod_record RECORD;
    nova_categoria_id UUID;
    categoria_mapeamento UUID[]; -- Array para mapear categoria antiga -> nova por restaurante
BEGIN
    -- ============================================
    -- BUSCAR UUIDs DOS USUÁRIOS
    -- ============================================
    SELECT id INTO uuid_botecomario
    FROM auth.users
    WHERE email = 'botecomario@gmail.com';
    
    SELECT id INTO uuid_batatamaria
    FROM auth.users
    WHERE email = 'batatamaria@gmail.com';
    
    IF uuid_botecomario IS NULL THEN
        RAISE EXCEPTION 'Usuário botecomario@gmail.com não encontrado.';
    END IF;
    
    IF uuid_batatamaria IS NULL THEN
        RAISE EXCEPTION 'Usuário batatamaria@gmail.com não encontrado.';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'INICIANDO CÓPIA DE DADOS';
    RAISE NOTICE 'Botecomario UUID: %', uuid_botecomario;
    RAISE NOTICE 'Batatamaria UUID: %', uuid_batatamaria;
    RAISE NOTICE '========================================';
    
    -- ============================================
    -- COPIAR CATEGORIAS PARA BOTECOMARIO
    -- ============================================
    RAISE NOTICE 'Copiando categorias para botecomario...';
    
    FOR cat_record IN 
        SELECT * FROM categories WHERE restaurant_id IS NULL
    LOOP
        INSERT INTO categories (
            name, image, "order", restaurant_id, created_at, updated_at
        ) VALUES (
            cat_record.name,
            cat_record.image,
            cat_record."order",
            uuid_botecomario,
            cat_record.created_at,
            cat_record.updated_at
        ) RETURNING id INTO nova_categoria_id;
        
        categorias_copiadas_botecomario := categorias_copiadas_botecomario + 1;
        
        -- Armazenar mapeamento (usando array simples - categoria antiga na posição)
        -- Nota: Para mapeamento mais complexo, seria necessário uma tabela temporária
    END LOOP;
    
    RAISE NOTICE '✅ Categorias copiadas para botecomario: %', categorias_copiadas_botecomario;
    
    -- ============================================
    -- COPIAR CATEGORIAS PARA BATATAMARIA
    -- ============================================
    RAISE NOTICE 'Copiando categorias para batatamaria...';
    
    FOR cat_record IN 
        SELECT * FROM categories WHERE restaurant_id IS NULL
    LOOP
        INSERT INTO categories (
            name, image, "order", restaurant_id, created_at, updated_at
        ) VALUES (
            cat_record.name,
            cat_record.image,
            cat_record."order",
            uuid_batatamaria,
            cat_record.created_at,
            cat_record.updated_at
        );
        
        categorias_copiadas_batatamaria := categorias_copiadas_batatamaria + 1;
    END LOOP;
    
    RAISE NOTICE '✅ Categorias copiadas para batatamaria: %', categorias_copiadas_batatamaria;
    
    -- ============================================
    -- COPIAR PRODUTOS PARA BOTECOMARIO
    -- ============================================
    RAISE NOTICE 'Copiando produtos para botecomario...';
    
    FOR prod_record IN 
        SELECT * FROM products WHERE restaurant_id IS NULL
    LOOP
        -- Buscar a categoria correspondente no botecomario (se o produto tiver categoria)
        nova_categoria_id := NULL;
        IF prod_record.category_id IS NOT NULL THEN
            SELECT c_nova.id INTO nova_categoria_id
            FROM categories c_antiga
            JOIN categories c_nova ON c_nova.name = c_antiga.name 
                                   AND c_nova."order" = c_antiga."order"
            WHERE c_antiga.id = prod_record.category_id
              AND c_nova.restaurant_id = uuid_botecomario
            LIMIT 1;
        END IF;
        
        INSERT INTO products (
            name, description, price, image, category_id, available, 
            restaurant_id, created_at, updated_at
        ) VALUES (
            prod_record.name,
            prod_record.description,
            prod_record.price,
            prod_record.image,
            nova_categoria_id, -- Nova categoria do botecomario (ou NULL)
            prod_record.available,
            uuid_botecomario,
            prod_record.created_at,
            prod_record.updated_at
        );
        
        produtos_copiados_botecomario := produtos_copiados_botecomario + 1;
    END LOOP;
    
    RAISE NOTICE '✅ Produtos copiados para botecomario: %', produtos_copiados_botecomario;
    
    -- ============================================
    -- COPIAR PRODUTOS PARA BATATAMARIA
    -- ============================================
    RAISE NOTICE 'Copiando produtos para batatamaria...';
    
    FOR prod_record IN 
        SELECT * FROM products WHERE restaurant_id IS NULL
    LOOP
        -- Buscar a categoria correspondente no batatamaria (se o produto tiver categoria)
        nova_categoria_id := NULL;
        IF prod_record.category_id IS NOT NULL THEN
            SELECT c_nova.id INTO nova_categoria_id
            FROM categories c_antiga
            JOIN categories c_nova ON c_nova.name = c_antiga.name 
                                   AND c_nova."order" = c_antiga."order"
            WHERE c_antiga.id = prod_record.category_id
              AND c_nova.restaurant_id = uuid_batatamaria
            LIMIT 1;
        END IF;
        
        INSERT INTO products (
            name, description, price, image, category_id, available, 
            restaurant_id, created_at, updated_at
        ) VALUES (
            prod_record.name,
            prod_record.description,
            prod_record.price,
            prod_record.image,
            nova_categoria_id, -- Nova categoria do batatamaria (ou NULL)
            prod_record.available,
            uuid_batatamaria,
            prod_record.created_at,
            prod_record.updated_at
        );
        
        produtos_copiados_batatamaria := produtos_copiados_batatamaria + 1;
    END LOOP;
    
    RAISE NOTICE '✅ Produtos copiados para batatamaria: %', produtos_copiados_batatamaria;
    
    -- ============================================
    -- RESUMO FINAL
    -- ============================================
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CÓPIA CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'BOTECOMARIO:';
    RAISE NOTICE '  - Categorias: %', categorias_copiadas_botecomario;
    RAISE NOTICE '  - Produtos: %', produtos_copiados_botecomario;
    RAISE NOTICE 'BATATAMARIA:';
    RAISE NOTICE '  - Categorias: %', categorias_copiadas_batatamaria;
    RAISE NOTICE '  - Produtos: %', produtos_copiados_batatamaria;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total de categorias do botecomario: %', (
        SELECT COUNT(*) FROM categories WHERE restaurant_id = uuid_botecomario
    );
    RAISE NOTICE 'Total de produtos do botecomario: %', (
        SELECT COUNT(*) FROM products WHERE restaurant_id = uuid_botecomario
    );
    RAISE NOTICE 'Total de categorias do batatamaria: %', (
        SELECT COUNT(*) FROM categories WHERE restaurant_id = uuid_batatamaria
    );
    RAISE NOTICE 'Total de produtos do batatamaria: %', (
        SELECT COUNT(*) FROM products WHERE restaurant_id = uuid_batatamaria
    );
    RAISE NOTICE '========================================';
END $$;

-- ============================================
-- VERIFICAÇÃO (Execute após o script acima)
-- ============================================

-- Resumo geral de ambos os restaurantes
SELECT 
    'botecomario - Categorias' as restaurante_tipo,
    COUNT(*) as total
FROM categories 
WHERE restaurant_id = (
    SELECT id FROM auth.users WHERE email = 'botecomario@gmail.com'
)
UNION ALL
SELECT 
    'botecomario - Produtos' as restaurante_tipo,
    COUNT(*) as total
FROM products 
WHERE restaurant_id = (
    SELECT id FROM auth.users WHERE email = 'botecomario@gmail.com'
)
UNION ALL
SELECT 
    'batatamaria - Categorias' as restaurante_tipo,
    COUNT(*) as total
FROM categories 
WHERE restaurant_id = (
    SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com'
)
UNION ALL
SELECT 
    'batatamaria - Produtos' as restaurante_tipo,
    COUNT(*) as total
FROM products 
WHERE restaurant_id = (
    SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com'
);

-- Verificar isolamento: produtos do botecomario
SELECT 
    'botecomario' as restaurante,
    COUNT(*) as total_produtos,
    COUNT(DISTINCT restaurant_id) as restaurantes_diferentes
FROM products 
WHERE restaurant_id = (
    SELECT id FROM auth.users WHERE email = 'botecomario@gmail.com'
);

-- Verificar isolamento: produtos do batatamaria
SELECT 
    'batatamaria' as restaurante,
    COUNT(*) as total_produtos,
    COUNT(DISTINCT restaurant_id) as restaurantes_diferentes
FROM products 
WHERE restaurant_id = (
    SELECT id FROM auth.users WHERE email = 'batatamaria@gmail.com'
);

-- Verificar se produtos antigos originais ainda existem
SELECT 
    'Produtos antigos (sem restaurante)' as tipo,
    COUNT(*) as total
FROM products 
WHERE restaurant_id IS NULL
UNION ALL
SELECT 
    'Categorias antigas (sem restaurante)' as tipo,
    COUNT(*) as total
FROM categories 
WHERE restaurant_id IS NULL;
