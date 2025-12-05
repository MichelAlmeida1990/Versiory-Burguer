CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_fee DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
  free_delivery_threshold DECIMAL(10, 2) DEFAULT NULL,
  min_distance DECIMAL(10, 2) DEFAULT 0,
  max_distance DECIMAL(10, 2) DEFAULT NULL,
  cep_prefixes TEXT[] DEFAULT ARRAY[]::TEXT[],
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  default_fee DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
  free_delivery_min_amount DECIMAL(10, 2) DEFAULT 50.00,
  distance_calculation_enabled BOOLEAN DEFAULT false,
  manual_fee_allowed BOOLEAN DEFAULT true,
  currency VARCHAR(10) DEFAULT 'BRL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO delivery_settings (id, default_fee, free_delivery_min_amount, manual_fee_allowed)
VALUES (
  gen_random_uuid(),
  5.00,
  50.00,
  true
)
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_delivery_zones_active ON delivery_zones(active);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_display_order ON delivery_zones(display_order);

DROP TRIGGER IF EXISTS update_delivery_zones_updated_at ON delivery_zones;
CREATE TRIGGER update_delivery_zones_updated_at
  BEFORE UPDATE ON delivery_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_delivery_settings_updated_at ON delivery_settings;
CREATE TRIGGER update_delivery_settings_updated_at
  BEFORE UPDATE ON delivery_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Delivery zones are viewable by everyone" ON delivery_zones;
CREATE POLICY "Delivery zones are viewable by everyone" ON delivery_zones
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create delivery zones" ON delivery_zones;
CREATE POLICY "Anyone can create delivery zones" ON delivery_zones
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update delivery zones" ON delivery_zones;
CREATE POLICY "Anyone can update delivery zones" ON delivery_zones
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete delivery zones" ON delivery_zones;
CREATE POLICY "Anyone can delete delivery zones" ON delivery_zones
  FOR DELETE TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Delivery settings are viewable by everyone" ON delivery_settings;
CREATE POLICY "Delivery settings are viewable by everyone" ON delivery_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create delivery settings" ON delivery_settings;
CREATE POLICY "Anyone can create delivery settings" ON delivery_settings
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update delivery settings" ON delivery_settings;
CREATE POLICY "Anyone can update delivery settings" ON delivery_settings
  FOR UPDATE USING (true);

