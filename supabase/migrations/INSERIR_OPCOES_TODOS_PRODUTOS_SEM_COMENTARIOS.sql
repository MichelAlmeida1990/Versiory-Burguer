INSERT INTO product_options (product_id, name, type, required, display_order)
SELECT id, 'Tamanho', 'single', true, 1
FROM products
WHERE LOWER(name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id AND po.name = 'Tamanho');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Pequena (4 fatias)', 0.00, 1, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Tamanho' AND LOWER(p.name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Pequena (4 fatias)');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Média (6 fatias)', 5.00, 2, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Tamanho' AND LOWER(p.name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Média (6 fatias)');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Grande (8 fatias)', 10.00, 3, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Tamanho' AND LOWER(p.name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Grande (8 fatias)');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Família (12 fatias)', 18.00, 4, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Tamanho' AND LOWER(p.name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Família (12 fatias)');

INSERT INTO product_options (product_id, name, type, required, display_order)
SELECT id, 'Borda', 'single', false, 2
FROM products
WHERE LOWER(name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id AND po.name = 'Borda');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Normal', 0.00, 1, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Borda' AND LOWER(p.name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Normal');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Borda Recheada Catupiry', 3.00, 2, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Borda' AND LOWER(p.name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Borda Recheada Catupiry');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Borda Recheada Cheddar', 3.50, 3, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Borda' AND LOWER(p.name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Borda Recheada Cheddar');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Borda Recheada Cream Cheese', 3.50, 4, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Borda' AND LOWER(p.name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Borda Recheada Cream Cheese');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Borda Recheada Calabresa', 4.00, 5, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Borda' AND LOWER(p.name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Borda Recheada Calabresa');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Borda Doce (Chocolate)', 4.50, 6, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Borda' AND LOWER(p.name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Borda Doce (Chocolate)');

INSERT INTO product_options (product_id, name, type, required, display_order)
SELECT id, 'Ingredientes Extras', 'multiple', false, 3
FROM products
WHERE LOWER(name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id AND po.name = 'Ingredientes Extras');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Queijo Extra', 2.00, 1, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Ingredientes Extras' AND LOWER(p.name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Queijo Extra');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Bacon', 3.00, 2, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Ingredientes Extras' AND LOWER(p.name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Bacon');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Calabresa', 2.50, 3, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Ingredientes Extras' AND LOWER(p.name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Calabresa');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Azeitona', 1.50, 4, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Ingredientes Extras' AND LOWER(p.name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Azeitona');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Cebola', 1.00, 5, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Ingredientes Extras' AND LOWER(p.name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Cebola');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Champignon', 2.50, 6, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Ingredientes Extras' AND LOWER(p.name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Champignon');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Pepperoni', 3.50, 7, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Ingredientes Extras' AND LOWER(p.name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Pepperoni');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Parmesão Ralado', 2.00, 8, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Ingredientes Extras' AND LOWER(p.name) LIKE '%pizza%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Parmesão Ralado');

INSERT INTO product_options (product_id, name, type, required, display_order)
SELECT id, 'Tamanho', 'single', true, 1
FROM products
WHERE (LOWER(name) LIKE '%hambúrguer%' OR LOWER(name) LIKE '%hamburger%' OR LOWER(name) LIKE '%burger%')
  AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id AND po.name = 'Tamanho');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Simples (1 hambúrguer)', 0.00, 1, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Tamanho' AND (LOWER(p.name) LIKE '%hambúrguer%' OR LOWER(p.name) LIKE '%hamburger%' OR LOWER(p.name) LIKE '%burger%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Simples (1 hambúrguer)');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Duplo (2 hambúrgueres)', 8.00, 2, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Tamanho' AND (LOWER(p.name) LIKE '%hambúrguer%' OR LOWER(p.name) LIKE '%hamburger%' OR LOWER(p.name) LIKE '%burger%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Duplo (2 hambúrgueres)');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Triplo (3 hambúrgueres)', 15.00, 3, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Tamanho' AND (LOWER(p.name) LIKE '%hambúrguer%' OR LOWER(p.name) LIKE '%hamburger%' OR LOWER(p.name) LIKE '%burger%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Triplo (3 hambúrgueres)');

INSERT INTO product_options (product_id, name, type, required, display_order)
SELECT id, 'Adicionais', 'multiple', false, 2
FROM products
WHERE (LOWER(name) LIKE '%hambúrguer%' OR LOWER(name) LIKE '%hamburger%' OR LOWER(name) LIKE '%burger%')
  AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id AND po.name = 'Adicionais');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Bacon', 3.00, 1, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Adicionais' AND (LOWER(p.name) LIKE '%hambúrguer%' OR LOWER(p.name) LIKE '%hamburger%' OR LOWER(p.name) LIKE '%burger%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Bacon');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Ovo', 2.00, 2, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Adicionais' AND (LOWER(p.name) LIKE '%hambúrguer%' OR LOWER(p.name) LIKE '%hamburger%' OR LOWER(p.name) LIKE '%burger%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Ovo');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Queijo Extra', 2.50, 3, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Adicionais' AND (LOWER(p.name) LIKE '%hambúrguer%' OR LOWER(p.name) LIKE '%hamburger%' OR LOWER(p.name) LIKE '%burger%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Queijo Extra');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Cebola Caramelizada', 1.50, 4, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Adicionais' AND (LOWER(p.name) LIKE '%hambúrguer%' OR LOWER(p.name) LIKE '%hamburger%' OR LOWER(p.name) LIKE '%burger%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Cebola Caramelizada');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Cogumelos Grelhados', 2.50, 5, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Adicionais' AND (LOWER(p.name) LIKE '%hambúrguer%' OR LOWER(p.name) LIKE '%hamburger%' OR LOWER(p.name) LIKE '%burger%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Cogumelos Grelhados');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Anéis de Cebola', 3.50, 6, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Adicionais' AND (LOWER(p.name) LIKE '%hambúrguer%' OR LOWER(p.name) LIKE '%hamburger%' OR LOWER(p.name) LIKE '%burger%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Anéis de Cebola');

INSERT INTO product_options (product_id, name, type, required, display_order)
SELECT id, 'Molhos', 'multiple', false, 3
FROM products
WHERE (LOWER(name) LIKE '%hambúrguer%' OR LOWER(name) LIKE '%hamburger%' OR LOWER(name) LIKE '%burger%')
  AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id AND po.name = 'Molhos');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Maionese Temperada', 1.00, 1, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Molhos' AND (LOWER(p.name) LIKE '%hambúrguer%' OR LOWER(p.name) LIKE '%hamburger%' OR LOWER(p.name) LIKE '%burger%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Maionese Temperada');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Mostarda e Mel', 1.50, 2, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Molhos' AND (LOWER(p.name) LIKE '%hambúrguer%' OR LOWER(p.name) LIKE '%hamburger%' OR LOWER(p.name) LIKE '%burger%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Mostarda e Mel');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Barbecue', 1.50, 3, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Molhos' AND (LOWER(p.name) LIKE '%hambúrguer%' OR LOWER(p.name) LIKE '%hamburger%' OR LOWER(p.name) LIKE '%burger%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Barbecue');

INSERT INTO product_options (product_id, name, type, required, display_order)
SELECT id, 'Tamanho', 'single', true, 1
FROM products
WHERE (LOWER(name) LIKE '%refrigerante%' OR LOWER(name) LIKE '%suco%' OR LOWER(name) LIKE '%água%' OR LOWER(name) LIKE '%bebida%'
   OR category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%bebida%'))
  AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id AND po.name = 'Tamanho');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, '300ml (lata)', 0.00, 1, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Tamanho' AND (LOWER(p.name) LIKE '%refrigerante%' OR LOWER(p.name) LIKE '%suco%' OR LOWER(p.name) LIKE '%água%' OR LOWER(p.name) LIKE '%bebida%'
       OR p.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%bebida%'))
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = '300ml (lata)');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, '500ml (garrafa)', 2.00, 2, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Tamanho' AND (LOWER(p.name) LIKE '%refrigerante%' OR LOWER(p.name) LIKE '%suco%' OR LOWER(p.name) LIKE '%água%' OR LOWER(p.name) LIKE '%bebida%'
       OR p.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%bebida%'))
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = '500ml (garrafa)');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, '1L (garrafa)', 4.00, 3, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Tamanho' AND (LOWER(p.name) LIKE '%refrigerante%' OR LOWER(p.name) LIKE '%suco%' OR LOWER(p.name) LIKE '%água%' OR LOWER(p.name) LIKE '%bebida%'
       OR p.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%bebida%'))
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = '1L (garrafa)');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, '2L (garrafa)', 6.00, 4, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Tamanho' AND (LOWER(p.name) LIKE '%refrigerante%' OR LOWER(p.name) LIKE '%suco%' OR LOWER(p.name) LIKE '%água%' OR LOWER(p.name) LIKE '%bebida%'
       OR p.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%bebida%'))
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = '2L (garrafa)');

INSERT INTO product_options (product_id, name, type, required, display_order)
SELECT id, 'Gelo', 'single', false, 2
FROM products
WHERE (LOWER(name) LIKE '%refrigerante%' OR LOWER(name) LIKE '%suco%' OR LOWER(name) LIKE '%bebida%'
   OR category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%bebida%'))
  AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id AND po.name = 'Gelo');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Com Gelo', 0.00, 1, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Gelo' AND (LOWER(p.name) LIKE '%refrigerante%' OR LOWER(p.name) LIKE '%suco%' OR LOWER(p.name) LIKE '%bebida%'
       OR p.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%bebida%'))
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Com Gelo');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Sem Gelo', 0.00, 2, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Gelo' AND (LOWER(p.name) LIKE '%refrigerante%' OR LOWER(p.name) LIKE '%suco%' OR LOWER(p.name) LIKE '%bebida%'
       OR p.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%bebida%'))
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Sem Gelo');

INSERT INTO product_options (product_id, name, type, required, display_order)
SELECT id, 'Tamanho', 'single', true, 1
FROM products
WHERE LOWER(name) LIKE '%salada%'
  AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id AND po.name = 'Tamanho');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Pequena', 0.00, 1, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Tamanho' AND LOWER(p.name) LIKE '%salada%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Pequena');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Média', 3.00, 2, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Tamanho' AND LOWER(p.name) LIKE '%salada%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Média');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Grande', 6.00, 3, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Tamanho' AND LOWER(p.name) LIKE '%salada%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Grande');

INSERT INTO product_options (product_id, name, type, required, display_order)
SELECT id, 'Proteínas', 'single', false, 2
FROM products
WHERE LOWER(name) LIKE '%salada%'
  AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id AND po.name = 'Proteínas');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Sem Proteína', 0.00, 1, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Proteínas' AND LOWER(p.name) LIKE '%salada%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Sem Proteína');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Frango Grelhado', 5.00, 2, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Proteínas' AND LOWER(p.name) LIKE '%salada%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Frango Grelhado');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Atum', 4.00, 3, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Proteínas' AND LOWER(p.name) LIKE '%salada%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Atum');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Ovo Cozido', 2.00, 4, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Proteínas' AND LOWER(p.name) LIKE '%salada%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Ovo Cozido');

INSERT INTO product_options (product_id, name, type, required, display_order)
SELECT id, 'Toppings Extras', 'multiple', false, 3
FROM products
WHERE LOWER(name) LIKE '%salada%'
  AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id AND po.name = 'Toppings Extras');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Croutons', 1.50, 1, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Toppings Extras' AND LOWER(p.name) LIKE '%salada%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Croutons');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Nozes', 2.50, 2, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Toppings Extras' AND LOWER(p.name) LIKE '%salada%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Nozes');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Bacon', 3.00, 3, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Toppings Extras' AND LOWER(p.name) LIKE '%salada%'
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Bacon');

INSERT INTO product_options (product_id, name, type, required, display_order)
SELECT id, 'Proteínas Adicionais', 'multiple', false, 1
FROM products
WHERE (LOWER(name) LIKE '%massa%' OR LOWER(name) LIKE '%penne%' OR LOWER(name) LIKE '%espaguete%'
   OR LOWER(name) LIKE '%fettuccine%' OR LOWER(name) LIKE '%lasanha%' OR LOWER(name) LIKE '%risotto%')
  AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id AND po.name = 'Proteínas Adicionais');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Frango Grelhado', 5.00, 1, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Proteínas Adicionais' AND (LOWER(p.name) LIKE '%massa%' OR LOWER(p.name) LIKE '%penne%' OR LOWER(p.name) LIKE '%espaguete%'
       OR LOWER(p.name) LIKE '%fettuccine%' OR LOWER(p.name) LIKE '%lasanha%' OR LOWER(p.name) LIKE '%risotto%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Frango Grelhado');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Camarão', 8.00, 2, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Proteínas Adicionais' AND (LOWER(p.name) LIKE '%massa%' OR LOWER(p.name) LIKE '%penne%' OR LOWER(p.name) LIKE '%espaguete%'
       OR LOWER(p.name) LIKE '%fettuccine%' OR LOWER(p.name) LIKE '%lasanha%' OR LOWER(p.name) LIKE '%risotto%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Camarão');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Bacon', 3.00, 3, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Proteínas Adicionais' AND (LOWER(p.name) LIKE '%massa%' OR LOWER(p.name) LIKE '%penne%' OR LOWER(p.name) LIKE '%espaguete%'
       OR LOWER(p.name) LIKE '%fettuccine%' OR LOWER(p.name) LIKE '%lasanha%' OR LOWER(p.name) LIKE '%risotto%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Bacon');

INSERT INTO product_options (product_id, name, type, required, display_order)
SELECT id, 'Queijo Extra', 'multiple', false, 2
FROM products
WHERE (LOWER(name) LIKE '%massa%' OR LOWER(name) LIKE '%penne%' OR LOWER(name) LIKE '%espaguete%'
   OR LOWER(name) LIKE '%fettuccine%' OR LOWER(name) LIKE '%lasanha%' OR LOWER(name) LIKE '%risotto%')
  AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id AND po.name = 'Queijo Extra');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Parmesão Ralado', 2.00, 1, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Queijo Extra' AND (LOWER(p.name) LIKE '%massa%' OR LOWER(p.name) LIKE '%penne%' OR LOWER(p.name) LIKE '%espaguete%'
       OR LOWER(p.name) LIKE '%fettuccine%' OR LOWER(p.name) LIKE '%lasanha%' OR LOWER(p.name) LIKE '%risotto%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Parmesão Ralado');

INSERT INTO product_options (product_id, name, type, required, display_order)
SELECT id, 'Acompanhamentos', 'multiple', false, 1
FROM products
WHERE (LOWER(name) LIKE '%frango%' OR LOWER(name) LIKE '%carne%'
   OR LOWER(name) LIKE '%grelhado%' OR LOWER(name) LIKE '%assado%')
  AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id AND po.name = 'Acompanhamentos');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Batata Frita', 3.00, 1, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Acompanhamentos' AND (LOWER(p.name) LIKE '%frango%' OR LOWER(p.name) LIKE '%carne%'
       OR LOWER(p.name) LIKE '%grelhado%' OR LOWER(p.name) LIKE '%assado%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Batata Frita');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Purê de Batata', 2.50, 2, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Acompanhamentos' AND (LOWER(p.name) LIKE '%frango%' OR LOWER(p.name) LIKE '%carne%'
       OR LOWER(p.name) LIKE '%grelhado%' OR LOWER(p.name) LIKE '%assado%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Purê de Batata');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Salada', 2.00, 3, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Acompanhamentos' AND (LOWER(p.name) LIKE '%frango%' OR LOWER(p.name) LIKE '%carne%'
       OR LOWER(p.name) LIKE '%grelhado%' OR LOWER(p.name) LIKE '%assado%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Salada');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Farofa', 1.50, 4, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Acompanhamentos' AND (LOWER(p.name) LIKE '%frango%' OR LOWER(p.name) LIKE '%carne%'
       OR LOWER(p.name) LIKE '%grelhado%' OR LOWER(p.name) LIKE '%assado%')
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Farofa');

INSERT INTO product_options (product_id, name, type, required, display_order)
SELECT id, 'Tamanho', 'single', true, 1
FROM products
WHERE (LOWER(name) LIKE '%sobremesa%' OR LOWER(name) LIKE '%sorvete%' OR LOWER(name) LIKE '%açaí%'
   OR LOWER(name) LIKE '%pudim%' OR LOWER(name) LIKE '%mousse%'
   OR category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%sobremesa%'))
  AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id AND po.name = 'Tamanho');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Pequeno', 0.00, 1, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Tamanho' AND (LOWER(p.name) LIKE '%sobremesa%' OR LOWER(p.name) LIKE '%sorvete%' OR LOWER(p.name) LIKE '%açaí%'
       OR LOWER(p.name) LIKE '%pudim%' OR LOWER(p.name) LIKE '%mousse%'
       OR p.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%sobremesa%'))
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Pequeno');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Médio', 3.00, 2, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Tamanho' AND (LOWER(p.name) LIKE '%sobremesa%' OR LOWER(p.name) LIKE '%sorvete%' OR LOWER(p.name) LIKE '%açaí%'
       OR LOWER(p.name) LIKE '%pudim%' OR LOWER(p.name) LIKE '%mousse%'
       OR p.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%sobremesa%'))
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Médio');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Grande', 6.00, 3, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Tamanho' AND (LOWER(p.name) LIKE '%sobremesa%' OR LOWER(p.name) LIKE '%sorvete%' OR LOWER(p.name) LIKE '%açaí%'
       OR LOWER(p.name) LIKE '%pudim%' OR LOWER(p.name) LIKE '%mousse%'
       OR p.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%sobremesa%'))
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Grande');

INSERT INTO product_options (product_id, name, type, required, display_order)
SELECT id, 'Coberturas', 'multiple', false, 2
FROM products
WHERE (LOWER(name) LIKE '%sobremesa%' OR LOWER(name) LIKE '%sorvete%' OR LOWER(name) LIKE '%açaí%'
   OR LOWER(name) LIKE '%pudim%' OR LOWER(name) LIKE '%mousse%'
   OR category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%sobremesa%'))
  AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id AND po.name = 'Coberturas');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Calda de Chocolate', 2.00, 1, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Coberturas' AND (LOWER(p.name) LIKE '%sobremesa%' OR LOWER(p.name) LIKE '%sorvete%' OR LOWER(p.name) LIKE '%açaí%'
       OR LOWER(p.name) LIKE '%pudim%' OR LOWER(p.name) LIKE '%mousse%'
       OR p.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%sobremesa%'))
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Calda de Chocolate');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Calda de Morango', 2.00, 2, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Coberturas' AND (LOWER(p.name) LIKE '%sobremesa%' OR LOWER(p.name) LIKE '%sorvete%' OR LOWER(p.name) LIKE '%açaí%'
       OR LOWER(p.name) LIKE '%pudim%' OR LOWER(p.name) LIKE '%mousse%'
       OR p.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%sobremesa%'))
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Calda de Morango');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Chantilly', 1.50, 3, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Coberturas' AND (LOWER(p.name) LIKE '%sobremesa%' OR LOWER(p.name) LIKE '%sorvete%' OR LOWER(p.name) LIKE '%açaí%'
       OR LOWER(p.name) LIKE '%pudim%' OR LOWER(p.name) LIKE '%mousse%'
       OR p.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%sobremesa%'))
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Chantilly');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Frutas Frescas', 2.50, 4, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Coberturas' AND (LOWER(p.name) LIKE '%sobremesa%' OR LOWER(p.name) LIKE '%sorvete%' OR LOWER(p.name) LIKE '%açaí%'
       OR LOWER(p.name) LIKE '%pudim%' OR LOWER(p.name) LIKE '%mousse%'
       OR p.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%sobremesa%'))
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Frutas Frescas');

INSERT INTO product_options (product_id, name, type, required, display_order)
SELECT id, 'Quantidade', 'single', true, 1
FROM products
WHERE (LOWER(name) LIKE '%pão%' OR LOWER(name) LIKE '%entrada%'
   OR category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%entrada%'))
  AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id AND po.name = 'Quantidade');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, '4 unidades', 0.00, 1, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Quantidade' AND (LOWER(p.name) LIKE '%pão%' OR LOWER(p.name) LIKE '%entrada%'
       OR p.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%entrada%'))
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = '4 unidades');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, '6 unidades', 4.00, 2, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Quantidade' AND (LOWER(p.name) LIKE '%pão%' OR LOWER(p.name) LIKE '%entrada%'
       OR p.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%entrada%'))
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = '6 unidades');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, '8 unidades', 7.00, 3, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Quantidade' AND (LOWER(p.name) LIKE '%pão%' OR LOWER(p.name) LIKE '%entrada%'
       OR p.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%entrada%'))
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = '8 unidades');

INSERT INTO product_options (product_id, name, type, required, display_order)
SELECT id, 'Recheios', 'multiple', false, 2
FROM products
WHERE (LOWER(name) LIKE '%pão%' OR LOWER(name) LIKE '%entrada%'
   OR category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%entrada%'))
  AND NOT EXISTS (SELECT 1 FROM product_options po WHERE po.product_id = products.id AND po.name = 'Recheios');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Queijo Mozzarella', 2.00, 1, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Recheios' AND (LOWER(p.name) LIKE '%pão%' OR LOWER(p.name) LIKE '%entrada%'
       OR p.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%entrada%'))
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Queijo Mozzarella');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Queijo Cheddar', 2.50, 2, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Recheios' AND (LOWER(p.name) LIKE '%pão%' OR LOWER(p.name) LIKE '%entrada%'
       OR p.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%entrada%'))
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Queijo Cheddar');

INSERT INTO product_option_values (option_id, name, price_modifier, display_order, available)
SELECT po.id, 'Bacon', 3.00, 3, true
FROM product_options po
JOIN products p ON p.id = po.product_id
WHERE po.name = 'Recheios' AND (LOWER(p.name) LIKE '%pão%' OR LOWER(p.name) LIKE '%entrada%'
       OR p.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%entrada%'))
  AND NOT EXISTS (SELECT 1 FROM product_option_values pov WHERE pov.option_id = po.id AND pov.name = 'Bacon');


