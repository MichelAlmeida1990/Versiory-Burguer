# Como Criar Usuário Admin

## Método 1: Via Supabase Dashboard (Recomendado)

1. Acesse o **Supabase Dashboard**
2. Vá em **Authentication** > **Users**
3. Clique em **Add User** (ou "Add user" / "Adicionar usuário")
4. Preencha:
   - **Email**: `admin@restaurante.com`
   - **Password**: `admin123` (ou a senha que preferir)
   - **Auto Confirm User**: ✅ (marcar)
5. Clique em **Create User**

6. Depois, execute o script SQL `CRIAR_ADMIN.sql` no SQL Editor para criar o perfil

## Método 2: Via API/Script (Futuro)

Você pode criar uma página admin para criar usuários, mas por enquanto use o Método 1.

## Credenciais Padrão

- **Email**: `admin@restaurante.com`
- **Senha**: `admin123` (ou a que você definir)

**⚠️ IMPORTANTE**: Altere a senha após o primeiro login!

## Após Criar o Usuário

Execute o script `supabase/CRIAR_ADMIN.sql` para criar o perfil com role 'admin'.

