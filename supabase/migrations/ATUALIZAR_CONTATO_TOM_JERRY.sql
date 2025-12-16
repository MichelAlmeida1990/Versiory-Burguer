-- ============================================
-- ATUALIZAR INFORMAÇÕES DE CONTATO TOM & JERRY
-- ============================================

-- Adicionar campos de contato na tabela restaurant_settings se não existirem
DO $$ 
BEGIN
  -- address
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurant_settings' AND column_name = 'address'
  ) THEN
    ALTER TABLE restaurant_settings ADD COLUMN address TEXT;
  END IF;
  
  -- phone_1
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurant_settings' AND column_name = 'phone_1'
  ) THEN
    ALTER TABLE restaurant_settings ADD COLUMN phone_1 VARCHAR(20);
  END IF;
  
  -- phone_2
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurant_settings' AND column_name = 'phone_2'
  ) THEN
    ALTER TABLE restaurant_settings ADD COLUMN phone_2 VARCHAR(20);
  END IF;
  
  -- phone_3
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurant_settings' AND column_name = 'phone_3'
  ) THEN
    ALTER TABLE restaurant_settings ADD COLUMN phone_3 VARCHAR(20);
  END IF;
  
  -- instagram
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurant_settings' AND column_name = 'instagram'
  ) THEN
    ALTER TABLE restaurant_settings ADD COLUMN instagram VARCHAR(255);
  END IF;
  
  -- facebook
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurant_settings' AND column_name = 'facebook'
  ) THEN
    ALTER TABLE restaurant_settings ADD COLUMN facebook TEXT;
  END IF;
END $$;

-- Atualizar informações do Tom & Jerry
UPDATE restaurant_settings
SET 
  address = 'Rua Valdir Gil Da Silva, 285 - Parque Indaia, Rio Grande da Serra - SP',
  phone_1 = '(11) 4820-3123',
  phone_2 = '(11) 4821-7128',
  phone_3 = '(11) 96905-4541',
  instagram = '@pizzariatomejerry',
  facebook = 'Curta nossa página!'
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com');

-- Verificar atualização
SELECT 
    restaurant_name,
    address,
    phone_1,
    phone_2,
    phone_3,
    instagram,
    facebook
FROM restaurant_settings
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com');

