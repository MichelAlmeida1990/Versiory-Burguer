CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  image TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled')),
  total DECIMAL(10, 2) NOT NULL,
  delivery_address TEXT,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  payment_method VARCHAR(50) CHECK (payment_method IN ('card', 'pix', 'cash')),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DELETE FROM products;
DELETE FROM categories;

INSERT INTO categories (name, image, "order") VALUES
  ('Entradas', '/images/categorias/Imagem do WhatsApp de 2025-10-22 à(s) 18.37.29_3f3b11f1.jpg', 1),
  ('Pratos Principais', '/images/categorias/Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_049befce.jpg', 2),
  ('Bebidas', '/images/categorias/Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_0a041da7.jpg', 3),
  ('Sobremesas', '/images/categorias/Imagem do WhatsApp de 2025-10-22 à(s) 18.37.30_35366cce.jpg', 4);

INSERT INTO products (name, description, price, category_id, image, available) VALUES
  ('Batata Frita Crocante', 'Porção generosa de batatas fritas crocantes, temperadas com sal e ervas', 15.90, 
   (SELECT id FROM categories WHERE name = 'Entradas' LIMIT 1),
   'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=600&fit=crop', true),
  ('Anéis de Cebola', 'Anéis de cebola empanados e fritos, servidos com molho especial', 18.90,
   (SELECT id FROM categories WHERE name = 'Entradas' LIMIT 1),
   '/images/produtos/aneisCebola.png', true),
  ('Coxinha de Frango', 'Coxinhas artesanais recheadas com frango desfiado e catupiry', 12.90,
   (SELECT id FROM categories WHERE name = 'Entradas' LIMIT 1),
   'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop', true),
  ('Bruschetta Italiana', 'Pão italiano grelhado com tomate, manjericão e azeite de oliva', 16.90,
   (SELECT id FROM categories WHERE name = 'Entradas' LIMIT 1),
   '/images/produtos/bruscheta.png', true),
  ('Nachos com Queijo', 'Tortilhas crocantes com queijo derretido, jalapeños e guacamole', 22.90,
   (SELECT id FROM categories WHERE name = 'Entradas' LIMIT 1),
   'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800&h=600&fit=crop', true);

INSERT INTO products (name, description, price, category_id, image, available) VALUES
  ('Hambúrguer Artesanal', 'Pão brioche, hambúrguer 200g, queijo cheddar, bacon, alface, tomate e molho especial', 32.90,
   (SELECT id FROM categories WHERE name = 'Pratos Principais' LIMIT 1),
   'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop', true),
  ('Pizza Margherita', 'Massa artesanal, molho de tomate, mussarela e manjericão fresco', 35.90,
   (SELECT id FROM categories WHERE name = 'Pratos Principais' LIMIT 1),
   'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop', true),
  ('Pizza Calabresa', 'Massa artesanal, molho de tomate, mussarela, calabresa e cebola', 38.90,
   (SELECT id FROM categories WHERE name = 'Pratos Principais' LIMIT 1),
   'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=600&fit=crop', true),
  ('Frango Grelhado', 'Peito de frango grelhado com arroz, feijão, batata frita e salada', 28.90,
   (SELECT id FROM categories WHERE name = 'Pratos Principais' LIMIT 1),
   '/images/produtos/frangoGrelhado.png', true),
  ('Risotto de Camarão', 'Arroz arbóreo cremoso com camarões frescos e ervas', 45.90,
   (SELECT id FROM categories WHERE name = 'Pratos Principais' LIMIT 1),
   '/images/produtos/risotoCamarao.png', true),
  ('Lasanha à Bolonhesa', 'Camadas de massa, molho bolonhesa, queijo e bechamel gratinado', 42.90,
   (SELECT id FROM categories WHERE name = 'Pratos Principais' LIMIT 1),
   'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&h=600&fit=crop', true),
  ('Penne ao Molho Pesto', 'Massa penne com molho pesto de manjericão, pinoli e queijo parmesão', 36.90,
   (SELECT id FROM categories WHERE name = 'Pratos Principais' LIMIT 1),
   'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop', true),
  ('Salada Caesar', 'Alface romana, croutons, parmesão e molho caesar artesanal', 24.90,
   (SELECT id FROM categories WHERE name = 'Pratos Principais' LIMIT 1),
   'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop', true);

INSERT INTO products (name, description, price, category_id, image, available) VALUES
  ('Refrigerante', 'Coca-Cola, Pepsi, Guaraná ou Fanta - 350ml', 6.90,
   (SELECT id FROM categories WHERE name = 'Bebidas' LIMIT 1),
   '/images/produtos/refrigerante.png', true),
  ('Suco Natural', 'Laranja, Limão, Maracujá ou Abacaxi - 500ml', 8.90,
   (SELECT id FROM categories WHERE name = 'Bebidas' LIMIT 1),
   'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&h=600&fit=crop', true),
  ('Água Mineral', 'Água mineral sem gás ou com gás - 500ml', 4.90,
   (SELECT id FROM categories WHERE name = 'Bebidas' LIMIT 1),
   '/images/produtos/agua.png', true),
  ('Cerveja Artesanal', 'Cerveja artesanal local - 500ml', 12.90,
   (SELECT id FROM categories WHERE name = 'Bebidas' LIMIT 1),
   'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&h=600&fit=crop', true),
  ('Vinho Tinto', 'Taça de vinho tinto da casa', 15.90,
   (SELECT id FROM categories WHERE name = 'Bebidas' LIMIT 1),
   '/images/produtos/vinhoTinto.png', true),
  ('Café Expresso', 'Café expresso italiano', 5.90,
   (SELECT id FROM categories WHERE name = 'Bebidas' LIMIT 1),
   'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&h=600&fit=crop', true);

INSERT INTO products (name, description, price, category_id, image, available) VALUES
  ('Tiramisu', 'Clássico tiramisu italiano com café e cacau', 18.90,
   (SELECT id FROM categories WHERE name = 'Sobremesas' LIMIT 1),
   '/images/banners/Imagem do WhatsApp de 2025-10-22 à(s) 18.42.52_ff444b45.jpg', true),
  ('Petit Gateau', 'Bolinho de chocolate quente com sorvete de baunilha', 19.90,
   (SELECT id FROM categories WHERE name = 'Sobremesas' LIMIT 1),
   '/images/produtos/petitGateau.png', true),
  ('Mousse de Chocolate', 'Mousse cremosa de chocolate belga', 14.90,
   (SELECT id FROM categories WHERE name = 'Sobremesas' LIMIT 1),
   '/images/produtos/mousseChocolate.png', true);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create products" ON products;
CREATE POLICY "Anyone can create products" ON products
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update products" ON products;
CREATE POLICY "Anyone can update products" ON products
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Orders are viewable by everyone" ON orders;
CREATE POLICY "Orders are viewable by everyone" ON orders
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Orders can be updated" ON orders;
CREATE POLICY "Orders can be updated" ON orders
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Order items are viewable by everyone" ON order_items;
CREATE POLICY "Order items are viewable by everyone" ON order_items
  FOR SELECT USING (true);
