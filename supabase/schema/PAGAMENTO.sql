-- ============================================
-- ESTRUTURA DE PAGAMENTO
-- ============================================
-- Sistema preparado para receber pagamentos via link e PIX QR Code
-- Quando tiver as credenciais/configurações, só precisará preencher os campos

-- Tabela de configurações de pagamento por restaurante
CREATE TABLE IF NOT EXISTS payment_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Gateway de pagamento (mercadopago, pagarme, asaas, etc)
  gateway VARCHAR(50) DEFAULT NULL,
  
  -- Credenciais do gateway (armazenar criptografado em produção)
  api_key TEXT DEFAULT NULL,
  api_secret TEXT DEFAULT NULL,
  public_key TEXT DEFAULT NULL,
  
  -- Configurações específicas
  pix_key TEXT DEFAULT NULL, -- Chave PIX do restaurante
  pix_key_type VARCHAR(20) DEFAULT NULL, -- CPF, CNPJ, EMAIL, RANDOM
  webhook_url TEXT DEFAULT NULL,
  
  -- Status
  enabled BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_payment_configurations_restaurant_id ON payment_configurations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_payment_configurations_enabled ON payment_configurations(enabled);

-- Comentários
COMMENT ON TABLE payment_configurations IS 'Configurações de pagamento por restaurante';
COMMENT ON COLUMN payment_configurations.gateway IS 'Gateway utilizado (mercadopago, pagarme, asaas, etc)';
COMMENT ON COLUMN payment_configurations.enabled IS 'Se o pagamento online está habilitado para este restaurante';

-- Tabela de transações de pagamento
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Valor do pagamento
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  
  -- Método de pagamento
  payment_method VARCHAR(20) NOT NULL, -- pix, card, cash
  payment_type VARCHAR(20) NOT NULL, -- link, qrcode
  
  -- Dados do gateway
  gateway VARCHAR(50) DEFAULT NULL,
  gateway_transaction_id VARCHAR(255) DEFAULT NULL, -- ID da transação no gateway
  gateway_payment_id VARCHAR(255) DEFAULT NULL, -- ID do pagamento no gateway
  
  -- Links e QR Codes
  payment_link TEXT DEFAULT NULL, -- Link para pagamento
  qr_code TEXT DEFAULT NULL, -- QR Code em base64 ou URL
  qr_code_pix TEXT DEFAULT NULL, -- Código PIX copia e cola
  qr_code_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  
  -- Status do pagamento
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, cancelled, expired
  
  -- Metadata adicional
  metadata JSONB DEFAULT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_restaurant_id ON payment_transactions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_transaction_id ON payment_transactions(gateway_transaction_id);

-- Comentários
COMMENT ON TABLE payment_transactions IS 'Transações de pagamento dos pedidos';
COMMENT ON COLUMN payment_transactions.qr_code IS 'QR Code em base64 ou URL para exibir';
COMMENT ON COLUMN payment_transactions.qr_code_pix IS 'Código PIX copia e cola (EMV)';

-- Adicionar campos de pagamento na tabela orders (se ainda não existirem)
DO $$ 
BEGIN
  -- payment_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
  END IF;
  
  -- payment_transaction_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_transaction_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_transaction_id UUID REFERENCES payment_transactions(id);
  END IF;
END $$;

-- Políticas RLS
ALTER TABLE payment_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Política: Restaurante só vê/edita suas próprias configurações
DROP POLICY IF EXISTS "Restaurants can manage own payment config" ON payment_configurations;
CREATE POLICY "Restaurants can manage own payment config"
  ON payment_configurations
  FOR ALL
  USING (restaurant_id = auth.uid())
  WITH CHECK (restaurant_id = auth.uid());

-- Política: Restaurante só vê suas próprias transações
DROP POLICY IF EXISTS "Restaurants can view own transactions" ON payment_transactions;
CREATE POLICY "Restaurants can view own transactions"
  ON payment_transactions
  FOR SELECT
  USING (restaurant_id = auth.uid());

-- Política: Permitir leitura pública de transações por order_id (para verificar pagamento)
DROP POLICY IF EXISTS "Public can view transaction by order" ON payment_transactions;
CREATE POLICY "Public can view transaction by order"
  ON payment_transactions
  FOR SELECT
  USING (true); -- Temporariamente público para permitir verificar status de pagamento




