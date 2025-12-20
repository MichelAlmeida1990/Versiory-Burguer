-- Script para limpar pedidos antigos de teste/debug
-- ATENÇÃO: Este script remove pedidos antigos que foram criados antes do sistema de autenticação de clientes
-- Execute apenas se tiver certeza de que quer limpar esses pedidos

-- PRIMEIRO: Verificar quais pedidos serão afetados
-- Execute esta query primeiro para ver o que será deletado:
SELECT 
  o.id,
  o.customer_email,
  o.customer_name,
  o.created_at,
  o.total,
  o.status,
  o.user_id as restaurant_id
FROM orders o
WHERE o.customer_email IS NOT NULL
ORDER BY o.created_at DESC;

-- SEGUNDO: Verificar quantos pedidos existem por email
SELECT 
  customer_email,
  COUNT(*) as total_pedidos,
  MIN(created_at) as primeiro_pedido,
  MAX(created_at) as ultimo_pedido
FROM orders
WHERE customer_email IS NOT NULL
GROUP BY customer_email
ORDER BY total_pedidos DESC;

-- TERCEIRO: Se quiser limpar TODOS os pedidos antigos (cuidado!):
-- Descomente as linhas abaixo apenas se tiver certeza
/*
-- Deletar primeiro os order_item_options relacionados
DELETE FROM order_item_options
WHERE order_item_id IN (
  SELECT oi.id
  FROM order_items oi
  INNER JOIN orders o ON oi.order_id = o.id
  WHERE o.customer_email IS NOT NULL
);

-- Deletar os order_items relacionados
DELETE FROM order_items
WHERE order_id IN (
  SELECT id FROM orders WHERE customer_email IS NOT NULL
);

-- Deletar o histórico de status
DELETE FROM order_status_history
WHERE order_id IN (
  SELECT id FROM orders WHERE customer_email IS NOT NULL
);

-- Por fim, deletar os pedidos
DELETE FROM orders
WHERE customer_email IS NOT NULL;
*/

-- ALTERNATIVA: Limpar apenas pedidos de emails específicos (mais seguro)
-- Descomente e ajuste o email conforme necessário
/*
DELETE FROM order_item_options
WHERE order_item_id IN (
  SELECT oi.id
  FROM order_items oi
  INNER JOIN orders o ON oi.order_id = o.id
  WHERE o.customer_email IN ('email1@example.com', 'email2@example.com')
);

DELETE FROM order_items
WHERE order_id IN (
  SELECT id FROM orders 
  WHERE customer_email IN ('email1@example.com', 'email2@example.com')
);

DELETE FROM order_status_history
WHERE order_id IN (
  SELECT id FROM orders 
  WHERE customer_email IN ('email1@example.com', 'email2@example.com')
);

DELETE FROM orders
WHERE customer_email IN ('email1@example.com', 'email2@example.com');
*/




