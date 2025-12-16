-- Script genérico para limpar pedidos de um email específico
-- Substitua 'EMAIL_AQUI' pelo email que deseja limpar
-- ATENÇÃO: Este script remove TODOS os pedidos deste email permanentemente!

-- PRIMEIRO: Verificar quais pedidos serão deletados (execute esta query primeiro)
SELECT 
  o.id,
  o.customer_email,
  o.customer_name,
  o.created_at,
  o.total,
  o.status,
  o.user_id as restaurant_id
FROM orders o
WHERE LOWER(TRIM(o.customer_email)) = LOWER(TRIM('EMAIL_AQUI'))
ORDER BY o.created_at DESC;

-- Contar quantos serão deletados
SELECT COUNT(*) as total_pedidos_para_deletar
FROM orders 
WHERE LOWER(TRIM(customer_email)) = LOWER(TRIM('EMAIL_AQUI'));

-- SEGUNDO: Se quiser deletar, descomente o bloco abaixo e substitua 'EMAIL_AQUI' pelo email correto
/*
BEGIN;

-- Deletar order_item_options primeiro (dependências)
DELETE FROM order_item_options
WHERE order_item_id IN (
  SELECT oi.id
  FROM order_items oi
  INNER JOIN orders o ON oi.order_id = o.id
  WHERE LOWER(TRIM(o.customer_email)) = LOWER(TRIM('EMAIL_AQUI'))
);

-- Deletar order_items
DELETE FROM order_items
WHERE order_id IN (
  SELECT id FROM orders 
  WHERE LOWER(TRIM(customer_email)) = LOWER(TRIM('EMAIL_AQUI'))
);

-- Deletar histórico de status
DELETE FROM order_status_history
WHERE order_id IN (
  SELECT id FROM orders 
  WHERE LOWER(TRIM(customer_email)) = LOWER(TRIM('EMAIL_AQUI'))
);

-- Por fim, deletar os pedidos
DELETE FROM orders
WHERE LOWER(TRIM(customer_email)) = LOWER(TRIM('EMAIL_AQUI'));

-- Verificar se foi deletado (deve retornar 0)
SELECT COUNT(*) as pedidos_restantes 
FROM orders 
WHERE LOWER(TRIM(customer_email)) = LOWER(TRIM('EMAIL_AQUI'));

-- Se estiver tudo certo, confirme a transação:
COMMIT;

-- Se algo der errado, use ROLLBACK; para desfazer
-- ROLLBACK;
*/

