-- ============================================
-- IMPORTAR PRODUTOS E CATEGORIAS PARA TOM & JERRY
-- ============================================
-- Este script permite importar categorias e produtos em massa
-- As imagens ficam NULL para serem adicionadas depois pelo admin
--
-- INSTRUÇÕES:
-- 1. Edite este arquivo adicionando suas categorias e produtos abaixo
-- 2. Execute o script no Supabase SQL Editor
-- 3. Depois adicione as imagens pelo admin

DO $$
DECLARE
    uuid_tomjerry UUID;
    cat_id UUID;
    categoria_order INTEGER := 0;
BEGIN
    -- Buscar UUID do usuário Tom & Jerry
    SELECT id INTO uuid_tomjerry
    FROM auth.users
    WHERE email = 'tomjerry@gmail.com';
    
    IF uuid_tomjerry IS NULL THEN
        RAISE EXCEPTION '❌ Usuário tomjerry@gmail.com não encontrado! Crie o usuário primeiro.';
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'IMPORTANDO CATEGORIAS E PRODUTOS';
    RAISE NOTICE 'Restaurante: Tom & Jerry';
    RAISE NOTICE 'UUID: %', uuid_tomjerry;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

    -- ============================================
    -- CATEGORIAS
    -- ============================================
    -- Edite abaixo com suas categorias
    -- Formato: ('Nome da Categoria', ordem)
    
    -- Exemplo de categorias (EDITE CONFORME SUA NECESSIDADE):
    
    -- Categoria 1: Pizzas
    categoria_order := categoria_order + 1;
    INSERT INTO categories (restaurant_id, name, image, "order")
    VALUES (uuid_tomjerry, 'Pizzas', NULL, categoria_order)
    ON CONFLICT DO NOTHING
    RETURNING id INTO cat_id;
    
    IF cat_id IS NOT NULL THEN
        RAISE NOTICE '✅ Categoria criada: Pizzas';
        
        -- Produtos da categoria Pizzas (EDITE OS PREÇOS E DESCRIÇÕES)
        INSERT INTO products (restaurant_id, category_id, name, description, price, image, available)
        VALUES
            (uuid_tomjerry, cat_id, 'Pizza Calabresa', 'Deliciosa pizza de calabresa com queijo', 35.00, NULL, true),
            (uuid_tomjerry, cat_id, 'Pizza Margherita', 'Pizza tradicional com tomate, queijo e manjericão', 32.00, NULL, true),
            (uuid_tomjerry, cat_id, 'Pizza 4 Queijos', 'Pizza com 4 tipos de queijo selecionados', 38.00, NULL, true),
            (uuid_tomjerry, cat_id, 'Pizza Portuguesa', 'Pizza com presunto, ovos, cebola e azeitonas', 36.00, NULL, true);
        
        RAISE NOTICE '   📦 Produtos adicionados: 4';
    END IF;

    -- Categoria 2: Bebidas
    categoria_order := categoria_order + 1;
    INSERT INTO categories (restaurant_id, name, image, "order")
    VALUES (uuid_tomjerry, 'Bebidas', NULL, categoria_order)
    ON CONFLICT DO NOTHING
    RETURNING id INTO cat_id;
    
    IF cat_id IS NOT NULL THEN
        RAISE NOTICE '✅ Categoria criada: Bebidas';
        
        -- Produtos da categoria Bebidas
        INSERT INTO products (restaurant_id, category_id, name, description, price, image, available)
        VALUES
            (uuid_tomjerry, cat_id, 'Refrigerante 350ml', 'Coca-Cola, Pepsi, Guaraná, Fanta', 5.00, NULL, true),
            (uuid_tomjerry, cat_id, 'Refrigerante 2L', 'Coca-Cola, Pepsi, Guaraná, Fanta', 8.00, NULL, true),
            (uuid_tomjerry, cat_id, 'Suco Natural', 'Laranja, Maracujá, Limão', 6.00, NULL, true);
        
        RAISE NOTICE '   📦 Produtos adicionados: 3';
    END IF;

    -- ============================================
    -- ADICIONE MAIS CATEGORIAS AQUI
    -- ============================================
    -- Copie e cole o bloco abaixo, alterando os dados:
    
    /*
    categoria_order := categoria_order + 1;
    INSERT INTO categories (restaurant_id, name, image, "order")
    VALUES (uuid_tomjerry, 'NOME_DA_CATEGORIA', NULL, categoria_order)
    ON CONFLICT DO NOTHING
    RETURNING id INTO cat_id;
    
    IF cat_id IS NOT NULL THEN
        RAISE NOTICE '✅ Categoria criada: NOME_DA_CATEGORIA';
        
        INSERT INTO products (restaurant_id, category_id, name, description, price, image, available)
        VALUES
            (uuid_tomjerry, cat_id, 'Nome do Produto 1', 'Descrição do produto', 0.00, NULL, true),
            (uuid_tomjerry, cat_id, 'Nome do Produto 2', 'Descrição do produto', 0.00, NULL, true);
        
        RAISE NOTICE '   📦 Produtos adicionados';
    END IF;
    */

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ IMPORTAÇÃO CONCLUÍDA!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
    RAISE NOTICE '   1. Faça login no admin: tomjerry@gmail.com';
    RAISE NOTICE '   2. Acesse /admin';
    RAISE NOTICE '   3. Edite os produtos para adicionar imagens';
    RAISE NOTICE '   4. Ajuste preços e descrições conforme necessário';
    RAISE NOTICE '';

END $$;

-- ============================================
-- VERIFICAR DADOS IMPORTADOS
-- ============================================
SELECT 
    'Categorias do Tom & Jerry' as tipo,
    COUNT(*) as total
FROM categories
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com');

SELECT 
    'Produtos do Tom & Jerry' as tipo,
    COUNT(*) as total,
    COUNT(CASE WHEN available = true THEN 1 END) as ativos
FROM products
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com');

SELECT 
    c.name as categoria,
    COUNT(p.id) as total_produtos
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
WHERE c.restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com')
GROUP BY c.name, c.order
ORDER BY c.order;



