-- Query de diagnóstico para verificar se os produtos estão associados corretamente às categorias

-- Verificar todas as categorias
SELECT id, name, "order" FROM categories ORDER BY "order";

-- Verificar produtos e suas categorias
SELECT 
  p.id,
  p.name as produto_nome,
  p.category_id,
  c.id as categoria_id_esperado,
  c.name as categoria_nome,
  CASE 
    WHEN p.category_id IS NULL THEN 'SEM CATEGORIA'
    WHEN p.category_id = c.id THEN 'OK'
    ELSE 'CATEGORIA INCORRETA'
  END as status
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY c."order", p.name;

-- Contar produtos por categoria
SELECT 
  c.name as categoria,
  COUNT(p.id) as total_produtos
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.available = true
GROUP BY c.id, c.name, c."order"
ORDER BY c."order";

-- Verificar produtos sem categoria
SELECT id, name, category_id 
FROM products 
WHERE category_id IS NULL OR category_id NOT IN (SELECT id FROM categories);



