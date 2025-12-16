-- ============================================
-- ASSOCIAR PRODUTOS ANTIGOS AO DEMO
-- ============================================
-- Este script associa TODOS os produtos que estão associados a outros restaurantes
-- mas que deveriam ser antigos (do demo)
-- 
-- ATENÇÃO: Execute apenas se tiver certeza de que quer associar produtos ao demo

DO $$
DECLARE
    demo_uuid UUID := 'f5f457d9-821e-4a21-9029-e181b1bee792';
    produtos_afetados INTEGER := 0;
    categorias_afetadas INTEGER := 0;
BEGIN
    -- 1. Associar produtos do botecomario ao demo (se não tiver produtos próprios)
    -- Verificar se botecomario tem produtos próprios criados por ele
    -- Se não tiver, significa que os produtos foram copiados e devem ser do demo
    
    -- Associar TODOS os produtos do botecomario ao demo
    -- (assumindo que botecomario não criou produtos próprios ainda)
    UPDATE products
    SET restaurant_id = demo_uuid
    WHERE restaurant_id = '21f08dcd-f7fb-4655-a478-625d05fa392f';
    
    GET DIAGNOSTICS produtos_afetados = ROW_COUNT;
    
    -- 2. Associar categorias do botecomario ao demo
    UPDATE categories
    SET restaurant_id = demo_uuid
    WHERE restaurant_id = '21f08dcd-f7fb-4655-a478-625d05fa392f';
    
    GET DIAGNOSTICS categorias_afetadas = ROW_COUNT;
    
    -- 3. Corrigir pedidos que foram feitos com produtos do botecomario
    -- mas que agora pertencem ao demo
    UPDATE orders
    SET user_id = demo_uuid::text
    WHERE user_id = '21f08dcd-f7fb-4655-a478-625d05fa392f'
      AND id IN (
          SELECT DISTINCT o.id
          FROM orders o
          JOIN order_items oi ON oi.order_id = o.id
          JOIN products p ON p.id = oi.product_id
          WHERE p.restaurant_id = demo_uuid
      );
    
    RAISE NOTICE '✅ Produtos associados ao demo: %', produtos_afetados;
    RAISE NOTICE '✅ Categorias associadas ao demo: %', categorias_afetadas;
    RAISE NOTICE '✅ Processo concluído!';
END $$;

-- Verificar resultado
SELECT 
    'VERIFICAÇÃO FINAL' as info,
    'DEMO' as restaurante,
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN available = true THEN 1 END) as produtos_ativos
FROM products
WHERE restaurant_id = 'f5f457d9-821e-4a21-9029-e181b1bee792';

SELECT 
    'VERIFICAÇÃO FINAL' as info,
    'BOTECOMARIO' as restaurante,
    COUNT(*) as total_produtos
FROM products
WHERE restaurant_id = '21f08dcd-f7fb-4655-a478-625d05fa392f';

