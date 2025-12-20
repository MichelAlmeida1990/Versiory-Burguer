# 🔐 Como Redefinir a Senha do Admin Tom & Jerry

## ⚠️ Situação
- **Email**: `tomjerry@gmail.com`
- **ID do Usuário**: `cf7134f8-1ca9-4bbf-b6bc-da0e8b501baa`
- **Problema**: Senha esquecida e email genérico (não pode usar recuperação por email)
- **Importante**: Não queremos excluir o usuário porque os IDs estão ligados a ele

## ✅ Solução: Redefinir Senha pelo Supabase Dashboard

### Método 1: Pelo Dashboard (Recomendado)

1. **Acesse o Supabase Dashboard**
   - Vá para: https://app.supabase.com
   - Faça login na sua conta

2. **Navegue até Authentication**
   - No menu lateral, clique em **Authentication**
   - Clique em **Users**

3. **Encontre o Usuário**
   - Procure por `tomjerry@gmail.com` na lista
   - Ou filtre pelo ID: `cf7134f8-1ca9-4bbf-b6bc-da0e8b501baa`

4. **Redefina a Senha**
   - Clique nos **três pontos** (⋯) ao lado do usuário
   - Selecione **"Reset Password"** ou **"Update Password"**
   - Digite a nova senha
   - Confirme a nova senha
   - Clique em **"Update"** ou **"Save"**

5. **Teste o Login**
   - Acesse: `http://seu-dominio.com/admin/login`
   - Email: `tomjerry@gmail.com`
   - Senha: (a nova senha que você definiu)

---

### Método 2: Usando SQL (Avançado)

⚠️ **ATENÇÃO**: Este método requer acesso ao SQL Editor e conhecimento técnico.

O Supabase armazena senhas com hash bcrypt, então não podemos simplesmente atualizar via SQL. O método recomendado é usar o Dashboard ou a API Admin.

---

### Método 3: Usando Supabase Admin API (Programático)

Se você precisa automatizar isso, pode usar a API Admin do Supabase:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⚠️ Use SERVICE_ROLE_KEY, não ANON_KEY
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Redefinir senha do usuário
const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
  'cf7134f8-1ca9-4bbf-b6bc-da0e8b501baa',
  { password: 'NOVA_SENHA_AQUI' }
)

if (error) {
  console.error('Erro ao redefinir senha:', error)
} else {
  console.log('Senha redefinida com sucesso!')
}
```

⚠️ **IMPORTANTE**: 
- Use a `SERVICE_ROLE_KEY` (nunca exponha isso no frontend!)
- Esta chave tem acesso total ao banco de dados
- Guarde-a com segurança

---

## 📝 Após Redefinir a Senha

1. **Anote a Nova Senha**
   - Guarde em local seguro (gerenciador de senhas)
   - Evite usar senhas genéricas

2. **Teste o Acesso**
   - Faça login no admin
   - Verifique se consegue acessar produtos, pedidos, etc.

3. **Verifique os Dados**
   - Confirme que todos os produtos estão visíveis
   - Verifique se os pedidos estão aparecendo
   - Teste criar/editar um produto

---

## 🔍 Verificação

Para verificar se o usuário está funcionando corretamente após redefinir a senha:

```sql
-- Verificar usuário
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  confirmed_at
FROM auth.users
WHERE email = 'tomjerry@gmail.com';

-- Verificar produtos do Tom & Jerry
SELECT COUNT(*) as total_produtos
FROM products
WHERE restaurant_id = 'cf7134f8-1ca9-4bbf-b6bc-da0e8b501baa';

-- Verificar categorias do Tom & Jerry
SELECT COUNT(*) as total_categorias
FROM categories
WHERE restaurant_id = 'cf7134f8-1ca9-4bbf-b6bc-da0e8b501baa';
```

---

## ❓ Troubleshooting

### Erro: "User not found"
- Verifique se o ID do usuário está correto
- Confirme que está no projeto correto do Supabase

### Erro: "Permission denied"
- Certifique-se de estar usando a SERVICE_ROLE_KEY (não ANON_KEY)
- Verifique se tem permissões de admin no Supabase

### Senha não funciona após redefinir
- Aguarde alguns segundos (pode haver cache)
- Tente fazer logout e login novamente
- Limpe o cache do navegador

---

## 🎯 Resumo

**A forma mais simples e segura é:**
1. Acessar Supabase Dashboard
2. Ir em Authentication > Users
3. Encontrar `tomjerry@gmail.com`
4. Clicar em "Reset Password" ou "Update Password"
5. Definir nova senha
6. Testar login

**O usuário não será excluído** - apenas a senha será atualizada, mantendo todos os IDs e relacionamentos intactos.

