# 🔧 Solução: Usuário Não Encontrado

## Problema

Quando você executa a função, aparece erro dizendo que o usuário não foi encontrado, mesmo tendo criado no Supabase Auth.

## 🔍 Diagnóstico

### Passo 1: Verificar se o usuário existe

Execute no Supabase SQL Editor:

```sql
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;
```

Isso vai mostrar **TODOS** os usuários cadastrados.

### Passo 2: Verificar o email exato

O email deve ser **EXATAMENTE** como está no Supabase Auth:
- ✅ Se está `usuario@gmail.com` → use `usuario@gmail.com`
- ❌ Se está `Usuario@Gmail.Com` → use `Usuario@Gmail.Com` (com maiúsculas)
- ⚠️ O Supabase pode diferenciar maiúsculas/minúsculas dependendo da configuração

### Passo 3: Usar a função de verificação

Execute primeiro para verificar:

```sql
SELECT * FROM verificar_usuario_existe('email@exemplo.com');
```

Isso vai mostrar se o usuário existe e qual é o ID dele.

## ✅ Soluções

### Solução 1: Usar a Função Melhorada

Execute o arquivo `FUNCAO_ASSOCIAR_PRODUTOS_MELHORADA.sql` que:
- ✅ Busca o usuário de forma mais flexível
- ✅ Mostra mensagens de erro mais claras
- ✅ Verifica se o usuário existe antes de tentar copiar

### Solução 2: Verificar Email Manualmente

1. Abra o Supabase Dashboard
2. Vá em **Authentication** → **Users**
3. Veja o email **EXATO** do usuário
4. Copie e cole no SQL:

```sql
SELECT * FROM associar_produtos_antigos_a_usuario('EMAIL_EXATO_AQUI');
```

### Solução 3: Usar o ID do Usuário Diretamente

Se a função não funcionar, você pode associar produtos diretamente pelo ID:

```sql
-- 1. Pegar o ID do usuário
SELECT id, email FROM auth.users WHERE email = 'email@exemplo.com';

-- 2. Usar o ID diretamente (substitua UUID_AQUI pelo ID que apareceu)
UPDATE products 
SET restaurant_id = 'UUID_AQUI'
WHERE restaurant_id IS NULL;
```

**⚠️ CUIDADO:** Isso vai associar TODOS os produtos sem `restaurant_id` para esse usuário. Use apenas se souber o que está fazendo.

## 🎯 Passo a Passo Recomendado

### 1. Execute o Diagnóstico

```sql
-- Ver todos os usuários
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;
```

### 2. Use a Função de Verificação

```sql
SELECT * FROM verificar_usuario_existe('email@exemplo.com');
```

### 3. Se o usuário existir, use a função melhorada

```sql
SELECT * FROM associar_produtos_antigos_a_usuario('email@exemplo.com');
```

## ❓ Problemas Comuns

### Problema 1: "Usuário não encontrado"
**Causa:** Email digitado errado ou com maiúsculas/minúsculas diferentes  
**Solução:** Copie o email EXATO do Supabase Auth

### Problema 2: "Permission denied"
**Causa:** A função não tem permissão para acessar `auth.users`  
**Solução:** Execute `FUNCAO_ASSOCIAR_PRODUTOS_MELHORADA.sql` que usa `SECURITY DEFINER`

### Problema 3: "Function does not exist"
**Causa:** A função não foi criada ainda  
**Solução:** Execute primeiro `FUNCAO_ASSOCIAR_PRODUTOS_MELHORADA.sql`

## 📝 Exemplo Completo

```sql
-- 1. Verificar se usuário existe
SELECT * FROM verificar_usuario_existe('novousuario@gmail.com');

-- 2. Se existir, associar produtos
SELECT * FROM associar_produtos_antigos_a_usuario('novousuario@gmail.com');

-- 3. Verificar resultado
SELECT COUNT(*) as total_produtos 
FROM products 
WHERE restaurant_id = (SELECT id FROM auth.users WHERE email = 'novousuario@gmail.com');
```

## 🚀 Próximos Passos

1. Execute `FUNCAO_ASSOCIAR_PRODUTOS_MELHORADA.sql` (versão melhorada)
2. Execute `DIAGNOSTICO_USUARIO_NAO_ENCONTRADO.sql` para verificar
3. Use a função de verificação antes de associar produtos
4. Se ainda não funcionar, me envie o resultado do diagnóstico

