-- ============================================
-- LIMPAR TODOS OS PEDIDOS DE CLIENTES
-- ============================================
-- Este script apaga TODOS os pedidos de TODOS os restaurantes.
-- ATENÇÃO: Esta operação é IRREVERSÍVEL!
-- Execute apenas se tiver certeza absoluta.

-- ANTES DE EXECUTAR:
-- 1. Faça backup do banco de dados se necessário
-- 2. Verifique quantos pedidos serão deletados (use o SELECT abaixo)
-- 3. Tenha certeza absoluta de que deseja deletar tudo

-- ============================================
-- VERIFICAR QUANTIDADE DE PEDIDOS ANTES
-- ============================================
SELECT 
  COUNT(*) as total_pedidos,
  COUNT(DISTINCT user_id) as total_restaurantes,
  COUNT(DISTINCT customer_email) as total_clientes
FROM orders;

-- ============================================
-- LIMPAR PEDIDOS E ITENS RELACIONADOS
-- ============================================

-- Primeiro, deletar os itens dos pedidos (order_items)
-- Isso é necessário devido às foreign keys
DELETE FROM order_items;

-- Deletar histórico de status dos pedidos (order_status_history)
DELETE FROM order_status_history;

-- Deletar opções dos itens dos pedidos (order_item_options)
DELETE FROM order_item_options;

-- Por fim, deletar todos os pedidos
DELETE FROM orders;

-- ============================================
-- VERIFICAR SE FOI LIMPO CORRETAMENTE
-- ============================================
SELECT 
  COUNT(*) as total_pedidos_restantes
FROM orders;

-- Se retornar 0, todos os pedidos foram deletados com sucesso!

-- ============================================
-- OBSERVAÇÕES IMPORTANTES
-- ============================================
-- 1. Este script deleta TODOS os pedidos de TODOS os restaurantes
-- 2. Não há como recuperar os dados após a execução
-- 3. As transações de pagamento (payment_transactions) não são afetadas por este script
--    Se quiser limpar também as transações, execute:
--    DELETE FROM payment_transactions;
-- 4. Os produtos, categorias e configurações de restaurantes NÃO são afetados
