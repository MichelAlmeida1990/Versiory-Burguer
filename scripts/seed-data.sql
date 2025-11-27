-- Script para inserir dados de exemplo no banco de dados
-- Execute este script no SQL Editor do Supabase após criar as tabelas

-- Inserir categorias
INSERT INTO categories (name, "order", image) VALUES
  ('Entradas', 1, '/images/categorias/entradas.jpg'),
  ('Pratos Principais', 2, '/images/categorias/pratos.jpg'),
  ('Bebidas', 3, '/images/categorias/bebidas.jpg'),
  ('Sobremesas', 4, '/images/categorias/sobremesas.jpg'),
  ('Combos', 5, '/images/categorias/combos.jpg')
ON CONFLICT DO NOTHING;

-- Inserir produtos de exemplo (ajuste as URLs das imagens conforme necessário)
-- Você precisará pegar os IDs das categorias inseridas acima

-- Exemplo de produtos (ajuste os category_id após inserir as categorias)
-- Para pegar os IDs, execute: SELECT id, name FROM categories;

-- Exemplo de como inserir produtos:
/*
INSERT INTO products (name, description, price, category_id, image, available) VALUES
  ('Hambúrguer Artesanal', 'Pão brioche, carne 200g, queijo, alface, tomate e molho especial', 25.90, 
   (SELECT id FROM categories WHERE name = 'Pratos Principais' LIMIT 1),
   '/images/produtos/hamburguer.jpg', true),
  
  ('Batata Frita', 'Porção de batatas fritas crocantes com cheddar e bacon', 15.90,
   (SELECT id FROM categories WHERE name = 'Entradas' LIMIT 1),
   '/images/produtos/batata.jpg', true),
  
  ('Refrigerante', 'Coca-Cola, Pepsi, Guaraná ou Fanta - 350ml', 5.90,
   (SELECT id FROM categories WHERE name = 'Bebidas' LIMIT 1),
   '/images/produtos/refrigerante.jpg', true),
  
  ('Brownie com Sorvete', 'Brownie quentinho com sorvete de creme', 12.90,
   (SELECT id FROM categories WHERE name = 'Sobremesas' LIMIT 1),
   '/images/produtos/brownie.jpg', true),
  
  ('Combo Família', '2 Hambúrgueres, 2 Batatas, 2 Refrigerantes', 65.90,
   (SELECT id FROM categories WHERE name = 'Combos' LIMIT 1),
   '/images/produtos/combo.jpg', true);
*/

-- Dica: Use o Table Editor do Supabase para inserir produtos visualmente,
-- ou ajuste este script com os nomes reais das suas imagens.

