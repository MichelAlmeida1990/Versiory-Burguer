-- ============================================
-- IMPORTAR CATEGORIAS E PRODUTOS TOM & JERRY
-- ============================================
-- Este script importa as categorias e produtos iniciais da Pizzaria Tom & Jerry
-- baseado no site: https://pizzariatomejerry.wabiz.delivery/

DO $$
DECLARE
    uuid_tomjerry UUID;
    cat_pizza_broto_salgada UUID;
    cat_pizza_broto_4p_salgada UUID;
    cat_pizza_broto_4p_doce UUID;
    cat_pizzas_grandes UUID;
    cat_promocao UUID;
    cat_lanches UUID;
    cat_porcoes UUID;
    cat_combos UUID;
    cat_bebidas UUID;
    cat_acai UUID;
    cat_troca_fidelidade UUID;
BEGIN
    -- ============================================
    -- BUSCAR UUID DO USUÁRIO TOM & JERRY
    -- ============================================
    SELECT id INTO uuid_tomjerry
    FROM auth.users
    WHERE email = 'tomjerry@gmail.com';
    
    IF uuid_tomjerry IS NULL THEN
        RAISE EXCEPTION '❌ ERRO: Usuário tomjerry@gmail.com não encontrado! Crie o usuário primeiro.';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'IMPORTANDO DADOS TOM & JERRY';
    RAISE NOTICE 'UUID: %', uuid_tomjerry;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    
    -- ============================================
    -- CRIAR CATEGORIAS
    -- ============================================
    RAISE NOTICE '📁 Criando categorias...';
    
    -- Pizza Broto Salgada
    SELECT id INTO cat_pizza_broto_salgada
    FROM categories
    WHERE name = 'Pizza Broto Salgada' AND restaurant_id = uuid_tomjerry;
    
    IF cat_pizza_broto_salgada IS NULL THEN
        INSERT INTO categories (name, "order", restaurant_id)
        VALUES ('Pizza Broto Salgada', 1, uuid_tomjerry)
        RETURNING id INTO cat_pizza_broto_salgada;
    END IF;
    
    -- Pizza Broto 4P Salgada
    SELECT id INTO cat_pizza_broto_4p_salgada
    FROM categories
    WHERE name = 'Pizza Broto 4P Salgada' AND restaurant_id = uuid_tomjerry;
    
    IF cat_pizza_broto_4p_salgada IS NULL THEN
        INSERT INTO categories (name, "order", restaurant_id)
        VALUES ('Pizza Broto 4P Salgada', 2, uuid_tomjerry)
        RETURNING id INTO cat_pizza_broto_4p_salgada;
    END IF;
    
    -- Pizza Broto 4P Doce
    SELECT id INTO cat_pizza_broto_4p_doce
    FROM categories
    WHERE name = 'Pizza Broto 4P Doce' AND restaurant_id = uuid_tomjerry;
    
    IF cat_pizza_broto_4p_doce IS NULL THEN
        INSERT INTO categories (name, "order", restaurant_id)
        VALUES ('Pizza Broto 4P Doce', 3, uuid_tomjerry)
        RETURNING id INTO cat_pizza_broto_4p_doce;
    END IF;
    
    -- Pizzas Grandes
    SELECT id INTO cat_pizzas_grandes
    FROM categories
    WHERE name = 'Pizzas Grandes' AND restaurant_id = uuid_tomjerry;
    
    IF cat_pizzas_grandes IS NULL THEN
        INSERT INTO categories (name, "order", restaurant_id)
        VALUES ('Pizzas Grandes', 4, uuid_tomjerry)
        RETURNING id INTO cat_pizzas_grandes;
    END IF;
    
    -- PROMOÇÃO
    SELECT id INTO cat_promocao
    FROM categories
    WHERE name = 'PROMOÇÃO' AND restaurant_id = uuid_tomjerry;
    
    IF cat_promocao IS NULL THEN
        INSERT INTO categories (name, "order", restaurant_id)
        VALUES ('PROMOÇÃO', 5, uuid_tomjerry)
        RETURNING id INTO cat_promocao;
    END IF;
    
    -- Lanches
    SELECT id INTO cat_lanches
    FROM categories
    WHERE name = 'Lanches' AND restaurant_id = uuid_tomjerry;
    
    IF cat_lanches IS NULL THEN
        INSERT INTO categories (name, "order", restaurant_id)
        VALUES ('Lanches', 6, uuid_tomjerry)
        RETURNING id INTO cat_lanches;
    END IF;
    
    -- Porções
    SELECT id INTO cat_porcoes
    FROM categories
    WHERE name = 'Porções' AND restaurant_id = uuid_tomjerry;
    
    IF cat_porcoes IS NULL THEN
        INSERT INTO categories (name, "order", restaurant_id)
        VALUES ('Porções', 7, uuid_tomjerry)
        RETURNING id INTO cat_porcoes;
    END IF;
    
    -- Combos
    SELECT id INTO cat_combos
    FROM categories
    WHERE name = 'Combos' AND restaurant_id = uuid_tomjerry;
    
    IF cat_combos IS NULL THEN
        INSERT INTO categories (name, "order", restaurant_id)
        VALUES ('Combos', 8, uuid_tomjerry)
        RETURNING id INTO cat_combos;
    END IF;
    
    -- Bebidas
    SELECT id INTO cat_bebidas
    FROM categories
    WHERE name = 'Bebidas' AND restaurant_id = uuid_tomjerry;
    
    IF cat_bebidas IS NULL THEN
        INSERT INTO categories (name, "order", restaurant_id)
        VALUES ('Bebidas', 9, uuid_tomjerry)
        RETURNING id INTO cat_bebidas;
    END IF;
    
    -- Açaí no Copo
    SELECT id INTO cat_acai
    FROM categories
    WHERE name = 'Açaí no Copo' AND restaurant_id = uuid_tomjerry;
    
    IF cat_acai IS NULL THEN
        INSERT INTO categories (name, "order", restaurant_id)
        VALUES ('Açaí no Copo', 10, uuid_tomjerry)
        RETURNING id INTO cat_acai;
    END IF;
    
    -- Troca Fidelidade
    SELECT id INTO cat_troca_fidelidade
    FROM categories
    WHERE name = 'Troca Fidelidade' AND restaurant_id = uuid_tomjerry;
    
    IF cat_troca_fidelidade IS NULL THEN
        INSERT INTO categories (name, "order", restaurant_id)
        VALUES ('Troca Fidelidade', 11, uuid_tomjerry)
        RETURNING id INTO cat_troca_fidelidade;
    END IF;
    
    RAISE NOTICE '✅ Categorias criadas!';
    RAISE NOTICE '';
    
    -- ============================================
    -- CRIAR PRODUTOS - PIZZA BROTO SALGADA
    -- ============================================
    RAISE NOTICE '🍕 Criando produtos da categoria Pizza Broto Salgada...';
    
    -- Produto 1: Alho e oleo
    INSERT INTO products (name, description, price, category_id, restaurant_id, available)
    SELECT 'Alho e oleo', 'Alho e oleo', 34.00, cat_pizza_broto_salgada, uuid_tomjerry, true
    WHERE NOT EXISTS (
        SELECT 1 FROM products 
        WHERE name = 'Alho e oleo' 
        AND restaurant_id = uuid_tomjerry 
        AND category_id = cat_pizza_broto_salgada
    );
    
    -- Produto 2: Americana 1
    INSERT INTO products (name, description, price, category_id, restaurant_id, available)
    SELECT 'Americana 1', 'Presunto, palmito, champgnion, catupiry, cebola e bacon', 40.00, cat_pizza_broto_salgada, uuid_tomjerry, true
    WHERE NOT EXISTS (
        SELECT 1 FROM products 
        WHERE name = 'Americana 1' 
        AND restaurant_id = uuid_tomjerry 
        AND category_id = cat_pizza_broto_salgada
    );
    
    -- Produto 3: Americana 2
    INSERT INTO products (name, description, price, category_id, restaurant_id, available)
    SELECT 'Americana 2', 'Palmito, ervilha, ovos, milho verde, mussarela e bacon', 38.00, cat_pizza_broto_salgada, uuid_tomjerry, true
    WHERE NOT EXISTS (
        SELECT 1 FROM products 
        WHERE name = 'Americana 2' 
        AND restaurant_id = uuid_tomjerry 
        AND category_id = cat_pizza_broto_salgada
    );
    
    -- Produto 4: Atum
    INSERT INTO products (name, description, price, category_id, restaurant_id, available)
    SELECT 'Atum', 'Atum, ervilha e cebola', 36.00, cat_pizza_broto_salgada, uuid_tomjerry, true
    WHERE NOT EXISTS (
        SELECT 1 FROM products 
        WHERE name = 'Atum' 
        AND restaurant_id = uuid_tomjerry 
        AND category_id = cat_pizza_broto_salgada
    );
    
    -- Produto 5: Atumcatu
    INSERT INTO products (name, description, price, category_id, restaurant_id, available)
    SELECT 'Atumcatu', 'Atum, catupiry e cebola', 38.00, cat_pizza_broto_salgada, uuid_tomjerry, true
    WHERE NOT EXISTS (
        SELECT 1 FROM products 
        WHERE name = 'Atumcatu' 
        AND restaurant_id = uuid_tomjerry 
        AND category_id = cat_pizza_broto_salgada
    );
    
    -- Produto 6: Atumssarela
    INSERT INTO products (name, description, price, category_id, restaurant_id, available)
    SELECT 'Atumssarela', 'Atum, mussarela e bacon', 39.00, cat_pizza_broto_salgada, uuid_tomjerry, true
    WHERE NOT EXISTS (
        SELECT 1 FROM products 
        WHERE name = 'Atumssarela' 
        AND restaurant_id = uuid_tomjerry 
        AND category_id = cat_pizza_broto_salgada
    );
    
    -- Produto 7: Atum solido
    INSERT INTO products (name, description, price, category_id, restaurant_id, available)
    SELECT 'Atum solido', 'Atum sólido, ervilha, mussarela e bacon', 41.00, cat_pizza_broto_salgada, uuid_tomjerry, true
    WHERE NOT EXISTS (
        SELECT 1 FROM products 
        WHERE name = 'Atum solido' 
        AND restaurant_id = uuid_tomjerry 
        AND category_id = cat_pizza_broto_salgada
    );
    
    -- Produto 8: Bacon
    INSERT INTO products (name, description, price, category_id, restaurant_id, available)
    SELECT 'Bacon', 'Mussarela e bacon', 37.00, cat_pizza_broto_salgada, uuid_tomjerry, true
    WHERE NOT EXISTS (
        SELECT 1 FROM products 
        WHERE name = 'Bacon' 
        AND restaurant_id = uuid_tomjerry 
        AND category_id = cat_pizza_broto_salgada
    );
    
    -- Produto 9: Bahiana
    INSERT INTO products (name, description, price, category_id, restaurant_id, available)
    SELECT 'Bahiana', 'Calabresa moida, ervilha, ovos e pimenta', 34.00, cat_pizza_broto_salgada, uuid_tomjerry, true
    WHERE NOT EXISTS (
        SELECT 1 FROM products 
        WHERE name = 'Bahiana' 
        AND restaurant_id = uuid_tomjerry 
        AND category_id = cat_pizza_broto_salgada
    );
    
    -- Produto 10: Bahiacatu
    INSERT INTO products (name, description, price, category_id, restaurant_id, available)
    SELECT 'Bahiacatu', 'Calabresa moida, ervilha, ovos, pimenta e catupiry', 37.00, cat_pizza_broto_salgada, uuid_tomjerry, true
    WHERE NOT EXISTS (
        SELECT 1 FROM products 
        WHERE name = 'Bahiacatu' 
        AND restaurant_id = uuid_tomjerry 
        AND category_id = cat_pizza_broto_salgada
    );
    
    RAISE NOTICE '✅ Produtos da Pizza Broto Salgada criados!';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ IMPORTAÇÃO CONCLUÍDA!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Resumo:';
    RAISE NOTICE '  - Categorias: 11 criadas';
    RAISE NOTICE '  - Produtos (Pizza Broto Salgada): 10 criados';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Próximos passos:';
    RAISE NOTICE '  1. As outras categorias foram criadas mas estão vazias';
    RAISE NOTICE '  2. Você pode adicionar produtos nas outras categorias pelo admin';
    RAISE NOTICE '  3. Você pode adicionar imagens aos produtos quando quiser';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Dados iniciais importados com sucesso!';
    RAISE NOTICE '========================================';
    
END $$;

-- ============================================
-- VERIFICAÇÃO PÓS-IMPORTAÇÃO
-- ============================================
-- Execute estas queries para verificar se tudo foi criado corretamente:

-- Verificar categorias criadas
SELECT 
    'Categorias do Tom & Jerry' as verificação,
    name,
    "order",
    created_at
FROM categories
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com')
ORDER BY "order";

-- Verificar produtos criados
SELECT 
    'Produtos do Tom & Jerry' as verificação,
    p.name as produto,
    p.description,
    p.price,
    c.name as categoria,
    p.available
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com')
ORDER BY c."order", p.name;

-- Contar produtos por categoria
SELECT 
    c.name as categoria,
    COUNT(p.id) as total_produtos
FROM categories c
LEFT JOIN products p ON p.category_id = c.id AND p.restaurant_id = c.restaurant_id
WHERE c.restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com')
GROUP BY c.id, c.name, c."order"
ORDER BY c."order";

