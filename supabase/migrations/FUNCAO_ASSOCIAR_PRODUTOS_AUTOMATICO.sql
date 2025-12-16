-- ============================================
-- FUNÇÃO AUTOMÁTICA: ASSOCIAR PRODUTOS A UM USUÁRIO
-- ============================================
-- Esta função pode ser chamada para qualquer usuário novo
-- e automaticamente copia todos os produtos e categorias antigas para ele

CREATE OR REPLACE FUNCTION associar_produtos_antigos_a_usuario(p_email TEXT)
RETURNS TABLE(
    categorias_copiadas INTEGER,
    produtos_copiados INTEGER,
    mensagem TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_usuario_id UUID;
    v_categorias_copiadas INTEGER := 0;
    v_produtos_copiados INTEGER := 0;
    cat_record RECORD;
    prod_record RECORD;
    nova_categoria_id UUID;
BEGIN
    -- Buscar UUID do usuário
    SELECT id INTO v_usuario_id
    FROM auth.users
    WHERE email = p_email;
    
    IF v_usuario_id IS NULL THEN
        RETURN QUERY SELECT 0::INTEGER, 0::INTEGER, 
            ('Erro: Usuário ' || p_email || ' não encontrado.')::TEXT;
        RETURN;
    END IF;
    
    -- Verificar se já tem produtos (evitar duplicar)
    SELECT COUNT(*) INTO v_produtos_copiados
    FROM products
    WHERE restaurant_id = v_usuario_id;
    
    IF v_produtos_copiados > 0 THEN
        RETURN QUERY SELECT 0::INTEGER, v_produtos_copiados, 
            ('Usuário já possui ' || v_produtos_copiados || ' produtos. Use a opção de forçar cópia se desejar duplicar.')::TEXT;
        RETURN;
    END IF;
    
    v_produtos_copiados := 0;
    
    -- ============================================
    -- COPIAR CATEGORIAS
    -- ============================================
    FOR cat_record IN 
        SELECT * FROM categories WHERE restaurant_id IS NULL
    LOOP
        INSERT INTO categories (
            name, image, "order", restaurant_id, created_at, updated_at
        ) VALUES (
            cat_record.name,
            cat_record.image,
            cat_record."order",
            v_usuario_id,
            cat_record.created_at,
            cat_record.updated_at
        );
        
        v_categorias_copiadas := v_categorias_copiadas + 1;
    END LOOP;
    
    -- ============================================
    -- COPIAR PRODUTOS
    -- ============================================
    FOR prod_record IN 
        SELECT * FROM products WHERE restaurant_id IS NULL
    LOOP
        -- Buscar a categoria correspondente (se o produto tiver categoria)
        nova_categoria_id := NULL;
        IF prod_record.category_id IS NOT NULL THEN
            SELECT c_nova.id INTO nova_categoria_id
            FROM categories c_antiga
            JOIN categories c_nova ON c_nova.name = c_antiga.name 
                                   AND c_nova."order" = c_antiga."order"
            WHERE c_antiga.id = prod_record.category_id
              AND c_nova.restaurant_id = v_usuario_id
            LIMIT 1;
        END IF;
        
        INSERT INTO products (
            name, description, price, image, category_id, available, 
            restaurant_id, created_at, updated_at
        ) VALUES (
            prod_record.name,
            prod_record.description,
            prod_record.price,
            prod_record.image,
            nova_categoria_id,
            prod_record.available,
            v_usuario_id,
            prod_record.created_at,
            prod_record.updated_at
        );
        
        v_produtos_copiados := v_produtos_copiados + 1;
    END LOOP;
    
    -- Retornar resultado
    RETURN QUERY SELECT 
        v_categorias_copiadas,
        v_produtos_copiados,
        ('Produtos associados com sucesso! ' || v_categorias_copiadas || ' categorias e ' || v_produtos_copiados || ' produtos copiados.')::TEXT;
END;
$$;

-- ============================================
-- FUNÇÃO COM OPCÃO DE FORÇAR (para duplicar mesmo se já tiver)
-- ============================================
CREATE OR REPLACE FUNCTION associar_produtos_antigos_a_usuario_forcar(p_email TEXT)
RETURNS TABLE(
    categorias_copiadas INTEGER,
    produtos_copiados INTEGER,
    mensagem TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_usuario_id UUID;
    v_categorias_copiadas INTEGER := 0;
    v_produtos_copiados INTEGER := 0;
    cat_record RECORD;
    prod_record RECORD;
    nova_categoria_id UUID;
BEGIN
    -- Buscar UUID do usuário
    SELECT id INTO v_usuario_id
    FROM auth.users
    WHERE email = p_email;
    
    IF v_usuario_id IS NULL THEN
        RETURN QUERY SELECT 0::INTEGER, 0::INTEGER, 
            ('Erro: Usuário ' || p_email || ' não encontrado.')::TEXT;
        RETURN;
    END IF;
    
    -- ============================================
    -- COPIAR CATEGORIAS (sempre, mesmo se já existir)
    -- ============================================
    FOR cat_record IN 
        SELECT * FROM categories WHERE restaurant_id IS NULL
    LOOP
        INSERT INTO categories (
            name, image, "order", restaurant_id, created_at, updated_at
        ) VALUES (
            cat_record.name,
            cat_record.image,
            cat_record."order",
            v_usuario_id,
            cat_record.created_at,
            cat_record.updated_at
        );
        
        v_categorias_copiadas := v_categorias_copiadas + 1;
    END LOOP;
    
    -- ============================================
    -- COPIAR PRODUTOS (sempre, mesmo se já existir)
    -- ============================================
    FOR prod_record IN 
        SELECT * FROM products WHERE restaurant_id IS NULL
    LOOP
        -- Buscar a categoria correspondente (se o produto tiver categoria)
        nova_categoria_id := NULL;
        IF prod_record.category_id IS NOT NULL THEN
            SELECT c_nova.id INTO nova_categoria_id
            FROM categories c_antiga
            JOIN categories c_nova ON c_nova.name = c_antiga.name 
                                   AND c_nova."order" = c_antiga."order"
            WHERE c_antiga.id = prod_record.category_id
              AND c_nova.restaurant_id = v_usuario_id
            LIMIT 1;
        END IF;
        
        INSERT INTO products (
            name, description, price, image, category_id, available, 
            restaurant_id, created_at, updated_at
        ) VALUES (
            prod_record.name,
            prod_record.description,
            prod_record.price,
            prod_record.image,
            nova_categoria_id,
            prod_record.available,
            v_usuario_id,
            prod_record.created_at,
            prod_record.updated_at
        );
        
        v_produtos_copiados := v_produtos_copiados + 1;
    END LOOP;
    
    -- Retornar resultado
    RETURN QUERY SELECT 
        v_categorias_copiadas,
        v_produtos_copiados,
        ('Produtos associados com sucesso! ' || v_categorias_copiadas || ' categorias e ' || v_produtos_copiados || ' produtos copiados.')::TEXT;
END;
$$;

-- ============================================
-- EXEMPLOS DE USO
-- ============================================

-- Para associar produtos a um usuário novo:
-- SELECT * FROM associar_produtos_antigos_a_usuario('novousuario@gmail.com');

-- Para forçar a cópia mesmo se já tiver produtos:
-- SELECT * FROM associar_produtos_antigos_a_usuario_forcar('novousuario@gmail.com');

-- ============================================
-- VERIFICAR RESULTADO
-- ============================================
-- SELECT COUNT(*) as total_produtos 
-- FROM products 
-- WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'novousuario@gmail.com');

