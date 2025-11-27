# 🚀 Guia Completo de Configuração do Supabase

## Passo 1: Criar Conta no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em **"Start your project"** ou **"Sign Up"**
3. Faça login com GitHub, Google ou e-mail
4. É **100% GRATUITO** para começar!

## Passo 2: Criar Novo Projeto

1. Após fazer login, clique em **"New Project"**
2. Preencha os dados:
   - **Name**: `restaurante-demo` (ou qualquer nome)
   - **Database Password**: Crie uma senha forte (anote ela!)
   - **Region**: Escolha a região mais próxima (ex: `South America`)
   - **Pricing Plan**: Free (gratuito)
3. Clique em **"Create new project"**
4. Aguarde alguns minutos enquanto o projeto é criado (2-3 minutos)

## Passo 3: Executar o Script SQL

1. No painel do Supabase, clique em **"SQL Editor"** no menu lateral
2. Clique em **"New query"**
3. Abra o arquivo `supabase/COMPLETO.sql` do projeto
4. **Copie TODO o conteúdo** do arquivo
5. **Cole no SQL Editor** do Supabase
6. Clique em **"Run"** ou pressione `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
7. Aguarde a execução (deve aparecer "Success" em verde)

## Passo 4: Verificar se Funcionou

1. No menu lateral, clique em **"Table Editor"**
2. Você deve ver 4 tabelas:
   - ✅ `categories` - Com 4 categorias
   - ✅ `products` - Com vários produtos
   - ✅ `orders` - Vazia (será preenchida quando houver pedidos)
   - ✅ `order_items` - Vazia (será preenchida quando houver pedidos)

3. Clique em `categories` e verifique se há 4 categorias:
   - Entradas
   - Pratos Principais
   - Bebidas
   - Sobremesas

4. Clique em `products` e verifique se há produtos cadastrados

## Passo 5: Obter Credenciais do Supabase

1. No menu lateral, clique em **"Project Settings"** (ícone de engrenagem)
2. Clique em **"API"** no menu lateral
3. Você verá duas informações importantes:

   **Project URL**: Algo como `https://xxxxxxxxxxxxx.supabase.co`
   - Copie essa URL

   **anon public key**: Uma chave longa começando com `eyJ...`
   - Clique no ícone de copiar ao lado da chave
   - Copie essa chave

## Passo 6: Configurar Variáveis de Ambiente

1. No projeto, crie o arquivo `.env.local` na raiz (se ainda não existir)
2. Adicione as seguintes linhas:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**Substitua:**
- `https://seu-projeto.supabase.co` pela URL que você copiou
- `sua-chave-anon-aqui` pela chave anon que você copiou

**Exemplo:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.1234567890abcdefghijklmnopqrstuvwxyz
```

## Passo 7: Testar o Sistema

1. No terminal, execute:
```bash
npm install
```

2. Inicie o servidor:
```bash
npm run dev
```

3. Acesse [http://localhost:3000](http://localhost:3000)

4. Teste:
   - ✅ Acesse `/cardapio` - Deve mostrar os produtos
   - ✅ Adicione produtos ao carrinho
   - ✅ Acesse `/carrinho` - Deve mostrar os itens
   - ✅ Acesse `/admin` - Deve mostrar o painel administrativo

## ✅ Pronto!

Se tudo funcionou, seu sistema está configurado e pronto para uso!

## 🔧 Troubleshooting (Solução de Problemas)

### Erro: "Invalid API key"
- Verifique se copiou a chave correta (anon key, não service_role)
- Verifique se não há espaços extras no `.env.local`
- Reinicie o servidor após alterar `.env.local`

### Erro: "Failed to fetch"
- Verifique se o projeto Supabase está ativo
- Verifique se a URL está correta
- Verifique sua conexão com a internet

### Tabelas não aparecem
- Verifique se executou o script SQL completo
- Verifique se não houve erros na execução
- Tente executar o script novamente

### Produtos não aparecem
- Verifique se as categorias foram criadas primeiro
- Verifique se os produtos têm `category_id` válido
- Verifique se `available = true` nos produtos

## 📞 Precisa de Ajuda?

- Documentação Supabase: [https://supabase.com/docs](https://supabase.com/docs)
- Verifique os logs do console do navegador (F12)
- Verifique os logs do terminal onde o servidor está rodando

