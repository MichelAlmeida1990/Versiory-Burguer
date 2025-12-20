-- ============================================
-- NORMALIZAR EMAILS DOS PEDIDOS
-- ============================================
-- Este script normaliza todos os emails dos pedidos (converte para lowercase e remove espaços)
-- Isso garante que a busca de pedidos por email funcione corretamente

UPDATE orders
SET customer_email = LOWER(TRIM(customer_email))
WHERE customer_email IS NOT NULL 
  AND (customer_email != LOWER(TRIM(customer_email)) OR customer_email != TRIM(customer_email));

-- Verificar quantos pedidos foram atualizados
SELECT 
  COUNT(*) as total_pedidos,
  COUNT(DISTINCT customer_email) as emails_unicos
FROM orders
WHERE customer_email IS NOT NULL;




