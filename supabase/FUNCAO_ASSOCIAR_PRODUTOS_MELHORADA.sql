-- ============================================
-- FUNÇÃO MELHORADA: ASSOCIAR PRODUTOS A UM USUÁRIO
-- ============================================
-- Versão com mais verificações e mensagens de erro claras

CREATE OR REPLACE FUNCTION associar_produtos_antigos_a_usuario(p_email TEXT)
RETURNS TABLE(
    sucesso BOOLEAN,
    categorias_copiadas INTEGER,
    produtos_copiados INTEGER,
    mensagem TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_usuario_id UUID;
    v_categorias_copiadas INTEGER := 0;
    v_produtos_copiados INTEGER := 0;
    v_produtos_existentes INTEGER := 0;
    cat_record RECORD;
    prod_record RECORD;
    nova_categoria_id UUID;
BEGIN
    -- ============================================
    -- VERIFICAR SE O USUÁRIO EXISTE
    -- ============================================
    SELECT id INTO v_usuario_id
    FROM auth.users
    WHERE email = LOWER(TRIM(p_email));
    
    -- Se não encontrou, tentar sem LOWER (caso o email esteja em maiúsculas)
    IF v_usuario_id IS NULL THEN
        SELECT id INTO v_usuario_id
        FROM auth.users
        WHERE email = TRIM(p_email);
    END IF;
    
    -- Se ainda não encontrou, retornar erro
    IF v_usuario_id IS NULL THEN
        RETURN QUERY SELECT 
            FALSE::BOOLEAN,
            0::INTEGER, 
            0::INTEGER, 
            ('❌ ERRO: Usuário com email "' || p_email || '" não encontrado no Supabase Auth. ' ||
             'Verifique se o usuário foi criado corretamente em Authentication > Users.')::TEXT;
        RETURN;
    END IF;
    
    -- ============================================
    -- VERIFICAR SE JÁ TEM PRODUTOS
    -- ============================================
    SELECT COUNT(*) INTO v_produtos_existentes
    FROM products
    WHERE restaurant_id = v_usuario_id;
    
    IF v_produtos_existentes > 0 THEN
        RETURN QUERY SELECT 
            TRUE::BOOLEAN,
            0::INTEGER, 
            v_produtos_existentes, 
            ('✅ Usuário já possui ' || v_produtos_existentes || ' produtos cadastrados. ' ||
             'Se desejar duplicar, use: associar_produtos_antigos_a_usuario_forcar(''' || p_email || ''')')::TEXT;
        RETURN;
    END IF;
    
    -- ============================================
    -- COPIAR CATEGORIAS
    -- ============================================
    FOR cat_record IN 
        SELECT * FROM categories WHERE restaurant_id IS NULL
    LOOP
        BEGIN
            INSERT INTO categories (
                name, image, "order", restaurant_id, created_at, updated_at
            ) VALUES (
                cat_record.name,
                cat_record.image,
                cat_record."order",
                v_usuario_id,
                COALESCE(cat_record.created_at, NOW()),
                COALESCE(cat_record.updated_at, NOW())
            );
            
            v_categorias_copiadas := v_categorias_copiadas + 1;
        EXCEPTION WHEN OTHERS THEN
            -- Ignorar erros de duplicação e continuar
            NULL;
        END;
    END LOOP;
    
    -- ============================================
    -- COPIAR PRODUTOS
    -- ============================================
    FOR prod_record IN 
        SELECT * FROM products WHERE restaurant_id IS NULL
    LOOP
        BEGIN
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
                COALESCE(prod_record.available, true),
                v_usuario_id,
                COALESCE(prod_record.created_at, NOW()),
                COALESCE(prod_record.updated_at, NOW())
            );
            
            v_produtos_copiados := v_produtos_copiados + 1;
        EXCEPTION WHEN OTHERS THEN
            -- Ignorar erros e continuar
            NULL;
        END;
    END LOOP;
    
    -- ============================================
    -- RETORNAR RESULTADO
    -- ============================================
    IF v_produtos_copiados > 0 OR v_categorias_copiadas > 0 THEN
        RETURN QUERY SELECT 
            TRUE::BOOLEAN,
            v_categorias_copiadas,
            v_produtos_copiados,
            ('✅ SUCESSO! ' || v_categorias_copiadas || ' categorias e ' || 
             v_produtos_copiados || ' produtos copiados para ' || p_email)::TEXT;
    ELSE
        RETURN QUERY SELECT 
            FALSE::BOOLEAN,
            0::INTEGER,
            0::INTEGER,
            ('⚠️ AVISO: Nenhum produto ou categoria foi copiado. ' ||
             'Verifique se existem produtos/categorias sem restaurant_id no banco.')::TEXT;
    END IF;
END;
$$;

-- ============================================
-- FUNÇÃO PARA VERIFICAR SE USUÁRIO EXISTE
-- ============================================
CREATE OR REPLACE FUNCTION verificar_usuario_existe(p_email TEXT)
RETURNS TABLE(
    existe BOOLEAN,
    usuario_id UUID,
    email_encontrado TEXT,
    criado_em TIMESTAMP,
    mensagem TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_usuario RECORD;
BEGIN
    -- Buscar usuário
    SELECT 
        id,
        email,
        created_at
    INTO v_usuario
    FROM auth.users
    WHERE email = LOWER(TRIM(p_email))
       OR email = TRIM(p_email);
    
    IF v_usuario.id IS NULL THEN
        RETURN QUERY SELECT 
            FALSE::BOOLEAN,
            NULL::UUID,
            NULL::TEXT,
            NULL::TIMESTAMP,
            ('❌ Usuário "' || p_email || '" NÃO encontrado. ' ||
             'Verifique se foi criado em Authentication > Users.')::TEXT;
    ELSE
        RETURN QUERY SELECT 
            TRUE::BOOLEAN,
            v_usuario.id,
            v_usuario.email,
            v_usuario.created_at,
            ('✅ Usuário encontrado! ID: ' || v_usuario.id)::TEXT;
    END IF;
END;
$$;

-- ============================================
-- EXEMPLOS DE USO
-- ============================================

-- 1. Verificar se usuário existe ANTES de associar produtos
-- SELECT * FROM verificar_usuario_existe('email@exemplo.com');

-- 2. Associar produtos (versão melhorada)
-- SELECT * FROM associar_produtos_antigos_a_usuario('email@exemplo.com');

-- ============================================
-- NOTAS
-- ============================================
-- Esta função usa SECURITY DEFINER para ter acesso à tabela auth.users
-- Se der erro de permissão, você pode precisar ajustar as políticas RLS

