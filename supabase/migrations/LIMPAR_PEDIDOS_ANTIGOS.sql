-- Script para limpar pedidos de outros restaurantes da visão do cliente
-- Este script NÃO apaga os pedidos, apenas marca ou move para uma tabela de arquivo
-- OU pode ser usado para verificar quais pedidos precisam ser associados ao restaurante correto

-- IMPORTANTE: Antes de executar, verifique quais pedidos serão afetados

-- Verificar pedidos sem restaurant_id (user_id) correto
SELECT 
  o.id,
  o.customer_email,
  o.customer_name,
  o.created_at,
  o.total,
  o.user_id as restaurant_id,
  (SELECT email FROM auth.users WHERE id::text = o.user_id::text) as restaurant_email
FROM orders o
WHERE o.customer_email IS NOT NULL
ORDER BY o.created_at DESC
LIMIT 100;

-- Se quiser deletar pedidos órfãos (sem restaurant_id válido):
-- ATENÇÃO: Use com cuidado! Faça backup primeiro!
/*
DELETE FROM order_items 
WHERE order_id IN (
  SELECT id FROM orders 
  WHERE user_id NOT IN (SELECT id FROM auth.users)
);

DELETE FROM orders 
WHERE user_id::text NOT IN (SELECT id::text FROM auth.users);
*/

-- Se quiser marcar pedidos antigos como "arquivados" (criar coluna archived primeiro):
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;
-- UPDATE orders SET archived = TRUE WHERE user_id::text NOT IN (SELECT id::text FROM auth.users WHERE email LIKE '%@%');

