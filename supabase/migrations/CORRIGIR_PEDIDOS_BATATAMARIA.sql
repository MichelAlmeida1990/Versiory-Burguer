-- ============================================
-- CORRIGIR PEDIDOS DO BATATAMARIA
-- ============================================
-- Este script corrige pedidos que foram criados com ID legado
-- mas que deveriam estar associados ao batatamaria
-- 
-- IMPORTANTE: Execute o script ASSOCIAR_PRODUTOS_BOTECOMARIO.sql primeiro
-- para garantir que os produtos do batatamaria tenham o restaurant_id correto

DO $$
DECLARE
    uuid_batatamaria UUID;
    pedidos_corrigidos INTEGER := 0;
    pedido_record RECORD;
    total_produtos INTEGER;
    produtos_batatamaria INTEGER;
BEGIN
    -- Buscar UUID do batatamaria
    SELECT id INTO uuid_batatamaria
    FROM auth.users
    WHERE email = 'batatamaria@gmail.com';
    
    IF uuid_batatamaria IS NULL THEN
        RAISE EXCEPTION 'Usuário batatamaria@gmail.com não encontrado.';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Corrigindo pedidos do batatamaria';
    RAISE NOTICE 'UUID do batatamaria: %', uuid_batatamaria;
    RAISE NOTICE '========================================';
    
    -- Buscar pedidos que foram criados com ID legado mas que têm produtos do batatamaria
    FOR pedido_record IN 
        SELECT DISTINCT o.id, o.user_id, o.created_at
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        WHERE o.user_id LIKE 'legacy_%'
          AND p.restaurant_id = uuid_batatamaria
        ORDER BY o.created_at DESC
    LOOP
        -- Verificar se TODOS os produtos do pedido pertencem ao batatamaria
        SELECT COUNT(*), COUNT(CASE WHEN p.restaurant_id = uuid_batatamaria THEN 1 END)
        INTO total_produtos, produtos_batatamaria
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = pedido_record.id;
        
        -- Se todos os produtos pertencem ao batatamaria, corrigir o pedido
        IF produtos_batatamaria > 0 AND produtos_batatamaria = total_produtos THEN
            UPDATE orders
            SET user_id = uuid_batatamaria::text
            WHERE id = pedido_record.id;
            
            pedidos_corrigidos := pedidos_corrigidos + 1;
            RAISE NOTICE '✅ Pedido corrigido: % (era: %, agora: %)', 
                pedido_record.id, 
                pedido_record.user_id, 
                uuid_batatamaria::text;
        END IF;
    END LOOP;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Correção concluída!';
    RAISE NOTICE 'Pedidos corrigidos: %', pedidos_corrigidos;
    RAISE NOTICE '========================================';
END $$;

-- Verificar pedidos após correção
SELECT 
    o.id,
    o.user_id,
    o.customer_name,
    o.customer_email,
    o.status,
    o.created_at,
    CASE 
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'batatamaria@gmail.com') THEN '✅ BATATAMARIA'
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'botecomario@gmail.com') THEN '✅ BOTECOMARIO'
        WHEN o.user_id LIKE 'legacy_%' THEN '⚠️ LEGADO'
        ELSE '❓ OUTRO'
    END as restaurante
FROM orders o
WHERE o.created_at >= NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC;

