-- ============================================
-- MOVER PRODUTOS DO BOTECOMARIO PARA O DEMO
-- ============================================
-- Este script move TODOS os produtos e categorias do botecomario para o demo
-- e corrige os pedidos relacionados

DO $$
DECLARE
    demo_uuid UUID := 'f5f457d9-821e-4a21-9029-e181b1bee792';
    botecomario_uuid UUID := '21f08dcd-f7fb-4655-a478-625d05fa392f';
    produtos_movidos INTEGER := 0;
    categorias_movidas INTEGER := 0;
    pedidos_corrigidos INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'INICIANDO MOVIMENTAÇÃO DE PRODUTOS';
    RAISE NOTICE '========================================';
    
    -- 1. Mover produtos do botecomario para o demo
    UPDATE products
    SET restaurant_id = demo_uuid
    WHERE restaurant_id = botecomario_uuid;
    
    GET DIAGNOSTICS produtos_movidos = ROW_COUNT;
    RAISE NOTICE '✅ Produtos movidos: %', produtos_movidos;
    
    -- 2. Mover categorias do botecomario para o demo
    UPDATE categories
    SET restaurant_id = demo_uuid
    WHERE restaurant_id = botecomario_uuid;
    
    GET DIAGNOSTICS categorias_movidas = ROW_COUNT;
    RAISE NOTICE '✅ Categorias movidas: %', categorias_movidas;
    
    -- 3. Corrigir pedidos que foram feitos com produtos do botecomario
    -- Agora esses produtos pertencem ao demo, então os pedidos também devem ir para o demo
    UPDATE orders
    SET user_id = demo_uuid::text
    WHERE user_id = botecomario_uuid::text;
    
    GET DIAGNOSTICS pedidos_corrigidos = ROW_COUNT;
    RAISE NOTICE '✅ Pedidos corrigidos: %', pedidos_corrigidos;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PROCESSO CONCLUÍDO COM SUCESSO!';
    RAISE NOTICE '========================================';
END $$;

-- Verificar resultado
SELECT 
    'VERIFICAÇÃO FINAL - DEMO' as info,
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN available = true THEN 1 END) as produtos_ativos,
    COUNT(CASE WHEN available = false THEN 1 END) as produtos_inativos
FROM products
WHERE restaurant_id = 'f5f457d9-821e-4a21-9029-e181b1bee792';

SELECT 
    'VERIFICAÇÃO FINAL - BOTECOMARIO' as info,
    COUNT(*) as total_produtos
FROM products
WHERE restaurant_id = '21f08dcd-f7fb-4655-a478-625d05fa392f';

SELECT 
    'VERIFICAÇÃO FINAL - PEDIDOS DO DEMO' as info,
    COUNT(*) as total_pedidos
FROM orders
WHERE user_id = 'f5f457d9-821e-4a21-9029-e181b1bee792';

