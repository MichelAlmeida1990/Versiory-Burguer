# 🔑 Onde Encontrar URL e Chaves do Supabase

## 📍 Localização no Supabase

### Passo 1: Acessar Project Settings
1. No painel do Supabase, clique no **ícone de engrenagem** ⚙️ no canto inferior esquerdo
2. Ou clique em **"Project Settings"** no menu lateral

### Passo 2: Ir para API
1. No menu lateral de Settings, clique em **"API"**
2. Você verá duas seções importantes:

---

## 🌐 URL do Projeto (Project URL)

**Onde encontrar:**
- Na página **API**, procure por **"Project URL"** ou **"Project URL"**
- Está na parte superior da página
- Formato: `https://xxxxxxxxxxxxx.supabase.co`

**Exemplo:**
```
https://abcdefghijklmnop.supabase.co
```

---

## 🔐 Chaves API (API Keys)

### Opção 1: Publishable Key (Recomendado)
- Na seção **"Publishable key"**
- Esta é a chave que você usa no `.env.local`
- Formato: `sb_publishable_xxxxxxxxxxxxx`
- Clique no ícone de **copiar** 📋 ao lado da chave

### Opção 2: Legacy anon key (Se não tiver Publishable)
1. Clique na aba **"Legacy anon, service_role API keys"**
2. Procure por **"anon public"** ou **"anon public key"**
3. Formato: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. Clique no ícone de **copiar** 📋

⚠️ **IMPORTANTE:** Use a chave **anon** ou **publishable**, NUNCA a **service_role** (ela tem acesso total!)

---

## 📝 Como Configurar no .env.local

Crie o arquivo `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxx
```

**OU se estiver usando Legacy:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎯 Resumo Visual

```
Supabase Dashboard
  └── ⚙️ Project Settings (canto inferior esquerdo)
      └── API (no menu lateral)
          ├── Project URL → Copiar esta URL
          └── Publishable key → Copiar esta chave
```

---

## ✅ Verificação

Após configurar, teste se está funcionando:
1. Salve o arquivo `.env.local`
2. Reinicie o servidor (`npm run dev`)
3. Acesse `/cardapio` - deve carregar os produtos do Supabase

---

## 🆘 Não encontrou?

Se não conseguir encontrar:
1. Certifique-se de estar logado no Supabase
2. Verifique se o projeto está ativo
3. Tente atualizar a página (F5)
4. Procure por "API" no menu de Settings

