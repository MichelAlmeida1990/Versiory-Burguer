-- ============================================
-- EXEMPLO: Como criar opções para uma PIZZA
-- ============================================
-- 
-- Este é um exemplo prático de como inserir opções
-- para um produto (Pizza Margherita)
--
-- PASSO 1: Identifique o ID da pizza
-- SELECT id, name FROM products WHERE name LIKE '%Pizza%';
--
-- PASSO 2: Substitua 'PRODUTO_ID_AQUI' pelo ID real da pizza
-- PASSO 3: Execute este SQL no Supabase

-- ============================================
-- OPÇÃO 1: TAMANHO (Obrigatória)
-- ============================================
INSERT INTO product_options (product_id, name, type, required, display_order)
VALUES (
  'PRODUTO_ID_AQUI', -- Substitua pelo ID da pizza
  'Tamanho',
  'single', -- Escolha única
  true, -- Obrigatória
  1 -- Primeira opção
)
RETURNING id; -- Anote este ID para usar abaixo

-- Agora insira os valores da opção Tamanho
-- (Use o ID retornado acima como option_id)
INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
VALUES
  ('OPCAO_TAMANHO_ID', 'Pequena (4 fatias)', 0.00, 1, true),
  ('OPCAO_TAMANHO_ID', 'Média (6 fatias)', 5.00, 2, true),
  ('OPCAO_TAMANHO_ID', 'Grande (8 fatias)', 10.00, 3, true),
  ('OPCAO_TAMANHO_ID', 'Família (12 fatias)', 18.00, 4, true);

-- ============================================
-- OPÇÃO 2: BORDA (Opcional) ⭐ IMPORTANTE
-- ============================================
INSERT INTO product_options (product_id, name, type, required, display_order)
VALUES (
  'PRODUTO_ID_AQUI', -- Mesmo ID da pizza
  'Borda',
  'single', -- Escolha única
  false, -- Opcional
  2 -- Segunda opção
)
RETURNING id; -- Anote este ID

-- Valores da opção Borda
INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
VALUES
  ('OPCAO_BORDA_ID', 'Normal', 0.00, 1, true),
  ('OPCAO_BORDA_ID', 'Borda Recheada Catupiry', 3.00, 2, true),
  ('OPCAO_BORDA_ID', 'Borda Recheada Cheddar', 3.50, 3, true),
  ('OPCAO_BORDA_ID', 'Borda Recheada Cream Cheese', 3.50, 4, true),
  ('OPCAO_BORDA_ID', 'Borda Recheada Calabresa', 4.00, 5, true),
  ('OPCAO_BORDA_ID', 'Borda Doce (Chocolate)', 4.50, 6, true);

-- ============================================
-- OPÇÃO 3: INGREDIENTES EXTRAS (Opcional)
-- ============================================
INSERT INTO product_options (product_id, name, type, required, display_order)
VALUES (
  'PRODUTO_ID_AQUI', -- Mesmo ID da pizza
  'Ingredientes Extras',
  'multiple', -- Múltipla escolha
  false, -- Opcional
  3 -- Terceira opção
)
RETURNING id; -- Anote este ID

-- Valores da opção Ingredientes Extras
INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
VALUES
  ('OPCAO_INGREDIENTES_ID', 'Queijo Extra', 2.00, 1, true),
  ('OPCAO_INGREDIENTES_ID', 'Bacon', 3.00, 2, true),
  ('OPCAO_INGREDIENTES_ID', 'Calabresa', 2.50, 3, true),
  ('OPCAO_INGREDIENTES_ID', 'Azeitona', 1.50, 4, true),
  ('OPCAO_INGREDIENTES_ID', 'Cebola', 1.00, 5, true),
  ('OPCAO_INGREDIENTES_ID', 'Pimentão', 1.00, 6, true),
  ('OPCAO_INGREDIENTES_ID', 'Champignon', 2.50, 7, true),
  ('OPCAO_INGREDIENTES_ID', 'Pepperoni', 3.50, 8, true),
  ('OPCAO_INGREDIENTES_ID', 'Frango Desfiado', 3.00, 9, true),
  ('OPCAO_INGREDIENTES_ID', 'Parmesão Ralado', 2.00, 10, true);

-- ============================================
-- OPÇÃO 4: MOLHOS EXTRAS (Opcional)
-- ============================================
INSERT INTO product_options (product_id, name, type, required, display_order)
VALUES (
  'PRODUTO_ID_AQUI', -- Mesmo ID da pizza
  'Molhos Extras',
  'multiple', -- Múltipla escolha
  false, -- Opcional
  4 -- Quarta opção
)
RETURNING id; -- Anote este ID

-- Valores da opção Molhos Extras
INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
VALUES
  ('OPCAO_MOLHOS_ID', 'Molho Barbecue', 1.50, 1, true),
  ('OPCAO_MOLHOS_ID', 'Molho Alho e Óleo', 1.00, 2, true),
  ('OPCAO_MOLHOS_ID', 'Molho Pesto', 2.00, 3, true),
  ('OPCAO_MOLHOS_ID', 'Molho Picante', 0.50, 4, true);

-- ============================================
-- COMO USAR:
-- ============================================
-- 1. Execute: SELECT id, name FROM products WHERE name LIKE '%Pizza%';
-- 2. Copie o ID da pizza desejada
-- 3. Substitua 'PRODUTO_ID_AQUI' pelo ID real
-- 4. Execute cada INSERT separadamente
-- 5. Anote os IDs retornados para usar nos valores
-- 6. Substitua 'OPCAO_XXX_ID' pelos IDs reais
-- 7. Execute os INSERTs de valores

-- ============================================
-- VERIFICAR SE FUNCIONOU:
-- ============================================
-- SELECT 
--   po.name as opcao,
--   po.type,
--   po.required,
--   pov.name as valor,
--   pov.price_modifier
-- FROM product_options po
-- JOIN product_option_values pov ON pov.option_id = po.id
-- WHERE po.product_id = 'PRODUTO_ID_AQUI'
-- ORDER BY po.display_order, pov.display_order;


