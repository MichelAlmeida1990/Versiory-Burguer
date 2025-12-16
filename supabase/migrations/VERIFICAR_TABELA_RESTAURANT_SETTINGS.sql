-- ============================================
-- VERIFICAR SE A TABELA restaurant_settings EXISTE
-- ============================================

-- Verificar se a tabela existe
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'restaurant_settings';

-- Se a tabela existir, mostrar estrutura
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'restaurant_settings'
ORDER BY ordinal_position;

-- Verificar se há políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'restaurant_settings'
ORDER BY policyname;

-- Verificar constraints (UNIQUE, PRIMARY KEY, etc)
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'restaurant_settings';



