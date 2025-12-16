-- ============================================
-- LISTAR TODOS OS PRODUTOS DO TOM & JERRY
-- ============================================
-- Este script lista todos os produtos do Tom & Jerry
-- para identificar quais precisam de imagens

SELECT 
    p.id,
    p.name as produto,
    p.description,
    p.price,
    c.name as categoria,
    CASE 
        WHEN p.image IS NULL OR p.image = '' THEN '❌ Sem imagem'
        WHEN p.image LIKE '/images/produtos/%' THEN '✅ Imagem local'
        WHEN p.image LIKE '%pixabay%' THEN '⚠️  Imagem Pixabay'
        ELSE '✅ Com imagem'
    END as status_imagem,
    p.image as imagem_atual
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com')
ORDER BY 
    c."order",
    p.name;

-- Contar produtos por status de imagem
SELECT 
    'Estatísticas' as tipo,
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN image LIKE '/images/produtos/%' THEN 1 END) as com_imagem_local,
    COUNT(CASE WHEN image IS NULL OR image = '' THEN 1 END) as sem_imagem,
    COUNT(CASE WHEN image LIKE '%pixabay%' THEN 1 END) as imagens_pixabay,
    COUNT(CASE WHEN image IS NOT NULL AND image != '' AND image NOT LIKE '%pixabay%' AND image NOT LIKE '/images/produtos/%' THEN 1 END) as outras_imagens
FROM products
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com');

