-- ============================================
-- LIMPAR TODOS OS PEDIDOS PARA TESTES
-- ============================================
-- Este script remove TODOS os pedidos e dados relacionados
-- Use apenas para testes e desenvolvimento
-- 
-- INSTRUÇÕES:
-- 1. Abra o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este script completo
-- 4. Execute (Run)
-- 5. Verifique os resultados no final

-- Desabilitar temporariamente RLS para limpeza
ALTER TABLE IF EXISTS order_item_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_status_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;

-- Deletar dados relacionados primeiro (devido a foreign keys)
-- Ordem: primeiro as tabelas dependentes, depois a principal
DELETE FROM order_item_options;
DELETE FROM order_status_history;
DELETE FROM order_items;
DELETE FROM orders;

-- Reabilitar RLS
ALTER TABLE IF EXISTS order_item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;

-- Verificar se foi limpo (deve retornar 0 para todos)
SELECT 
  (SELECT COUNT(*) FROM orders) as total_pedidos,
  (SELECT COUNT(*) FROM order_items) as total_itens,
  (SELECT COUNT(*) FROM order_status_history) as total_historico,
  (SELECT COUNT(*) FROM order_item_options) as total_opcoes;

-- Se todos retornarem 0, a limpeza foi bem-sucedida!

