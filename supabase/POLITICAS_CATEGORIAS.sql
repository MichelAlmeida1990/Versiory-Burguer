DROP POLICY IF EXISTS "Anyone can create categories" ON categories;
CREATE POLICY "Anyone can create categories" ON categories
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update categories" ON categories;
CREATE POLICY "Anyone can update categories" ON categories
  FOR UPDATE USING (true);


