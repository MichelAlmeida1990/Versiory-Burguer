DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@restaurante.com'
  LIMIT 1;

  IF admin_user_id IS NULL THEN
    RAISE NOTICE 'Usuário admin@restaurante.com não encontrado na tabela auth.users.';
    RAISE NOTICE 'Por favor, crie o usuário manualmente no Supabase Dashboard:';
    RAISE NOTICE '1. Vá em Authentication > Users > Add User';
    RAISE NOTICE '2. Email: admin@restaurante.com';
    RAISE NOTICE '3. Senha: admin123 (ou a que preferir)';
    RAISE NOTICE '4. Depois execute novamente este script para criar o perfil.';
  ELSE
    INSERT INTO user_profiles (
      id,
      email,
      name,
      role,
      phone
    ) VALUES (
      admin_user_id,
      'admin@restaurante.com',
      'Administrador',
      'admin',
      NULL
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      name = 'Administrador',
      email = 'admin@restaurante.com';
    
    RAISE NOTICE 'Perfil de administrador criado/atualizado com sucesso!';
  END IF;
END $$;

