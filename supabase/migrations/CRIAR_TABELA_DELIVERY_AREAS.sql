-- ============================================
-- CRIAR TABELA DE ÁREAS DE ENTREGA (BAIRROS)
-- ============================================
-- Tabela para armazenar bairros e valores de frete por restaurante

CREATE TABLE IF NOT EXISTS delivery_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city VARCHAR(255) NOT NULL,
  neighborhood VARCHAR(255) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(restaurant_id, city, neighborhood)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_delivery_areas_restaurant ON delivery_areas(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_delivery_areas_city ON delivery_areas(city);
CREATE INDEX IF NOT EXISTS idx_delivery_areas_neighborhood ON delivery_areas(neighborhood);
CREATE INDEX IF NOT EXISTS idx_delivery_areas_active ON delivery_areas(active);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_delivery_areas_updated_at
  BEFORE UPDATE ON delivery_areas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE delivery_areas IS 'Tabela de áreas de entrega (bairros) com valores de frete por restaurante';
COMMENT ON COLUMN delivery_areas.restaurant_id IS 'ID do restaurante (UUID do auth.users)';
COMMENT ON COLUMN delivery_areas.city IS 'Cidade do bairro';
COMMENT ON COLUMN delivery_areas.neighborhood IS 'Nome do bairro';
COMMENT ON COLUMN delivery_areas.delivery_fee IS 'Valor do frete para este bairro';
COMMENT ON COLUMN delivery_areas.active IS 'Se a área está ativa para entrega';

