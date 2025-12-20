-- Tabela para armazenar informações de fidelidade dos clientes
-- Esta tabela será vinculada ao user_id do Supabase Auth

CREATE TABLE IF NOT EXISTS customer_loyalty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  phone VARCHAR(20),
  total_stamps INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_user_id ON customer_loyalty(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_email ON customer_loyalty(email);

-- RLS Policies
ALTER TABLE customer_loyalty ENABLE ROW LEVEL SECURITY;

-- Clientes podem ver apenas seus próprios dados
CREATE POLICY "Customers can view own loyalty data"
  ON customer_loyalty FOR SELECT
  USING (auth.uid() = user_id);

-- Clientes podem atualizar seus próprios dados
CREATE POLICY "Customers can update own loyalty data"
  ON customer_loyalty FOR UPDATE
  USING (auth.uid() = user_id);

-- Sistema pode inserir/atualizar dados (via service role ou função)
CREATE POLICY "Service role can manage loyalty data"
  ON customer_loyalty FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE customer_loyalty IS 'Armazena informações de fidelidade dos clientes, vinculadas ao Supabase Auth';
COMMENT ON COLUMN customer_loyalty.user_id IS 'ID do usuário no Supabase Auth';
COMMENT ON COLUMN customer_loyalty.total_stamps IS 'Total de selos acumulados pelo cliente';
COMMENT ON COLUMN customer_loyalty.total_orders IS 'Total de pedidos realizados';
COMMENT ON COLUMN customer_loyalty.total_spent IS 'Valor total gasto pelo cliente';




