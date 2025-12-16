-- ============================================
-- ADICIONAR IMAGENS DO PIXABAY AOS PRODUTOS TOM & JERRY
-- ============================================
-- Este script adiciona imagens do Pixabay (gratuitas, uso comercial permitido)
-- aos produtos do Tom & Jerry que não possuem imagem

DO $$
DECLARE
    uuid_tomjerry UUID;
    produto_record RECORD;
    imagem_url TEXT;
BEGIN
    -- Buscar UUID do usuário Tom & Jerry
    SELECT id INTO uuid_tomjerry
    FROM auth.users
    WHERE email = 'tomjerry@gmail.com';
    
    IF uuid_tomjerry IS NULL THEN
        RAISE EXCEPTION '❌ ERRO: Usuário tomjerry@gmail.com não encontrado!';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ADICIONANDO IMAGENS DO PIXABAY';
    RAISE NOTICE 'Restaurante: Tom & Jerry';
    RAISE NOTICE 'UUID: %', uuid_tomjerry;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    
    -- Atualizar cada produto com imagem apropriada
    -- Usando URLs diretas do Pixabay (imagens gratuitas, uso comercial permitido)
    
    -- Alho e oleo - Pizza simples
    UPDATE products
    SET image = 'https://cdn.pixabay.com/photo/2017/12/05/20/09/pizza-3000285_640.jpg'
    WHERE restaurant_id = uuid_tomjerry 
      AND name = 'Alho e oleo' 
      AND (image IS NULL OR image = '');
    
    -- Americana 1 - Pizza com vários ingredientes
    UPDATE products
    SET image = 'https://cdn.pixabay.com/photo/2017/09/22/19/15/pizza-2776188_640.jpg'
    WHERE restaurant_id = uuid_tomjerry 
      AND name = 'Americana 1' 
      AND (image IS NULL OR image = '');
    
    -- Americana 2 - Pizza com vários ingredientes
    UPDATE products
    SET image = 'https://cdn.pixabay.com/photo/2016/04/21/22/50/pizza-1344720_640.jpg'
    WHERE restaurant_id = uuid_tomjerry 
      AND name = 'Americana 2' 
      AND (image IS NULL OR image = '');
    
    -- Atum - Pizza com atum
    UPDATE products
    SET image = 'https://cdn.pixabay.com/photo/2017/02/15/10/57/pizza-2068272_640.jpg'
    WHERE restaurant_id = uuid_tomjerry 
      AND name = 'Atum' 
      AND (image IS NULL OR image = '');
    
    -- Atumcatu - Pizza com atum e queijo
    UPDATE products
    SET image = 'https://cdn.pixabay.com/photo/2018/03/06/13/47/food-3203445_640.jpg'
    WHERE restaurant_id = uuid_tomjerry 
      AND name = 'Atumcatu' 
      AND (image IS NULL OR image = '');
    
    -- Atumssarela - Pizza com atum e mussarela
    UPDATE products
    SET image = 'https://cdn.pixabay.com/photo/2016/02/19/11/25/pizza-1209748_640.jpg'
    WHERE restaurant_id = uuid_tomjerry 
      AND name = 'Atumssarela' 
      AND (image IS NULL OR image = '');
    
    -- Atum solido - Pizza com atum sólido
    UPDATE products
    SET image = 'https://cdn.pixabay.com/photo/2017/11/12/16/50/pizza-2944044_640.jpg'
    WHERE restaurant_id = uuid_tomjerry 
      AND name = 'Atum solido' 
      AND (image IS NULL OR image = '');
    
    -- Bacon - Pizza com bacon
    UPDATE products
    SET image = 'https://cdn.pixabay.com/photo/2015/04/07/19/49/pizza-712667_640.jpg'
    WHERE restaurant_id = uuid_tomjerry 
      AND name = 'Bacon' 
      AND (image IS NULL OR image = '');
    
    -- Bahiana - Pizza com calabresa e pimenta
    UPDATE products
    SET image = 'https://cdn.pixabay.com/photo/2018/03/07/18/42/pizza-3205235_640.jpg'
    WHERE restaurant_id = uuid_tomjerry 
      AND name = 'Bahiana' 
      AND (image IS NULL OR image = '');
    
    -- Bahiacatu - Pizza com calabresa, pimenta e catupiry
    UPDATE products
    SET image = 'https://cdn.pixabay.com/photo/2016/03/05/19/02/pizza-1239077_640.jpg'
    WHERE restaurant_id = uuid_tomjerry 
      AND name = 'Bahiacatu' 
      AND (image IS NULL OR image = '');
    
    RAISE NOTICE '✅ Imagens adicionadas aos produtos!';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PROCESSO CONCLUÍDO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Imagens adicionadas do Pixabay:';
    RAISE NOTICE '  - Todas as imagens são gratuitas e permitem uso comercial';
    RAISE NOTICE '  - As URLs apontam diretamente para o CDN do Pixabay';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Você pode substituir as imagens depois:';
    RAISE NOTICE '  1. Acesse o admin com tomjerry@gmail.com';
    RAISE NOTICE '  2. Vá em Produtos > Editar';
    RAISE NOTICE '  3. Faça upload de uma imagem personalizada';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Produtos atualizados com imagens!';
    RAISE NOTICE '========================================';
    
END $$;

-- ============================================
-- VERIFICAÇÃO PÓS-ATUALIZAÇÃO
-- ============================================
-- Execute estas queries para verificar se as imagens foram adicionadas:

-- Verificar produtos com imagens
SELECT 
    'Produtos do Tom & Jerry com imagens' as verificação,
    p.name as produto,
    CASE 
        WHEN p.image IS NULL OR p.image = '' THEN '❌ Sem imagem'
        WHEN p.image LIKE '%pixabay%' THEN '✅ Imagem Pixabay'
        ELSE '✅ Com imagem personalizada'
    END as status_imagem,
    p.image
FROM products p
WHERE p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com')
ORDER BY 
    CASE 
        WHEN p.image IS NULL OR p.image = '' THEN 1
        ELSE 2
    END,
    p.name;

-- Contar produtos com e sem imagem
SELECT 
    'Estatísticas de imagens' as verificação,
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN image IS NOT NULL AND image != '' THEN 1 END) as com_imagem,
    COUNT(CASE WHEN image IS NULL OR image = '' THEN 1 END) as sem_imagem,
    COUNT(CASE WHEN image LIKE '%pixabay%' THEN 1 END) as imagens_pixabay
FROM products
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com');

