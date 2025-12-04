CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created ON order_status_history(created_at DESC);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Order status history is viewable by everyone" ON order_status_history;
CREATE POLICY "Order status history is viewable by everyone" ON order_status_history
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create order status history" ON order_status_history;
CREATE POLICY "Anyone can create order status history" ON order_status_history
  FOR INSERT WITH CHECK (true);





