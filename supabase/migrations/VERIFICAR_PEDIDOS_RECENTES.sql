-- ============================================
-- VERIFICAR PEDIDOS RECENTES E SEUS EMAILS
-- ============================================
-- Este script lista os últimos 20 pedidos criados
-- com seus dados de cliente para verificar onde estão sendo salvos

SELECT 
  id,
  customer_name,
  customer_email,
  customer_phone,
  status,
  total,
  payment_method,
  created_at,
  user_id as restaurant_id
FROM orders
ORDER BY created_at DESC
LIMIT 20;

-- Verificar também quantos pedidos existem no total
SELECT COUNT(*) as total_pedidos FROM orders;

-- Verificar quantos pedidos têm email
SELECT 
  COUNT(*) as total_com_email,
  COUNT(DISTINCT customer_email) as emails_unicos
FROM orders
WHERE customer_email IS NOT NULL;

