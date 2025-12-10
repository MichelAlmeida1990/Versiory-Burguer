# Como Criar Usuários para Testar o Sistema Multi-Tenant

## 📋 Métodos para Criar Usuários

### **Método 1: Via Painel do Supabase (Recomendado)**

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Authentication** → **Users** (no menu lateral)
4. Clique no botão **"Add user"** ou **"Invite user"** (canto superior direito)
5. Preencha o formulário:
   - **Email**: exemplo: `batatadamaria@teste.com`
   - **Senha**: escolha uma senha (ex: `senha123`)
   - **Auto Confirm User**: ✅ **MARQUE ESTA OPÇÃO** (importante! senão precisará confirmar email)
6. Clique em **"Create user"**

**Repita o processo para criar mais usuários:**
- `churrascodojoao@teste.com` / `senha123`
- `pizzariamaria@teste.com` / `senha123`
- etc.

---

### **Método 2: Via SQL Editor (Rápido para Múltiplos Usuários)**

1. No Supabase Dashboard, vá em **SQL Editor**
2. Cole e execute o script abaixo:

```sql
-- Criar usuários de teste
-- Nota: Isso cria usuários diretamente na tabela auth.users

-- Usuário 1: Batata da Maria
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'batatadamaria@teste.com',
  crypt('senha123', gen_salt('bf')), -- Senha: senha123
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Batata da Maria"}',
  false,
  '',
  ''
);

-- Usuário 2: Churrasco do João
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'churrascodojoao@teste.com',
  crypt('senha123', gen_salt('bf')), -- Senha: senha123
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Churrasco do João"}',
  false,
  '',
  ''
);
```

**⚠️ Nota:** O método SQL é mais complexo. Recomendo usar o **Método 1** (Painel).

---

### **Método 3: Via API (Programático)**

Você pode criar usuários via código, mas isso requer configuração adicional.

---

## 🧪 Como Testar

### **1. Criar Usuários de Teste:**

Crie pelo menos 2 usuários:
- **Restaurante 1**: `batatadamaria@teste.com` / `senha123`
- **Restaurante 2**: `churrascodojoao@teste.com` / `senha123`

### **2. Testar Isolamento de Dados:**

1. **Login como Batata da Maria:**
   - Acesse `/admin/login`
   - Email: `batatadamaria@teste.com`
   - Senha: `senha123`
   - Crie alguns produtos/categorias

2. **Logout e Login como Churrasco do João:**
   - Faça logout
   - Login com: `churrascodojoao@teste.com` / `senha123`
   - Crie produtos diferentes

3. **Verificar:**
   - Cada restaurante deve ver APENAS seus próprios produtos/categorias
   - Os dados devem estar isolados

### **3. Testar Demo:**

- Acesse `/demo` (sem login)
- Deve mostrar TODOS os dados (sem filtro)

---

## 📝 Dados de Teste Sugeridos

### **Restaurante 1 - Batata da Maria:**
- Email: `batatadamaria@teste.com`
- Senha: `senha123`
- Produtos: Batata Frita, Batata Recheada, Batata Doce

### **Restaurante 2 - Churrasco do João:**
- Email: `churrascodojoao@teste.com`
- Senha: `senha123`
- Produtos: Picanha, Costela, Frango

---

## ⚠️ Importante

1. **Execute o script MULTI_TENANT.sql ANTES** de criar usuários
2. **Marque "Auto Confirm User"** ao criar usuários (senão precisará confirmar email)
3. **Cada restaurante terá seu próprio ID** (UUID) que será usado como `restaurant_id`
4. **Dados antigos** (sem `restaurant_id`) aparecerão para todos (por isso a política permite `restaurant_id IS NULL`)

---

## 🔧 Troubleshooting

**Problema:** Não consigo fazer login
- Verifique se marcou "Auto Confirm User"
- Verifique se a senha está correta
- Verifique se o email está correto

**Problema:** Vejo dados de outros restaurantes
- Verifique se executou o script MULTI_TENANT.sql
- Verifique se as políticas RLS estão ativas
- Verifique se está logado com o usuário correto

**Problema:** Erro ao criar produto/categoria
- Verifique se está logado
- Verifique se o `restaurant_id` está sendo preenchido automaticamente

