-- ============================================
-- TRIGGER AUTOMÁTICO: ASSOCIAR PRODUTOS QUANDO CRIAR USUÁRIO
-- ============================================
-- ATENÇÃO: Este trigger é OPCIONAL
-- Ele executa automaticamente quando um novo usuário é criado
-- Se preferir controle manual, use apenas a função sem o trigger

-- IMPORTANTE: Execute primeiro a função:
-- FUNCAO_ASSOCIAR_PRODUTOS_AUTOMATICO.sql

-- ============================================
-- OPÇÃO 1: Trigger que executa após inserção em auth.users
-- ============================================
-- NOTA: Isso pode não funcionar dependendo das permissões do Supabase
-- Se não funcionar, use a Opção 2 (webhook ou função manual)

-- Criar função que será chamada pelo trigger
CREATE OR REPLACE FUNCTION on_new_user_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Associar produtos antigos ao novo usuário
    PERFORM associar_produtos_antigos_a_usuario(NEW.email);
    
    RETURN NEW;
END;
$$;

-- Criar trigger (pode não funcionar se não tiver permissão)
-- Descomente se quiser tentar:
-- DROP TRIGGER IF EXISTS trigger_associar_produtos_novo_usuario ON auth.users;
-- CREATE TRIGGER trigger_associar_produtos_novo_usuario
--     AFTER INSERT ON auth.users
--     FOR EACH ROW
--     EXECUTE FUNCTION on_new_user_created();

-- ============================================
-- OPÇÃO 2: Função que pode ser chamada manualmente (RECOMENDADO)
-- ============================================
-- Esta é a forma mais confiável e recomendada

-- Já está criada na função associar_produtos_antigos_a_usuario
-- Basta chamar: SELECT * FROM associar_produtos_antigos_a_usuario('email@exemplo.com');

-- ============================================
-- OPÇÃO 3: Webhook do Supabase (mais avançado)
-- ============================================
-- Configure um webhook no Supabase Dashboard:
-- 1. Vá em Database > Webhooks
-- 2. Crie um webhook para o evento "user.created"
-- 3. Configure para chamar uma Edge Function ou API que execute a função

-- ============================================
-- RECOMENDAÇÃO
-- ============================================
-- Use a OPÇÃO 2 (função manual) que é mais confiável e permite controle
-- Quando criar um novo usuário, simplesmente execute:
-- SELECT * FROM associar_produtos_antigos_a_usuario('email@exemplo.com');

