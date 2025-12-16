-- ============================================
-- SISTEMA DE OPÇÕES/ADICIONAIS PARA PRODUTOS
-- ============================================

-- Tabela: product_options
-- Armazena as opções disponíveis para cada produto
-- Exemplo: "Tamanho", "Borda", "Ingredientes Extras"
CREATE TABLE IF NOT EXISTS product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('single', 'multiple')),
  required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: product_option_values
-- Armazena os valores possíveis para cada opção
-- Exemplo: "Pequena", "Média", "Grande" para opção "Tamanho"
CREATE TABLE IF NOT EXISTS product_option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID REFERENCES product_options(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price_modifier DECIMAL(10, 2) DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: order_item_options
-- Armazena as opções selecionadas para cada item do pedido
CREATE TABLE IF NOT EXISTS order_item_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  option_id UUID REFERENCES product_options(id) ON DELETE SET NULL,
  option_value_id UUID REFERENCES product_option_values(id) ON DELETE SET NULL,
  price_modifier DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_product_options_product ON product_options(product_id);
CREATE INDEX IF NOT EXISTS idx_product_options_display_order ON product_options(display_order);
CREATE INDEX IF NOT EXISTS idx_product_option_values_option ON product_option_values(option_id);
CREATE INDEX IF NOT EXISTS idx_product_option_values_display_order ON product_option_values(display_order);
CREATE INDEX IF NOT EXISTS idx_order_item_options_order_item ON order_item_options(order_item_id);
CREATE INDEX IF NOT EXISTS idx_order_item_options_option ON order_item_options(option_id);

-- Trigger para atualizar updated_at em product_options
DROP TRIGGER IF EXISTS update_product_options_updated_at ON product_options;
CREATE TRIGGER update_product_options_updated_at
  BEFORE UPDATE ON product_options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_options ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para product_options
DROP POLICY IF EXISTS "Product options are viewable by everyone" ON product_options;
CREATE POLICY "Product options are viewable by everyone" ON product_options
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create product options" ON product_options;
CREATE POLICY "Anyone can create product options" ON product_options
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update product options" ON product_options;
CREATE POLICY "Anyone can update product options" ON product_options
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete product options" ON product_options;
CREATE POLICY "Anyone can delete product options" ON product_options
  FOR DELETE
  TO authenticated, anon
  USING (true);

-- Políticas RLS para product_option_values
DROP POLICY IF EXISTS "Product option values are viewable by everyone" ON product_option_values;
CREATE POLICY "Product option values are viewable by everyone" ON product_option_values
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create product option values" ON product_option_values;
CREATE POLICY "Anyone can create product option values" ON product_option_values
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update product option values" ON product_option_values;
CREATE POLICY "Anyone can update product option values" ON product_option_values
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete product option values" ON product_option_values;
CREATE POLICY "Anyone can delete product option values" ON product_option_values
  FOR DELETE
  TO authenticated, anon
  USING (true);

-- Políticas RLS para order_item_options
DROP POLICY IF EXISTS "Order item options are viewable by everyone" ON order_item_options;
CREATE POLICY "Order item options are viewable by everyone" ON order_item_options
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create order item options" ON order_item_options;
CREATE POLICY "Anyone can create order item options" ON order_item_options
  FOR INSERT WITH CHECK (true);


