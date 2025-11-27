DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders);
DELETE FROM orders;
DELETE FROM products WHERE name IN (
  SELECT name FROM products GROUP BY name HAVING COUNT(*) > 1
);
DELETE FROM products;
DELETE FROM categories WHERE name IN (
  SELECT name FROM categories GROUP BY name HAVING COUNT(*) > 1
);
DELETE FROM categories;

