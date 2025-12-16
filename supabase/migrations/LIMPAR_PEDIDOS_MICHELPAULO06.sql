-- Script para limpar pedidos do cliente michelpaulo06@hotmail.com
-- ATENÇÃO: Este script remove TODOS os pedidos deste email específico

-- PRIMEIRO: Verificar quais pedidos serão deletados
SELECT 
  o.id,
  o.customer_email,
  o.customer_name,
  o.created_at,
  o.total,
  o.status,
  o.user_id as restaurant_id
FROM orders o
WHERE LOWER(TRIM(o.customer_email)) = LOWER(TRIM('michelpaulo06@hotmail.com'))
ORDER BY o.created_at DESC;

-- SEGUNDO: Se quiser deletar os pedidos deste email específico, execute o bloco abaixo:
-- ATENÇÃO: Isso vai deletar TODOS os pedidos deste email permanentemente!

-- Deletar order_item_options primeiro (dependências)
DELETE FROM order_item_options
WHERE order_item_id IN (
  SELECT oi.id
  FROM order_items oi
  INNER JOIN orders o ON oi.order_id = o.id
  WHERE LOWER(TRIM(o.customer_email)) = LOWER(TRIM('michelpaulo06@hotmail.com'))
);

-- Deletar order_items
DELETE FROM order_items
WHERE order_id IN (
  SELECT id FROM orders 
  WHERE LOWER(TRIM(customer_email)) = LOWER(TRIM('michelpaulo06@hotmail.com'))
);

-- Deletar histórico de status
DELETE FROM order_status_history
WHERE order_id IN (
  SELECT id FROM orders 
  WHERE LOWER(TRIM(customer_email)) = LOWER(TRIM('michelpaulo06@hotmail.com'))
);

-- Por fim, deletar os pedidos
DELETE FROM orders
WHERE LOWER(TRIM(customer_email)) = LOWER(TRIM('michelpaulo06@hotmail.com'));

-- Verificar se foi deletado (deve retornar 0)
SELECT COUNT(*) as pedidos_restantes 
FROM orders 
WHERE LOWER(TRIM(customer_email)) = LOWER(TRIM('michelpaulo06@hotmail.com'));

