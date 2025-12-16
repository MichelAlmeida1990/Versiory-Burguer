-- ============================================
-- CORRIGIR IMAGENS DOS PRODUTOS TOM & JERRY
-- ============================================
-- Este script atualiza as imagens dos produtos do Tom & Jerry
-- para usar as imagens locais da pasta public/images/produtos
-- 
-- IMPORTANTE: Este script APENAS atualiza produtos do Tom & Jerry
-- (filtrado por restaurant_id = uuid_tomjerry)
-- 
-- As imagens devem estar em: /images/produtos/[nome-do-arquivo]
-- Exemplo: /images/produtos/americana-1.jpg

DO $$
DECLARE
    uuid_tomjerry UUID;
    total_atualizado INTEGER := 0;
BEGIN
    -- Buscar UUID do usuário Tom & Jerry
    SELECT id INTO uuid_tomjerry
    FROM auth.users
    WHERE email = 'tomjerry@gmail.com';
    
    IF uuid_tomjerry IS NULL THEN
        RAISE EXCEPTION '❌ ERRO: Usuário tomjerry@gmail.com não encontrado!';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CORRIGINDO IMAGENS DOS PRODUTOS';
    RAISE NOTICE 'Restaurante: Tom & Jerry';
    RAISE NOTICE 'UUID: %', uuid_tomjerry;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANTE: Apenas produtos do Tom & Jerry serão atualizados!';
    RAISE NOTICE '';
    
    -- ============================================
    -- MAPEAMENTO DE IMAGENS (apenas produtos conhecidos do Tom & Jerry)
    -- ============================================
    
    -- Americana 1 -> americana-1.jpg
    UPDATE products
    SET image = '/images/produtos/americana-1.jpg'
    WHERE restaurant_id = uuid_tomjerry 
      AND LOWER(TRIM(name)) = 'americana 1'
      AND (image IS NULL OR image = '' OR image LIKE '%pixabay%');
    
    GET DIAGNOSTICS total_atualizado = ROW_COUNT;
    IF total_atualizado > 0 THEN
        RAISE NOTICE '✅ Americana 1 -> americana-1.jpg';
    END IF;
    
    -- Bahiana -> baiana.jpeg
    UPDATE products
    SET image = '/images/produtos/baiana.jpeg'
    WHERE restaurant_id = uuid_tomjerry 
      AND LOWER(TRIM(name)) = 'bahiana'
      AND (image IS NULL OR image = '' OR image LIKE '%pixabay%');
    
    GET DIAGNOSTICS total_atualizado = ROW_COUNT;
    IF total_atualizado > 0 THEN
        RAISE NOTICE '✅ Bahiana -> baiana.jpeg';
    END IF;
    
    -- Bahiacatu -> baiacatu.jpg
    UPDATE products
    SET image = '/images/produtos/baiacatu.jpg'
    WHERE restaurant_id = uuid_tomjerry 
      AND LOWER(TRIM(name)) = 'bahiacatu'
      AND (image IS NULL OR image = '' OR image LIKE '%pixabay%');
    
    GET DIAGNOSTICS total_atualizado = ROW_COUNT;
    IF total_atualizado > 0 THEN
        RAISE NOTICE '✅ Bahiacatu -> baiacatu.jpg';
    END IF;
    
    -- Atum -> Pizza_de_Atum_com_Mucarela-1024x494.jpg
    UPDATE products
    SET image = '/images/produtos/Pizza_de_Atum_com_Mucarela-1024x494.jpg'
    WHERE restaurant_id = uuid_tomjerry 
      AND LOWER(TRIM(name)) = 'atum'
      AND (image IS NULL OR image = '' OR image LIKE '%pixabay%');
    
    GET DIAGNOSTICS total_atualizado = ROW_COUNT;
    IF total_atualizado > 0 THEN
        RAISE NOTICE '✅ Atum -> Pizza_de_Atum_com_Mucarela-1024x494.jpg';
    END IF;
    
    -- Atum solido -> super-atum-solido.png
    UPDATE products
    SET image = '/images/produtos/super-atum-solido.png'
    WHERE restaurant_id = uuid_tomjerry 
      AND LOWER(TRIM(name)) = 'atum solido'
      AND (image IS NULL OR image = '' OR image LIKE '%pixabay%');
    
    GET DIAGNOSTICS total_atualizado = ROW_COUNT;
    IF total_atualizado > 0 THEN
        RAISE NOTICE '✅ Atum solido -> super-atum-solido.png';
    END IF;
    
    -- Alho e oleo -> pizza-de-pao-de-alho-780x470.png
    UPDATE products
    SET image = '/images/produtos/pizza-de-pao-de-alho-780x470.png'
    WHERE restaurant_id = uuid_tomjerry 
      AND LOWER(TRIM(name)) = 'alho e oleo'
      AND (image IS NULL OR image = '' OR image LIKE '%pixabay%');
    
    GET DIAGNOSTICS total_atualizado = ROW_COUNT;
    IF total_atualizado > 0 THEN
        RAISE NOTICE '✅ Alho e oleo -> pizza-de-pao-de-alho-780x470.png';
    END IF;
    
    -- Atumssarela -> atumssarela.jpg
    UPDATE products
    SET image = '/images/produtos/atumssarela.jpg'
    WHERE restaurant_id = uuid_tomjerry 
      AND LOWER(TRIM(name)) = 'atumssarela'
      AND (image IS NULL OR image = '' OR image LIKE '%pixabay%');
    
    GET DIAGNOSTICS total_atualizado = ROW_COUNT;
    IF total_atualizado > 0 THEN
        RAISE NOTICE '✅ Atumssarela -> atumssarela.jpg';
    END IF;
    
    -- Bacon -> bacon.jpg
    UPDATE products
    SET image = '/images/produtos/bacon.jpg'
    WHERE restaurant_id = uuid_tomjerry 
      AND LOWER(TRIM(name)) = 'bacon'
      AND (image IS NULL OR image = '' OR image LIKE '%pixabay%');
    
    GET DIAGNOSTICS total_atualizado = ROW_COUNT;
    IF total_atualizado > 0 THEN
        RAISE NOTICE '✅ Bacon -> bacon.jpg';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PROCESSO CONCLUÍDO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Para adicionar mais produtos:';
    RAISE NOTICE '  1. Identifique qual imagem corresponde a qual produto';
    RAISE NOTICE '  2. Descomente e atualize as linhas acima ou adicione novas';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Dica: Execute LISTAR_PRODUTOS_TOM_JERRY.sql para ver';
    RAISE NOTICE '   quais produtos ainda precisam de imagens';
    RAISE NOTICE '';
    
END $$;

-- ============================================
-- VERIFICAÇÃO PÓS-ATUALIZAÇÃO
-- ============================================
-- Execute estas queries para verificar se as imagens foram atualizadas:

-- Listar todos os produtos do Tom & Jerry e suas imagens
SELECT 
    p.name as produto,
    c.name as categoria,
    CASE 
        WHEN p.image IS NULL OR p.image = '' THEN '❌ Sem imagem'
        WHEN p.image LIKE '/images/produtos/%' THEN '✅ Imagem local'
        WHEN p.image LIKE '%pixabay%' THEN '⚠️  Imagem Pixabay (antiga)'
        ELSE '✅ Com imagem'
    END as status_imagem,
    p.image as imagem_atual
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com')
ORDER BY 
    CASE 
        WHEN p.image IS NULL OR p.image = '' THEN 1
        WHEN p.image LIKE '%pixabay%' THEN 2
        ELSE 3
    END,
    c."order",
    p.name;

-- Produtos do Tom & Jerry que ainda precisam de correção
SELECT 
    p.name as produto,
    c.name as categoria,
    p.image as imagem_atual
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com')
  AND (p.image IS NULL 
       OR p.image = '' 
       OR p.image LIKE '%pixabay%')
ORDER BY c."order", p.name;
