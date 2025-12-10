-- ============================================
-- DIAGNÓSTICO: Usuário Não Encontrado
-- ============================================
-- Execute este script para diagnosticar por que o usuário não está sendo encontrado

-- 1. Listar TODOS os usuários no Supabase Auth
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Verificar se consegue acessar a tabela auth.users
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as usuarios_confirmados,
    COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) as usuarios_nao_confirmados
FROM auth.users;

-- 3. Buscar usuário específico (substitua o email)
-- IMPORTANTE: Use o email EXATO como está cadastrado
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email = 'SEU_EMAIL_AQUI@gmail.com';

-- 4. Buscar usuário (case insensitive - sem diferenciar maiúsculas/minúsculas)
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE LOWER(email) = LOWER('SEU_EMAIL_AQUI@gmail.com');

-- 5. Verificar permissões da função
SELECT 
    proname as nome_funcao,
    prosecdef as security_definer,
    proowner::regrole as proprietario
FROM pg_proc
WHERE proname = 'associar_produtos_antigos_a_usuario';

-- 6. Testar a função de verificação
-- SELECT * FROM verificar_usuario_existe('SEU_EMAIL_AQUI@gmail.com');

-- ============================================
-- SOLUÇÕES COMUNS
-- ============================================

-- SOLUÇÃO 1: Verificar se o email está correto
-- O email deve ser EXATAMENTE como está no Supabase Auth
-- Exemplo: se está 'Usuario@Gmail.Com', use exatamente isso

-- SOLUÇÃO 2: Se a função não encontrar, use esta query manual:
-- (Substitua 'email@exemplo.com' pelo email real)
DO $$
DECLARE
    v_email TEXT := 'email@exemplo.com';
    v_usuario_id UUID;
BEGIN
    -- Buscar usuário
    SELECT id INTO v_usuario_id
    FROM auth.users
    WHERE email = v_email;
    
    IF v_usuario_id IS NULL THEN
        RAISE NOTICE '❌ Usuário % não encontrado!', v_email;
        RAISE NOTICE 'Verifique se o email está correto e se o usuário foi criado.';
    ELSE
        RAISE NOTICE '✅ Usuário encontrado! ID: %', v_usuario_id;
        RAISE NOTICE 'Agora você pode usar a função:';
        RAISE NOTICE 'SELECT * FROM associar_produtos_antigos_a_usuario(''%'');', v_email;
    END IF;
END $$;

