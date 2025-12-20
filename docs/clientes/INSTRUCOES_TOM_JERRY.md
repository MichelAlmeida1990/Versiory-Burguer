# 🍕 Como Criar a Pizzaria Tom & Jerry

Este guia mostra como configurar a pizzaria Tom & Jerry no sistema.

## 📋 Pré-requisitos

- Acesso ao Supabase Dashboard
- Permissões para criar usuários no Supabase Auth

## 🚀 Passo a Passo

### 1. Criar o Usuário no Supabase Auth

1. Acesse o **Supabase Dashboard**
2. Vá em **Authentication** > **Users**
3. Clique em **"Add user"** ou **"Invite user"**
4. Preencha:
   - **Email**: `tomjerry@gmail.com`
   - **Password**: (defina uma senha)
   - **Auto Confirm User**: ✅ (marque esta opção)
5. Clique em **"Create user"** ou **"Send invitation"**

### 2. Executar o Script SQL (Opcional - apenas para verificar)

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Abra o arquivo: `supabase/CRIAR_PIZZARIA_TOM_JERRY.sql`
4. Copie todo o conteúdo do arquivo
5. Cole no SQL Editor do Supabase
6. Clique em **"Run"** ou pressione `Ctrl+Enter`
7. O script apenas verifica se o usuário está configurado (não copia dados)

### 3. Verificar se Funcionou

Execute o script de verificação:

1. Abra o arquivo: `supabase/VERIFICAR_TOM_JERRY.sql`
2. Copie e execute no SQL Editor
3. Verifique se mostra:
   - ✅ Usuário encontrado
   - ✅ Categorias e produtos copiados

### 4. Fazer Login no Admin

1. Acesse: `http://seu-dominio.com/admin/login`
2. Faça login com:
   - **Email**: `tomjerry@gmail.com`
   - **Senha**: (a senha que você definiu)
3. Você já verá todos os produtos e categorias copiados!

## ✅ O que o Script Faz

O script `CRIAR_PIZZARIA_TOM_JERRY.sql`:

1. ✅ Verifica se o usuário `tomjerry@gmail.com` existe
2. ✅ Mostra o status atual (categorias e produtos existentes)
3. ✅ **NÃO copia produtos ou categorias antigas** - você cria do zero pelo admin

## 🎯 Após a Configuração

Uma vez que o usuário estiver criado, o restaurante Tom & Jerry:

- ✅ Terá seus próprios produtos isolados (não compartilha com outros restaurantes)
- ✅ Terá suas próprias categorias isoladas
- ✅ Poderá receber pedidos (que aparecerão apenas no admin dele)
- ✅ Poderá criar e gerenciar seus produtos e categorias pelo admin
- ⚠️ **NÃO terá produtos/categorias copiados** - você cria tudo do zero pelo admin

## 🔍 Troubleshooting

### Erro: "Usuário não encontrado"

- Verifique se o usuário foi criado no Supabase Auth
- Confirme que o email está correto: `tomjerry@gmail.com`

### Erro: "Já possui dados"

- Se já executou o script antes, pode executar novamente
- O script verifica duplicatas e não cria produtos/categorias duplicados

### Não aparecem produtos no admin

- Execute o script `VERIFICAR_TOM_JERRY.sql` para diagnosticar
- Verifique se os produtos foram copiados corretamente
- Confirme que está logado com `tomjerry@gmail.com`

## 🔐 Redefinir Senha (Se Esqueceu)

Se você esqueceu a senha do admin Tom & Jerry:

**📖 Guia Completo**: Veja `docs/configuracao/REDEFINIR_SENHA_TOM_JERRY.md`

**Método Rápido (Dashboard):**
1. Acesse o **Supabase Dashboard**
2. Vá em **Authentication** > **Users**
3. Encontre `tomjerry@gmail.com`
4. Clique nos **três pontos** (⋯) > **"Reset Password"** ou **"Update Password"**
5. Defina a nova senha
6. Teste o login

**⚠️ Importante**: O usuário não será excluído - apenas a senha será atualizada, mantendo todos os IDs e relacionamentos intactos.

## 📞 Suporte

Se encontrar problemas, verifique:
1. Se o usuário existe no Supabase Auth
2. Se o script foi executado completamente (verificar mensagens de sucesso)
3. Execute o script de verificação para ver o status atual

