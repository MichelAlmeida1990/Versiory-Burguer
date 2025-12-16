-- Script para verificar pedidos de um cliente específico
-- Substitua 'EMAIL_DO_CLIENTE' pelo email que deseja verificar

-- Ver todos os pedidos de um email específico
SELECT 
  o.id,
  o.customer_email,
  o.customer_name,
  o.created_at,
  o.total,
  o.status,
  o.user_id as restaurant_id,
  (SELECT email FROM auth.users WHERE id::text = o.user_id::text) as restaurant_email
FROM orders o
WHERE LOWER(TRIM(o.customer_email)) = LOWER(TRIM('EMAIL_DO_CLIENTE'))
ORDER BY o.created_at DESC;

-- Contar quantos pedidos existem para esse email
SELECT 
  COUNT(*) as total_pedidos,
  SUM(o.total) as valor_total,
  MIN(o.created_at) as primeiro_pedido,
  MAX(o.created_at) as ultimo_pedido
FROM orders o
WHERE LOWER(TRIM(o.customer_email)) = LOWER(TRIM('EMAIL_DO_CLIENTE'));

-- Ver todos os emails únicos que têm pedidos (para identificar emails de teste)
SELECT 
  LOWER(TRIM(customer_email)) as email_normalizado,
  COUNT(*) as total_pedidos
FROM orders
WHERE customer_email IS NOT NULL
GROUP BY LOWER(TRIM(customer_email))
ORDER BY total_pedidos DESC;

