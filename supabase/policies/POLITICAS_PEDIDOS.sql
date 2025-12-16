DROP POLICY IF EXISTS "Orders can be deleted" ON orders;

CREATE POLICY "Orders can be deleted" ON orders
  FOR DELETE 
  TO authenticated, anon
  USING (true);

