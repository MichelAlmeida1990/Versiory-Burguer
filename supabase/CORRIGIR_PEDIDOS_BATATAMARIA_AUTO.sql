-- ============================================
-- CORREÇÃO AUTOMÁTICA DE PEDIDOS - BATATAMARIA
-- ============================================
-- Este script corrige automaticamente pedidos que têm produtos do batatamaria
-- mas que foram criados com user_id incorreto (legado ou outro restaurante)

DO $$
DECLARE
    v_batatamaria_id UUID;
    v_batatamaria_id_text TEXT;
    v_pedidos_corrigidos INTEGER := 0;
    v_pedido RECORD;
BEGIN
    -- Obter ID do batatamaria
    SELECT id INTO v_batatamaria_id
    FROM auth.users
    WHERE email = 'batatamaria@gmail.com';
    
    IF v_batatamaria_id IS NULL THEN
        RAISE EXCEPTION 'Usuário batatamaria@gmail.com não encontrado';
    END IF;
    
    v_batatamaria_id_text := v_batatamaria_id::text;
    
    RAISE NOTICE 'ID do batatamaria: % (text: %)', v_batatamaria_id, v_batatamaria_id_text;
    
    -- Buscar pedidos que têm produtos do batatamaria mas user_id incorreto
    FOR v_pedido IN
        SELECT DISTINCT o.id, o.user_id, o.customer_name, o.created_at
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        WHERE p.restaurant_id = v_batatamaria_id
          AND o.user_id != v_batatamaria_id_text
          AND o.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY o.id, o.user_id, o.customer_name, o.created_at
        HAVING COUNT(DISTINCT CASE WHEN p.restaurant_id = v_batatamaria_id THEN oi.product_id END) > 0
           AND COUNT(DISTINCT CASE WHEN p.restaurant_id != v_batatamaria_id AND p.restaurant_id IS NOT NULL THEN oi.product_id END) = 0
    LOOP
        RAISE NOTICE 'Corrigindo pedido %: user_id atual = %, novo user_id = %', 
            v_pedido.id, v_pedido.user_id, v_batatamaria_id_text;
        
        -- Atualizar user_id do pedido
        UPDATE orders
        SET user_id = v_batatamaria_id_text
        WHERE id = v_pedido.id;
        
        v_pedidos_corrigidos := v_pedidos_corrigidos + 1;
    END LOOP;
    
    RAISE NOTICE 'Total de pedidos corrigidos: %', v_pedidos_corrigidos;
    
    -- Verificar resultado
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    RAISE NOTICE 'Pedidos do batatamaria (últimos 7 dias):';
    
    FOR v_pedido IN
        SELECT 
            o.id,
            o.user_id,
            o.customer_name,
            o.status,
            o.created_at,
            COUNT(DISTINCT oi.product_id) as total_produtos
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.user_id = v_batatamaria_id_text
          AND o.created_at >= NOW() - INTERVAL '7 days'
        GROUP BY o.id, o.user_id, o.customer_name, o.status, o.created_at
        ORDER BY o.created_at DESC
    LOOP
        RAISE NOTICE '  Pedido %: % - % produtos - % - %', 
            v_pedido.id, 
            v_pedido.customer_name, 
            v_pedido.total_produtos,
            v_pedido.status,
            v_pedido.created_at;
    END LOOP;
    
END $$;

-- Verificação adicional: contar pedidos por restaurante
SELECT 
    CASE 
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'batatamaria@gmail.com') THEN 'batatamaria'
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'botecomario@gmail.com') THEN 'botecomario'
        WHEN o.user_id LIKE 'legacy_%' THEN 'legado'
        ELSE 'outro'
    END as restaurante,
    COUNT(*) as total_pedidos,
    COUNT(CASE WHEN o.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as pedidos_ultimos_7_dias
FROM orders o
GROUP BY 
    CASE 
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'batatamaria@gmail.com') THEN 'batatamaria'
        WHEN o.user_id = (SELECT id::text FROM auth.users WHERE email = 'botecomario@gmail.com') THEN 'botecomario'
        WHEN o.user_id LIKE 'legacy_%' THEN 'legado'
        ELSE 'outro'
    END
ORDER BY restaurante;

