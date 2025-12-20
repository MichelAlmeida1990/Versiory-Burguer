-- ============================================
-- INSERIR BAIRROS E VALORES DE FRETE TOM & JERRY
-- ============================================
-- Insere os bairros de Rio Grande da Serra e Ribeirão Pires com seus valores de frete

DO $$
DECLARE
    uuid_tomjerry UUID;
BEGIN
    -- Buscar UUID do Tom & Jerry
    SELECT id INTO uuid_tomjerry
    FROM auth.users
    WHERE email = 'tomjerry@gmail.com';
    
    IF uuid_tomjerry IS NULL THEN
        RAISE EXCEPTION '❌ ERRO: Usuário tomjerry@gmail.com não encontrado!';
    END IF;
    
    RAISE NOTICE '✅ Inserindo bairros para Tom & Jerry (UUID: %)', uuid_tomjerry;
    RAISE NOTICE '';
    
    -- Rio Grande da Serra
    INSERT INTO delivery_areas (restaurant_id, city, neighborhood, delivery_fee, active)
    VALUES
        (uuid_tomjerry, 'Rio Grande da Serra', 'Centro', 3.00, true),
        (uuid_tomjerry, 'Rio Grande da Serra', 'Vila Conde', 8.00, true),
        (uuid_tomjerry, 'Rio Grande da Serra', 'Pedreira', 9.00, true),
        (uuid_tomjerry, 'Rio Grande da Serra', 'Lavínia', 4.00, true)
    ON CONFLICT (restaurant_id, city, neighborhood) 
    DO UPDATE SET 
        delivery_fee = EXCLUDED.delivery_fee,
        active = EXCLUDED.active,
        updated_at = NOW();
    
    RAISE NOTICE '✅ Bairros de Rio Grande da Serra inseridos:';
    RAISE NOTICE '   - Centro: R$ 3,00';
    RAISE NOTICE '   - Vila Conde: R$ 8,00';
    RAISE NOTICE '   - Pedreira: R$ 9,00';
    RAISE NOTICE '   - Lavínia: R$ 4,00';
    
    -- Ribeirão Pires (cidade vizinha)
    INSERT INTO delivery_areas (restaurant_id, city, neighborhood, delivery_fee, active)
    VALUES
        (uuid_tomjerry, 'Ribeirão Pires', 'Ribeirão Pires', 14.00, true)
    ON CONFLICT (restaurant_id, city, neighborhood) 
    DO UPDATE SET 
        delivery_fee = EXCLUDED.delivery_fee,
        active = EXCLUDED.active,
        updated_at = NOW();
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Cidade vizinha inserida:';
    RAISE NOTICE '   - Ribeirão Pires: R$ 14,00';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Bairros inseridos com sucesso!';
    
END $$;

-- Verificar bairros inseridos
SELECT 
    city as "Cidade",
    neighborhood as "Bairro",
    delivery_fee as "Frete (R$)",
    active as "Ativo"
FROM delivery_areas
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com')
ORDER BY city, neighborhood;

